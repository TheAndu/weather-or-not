import type { GeoLocation, WeatherData } from '../types';

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const ALLOWED_COUNTRIES = ['United Kingdom', 'Netherlands', 'Denmark'];

const WEATHER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

const weatherCache = new Map<string, CacheEntry>();
const inflightWeather = new Map<string, Promise<WeatherData>>();

function cacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
}

export async function searchLocations(query: string): Promise<GeoLocation[]> {
  if (!query.trim()) return [];
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=20&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
  const data = await res.json();
  if (!data.results) return [];
  const mapped: GeoLocation[] = data.results.map((r: Record<string, unknown>) => ({
    id: r.id as number,
    name: r.name as string,
    latitude: r.latitude as number,
    longitude: r.longitude as number,
    country: (r.country as string) ?? '',
    admin1: (r.admin1 as string) ?? undefined,
    timezone: (r.timezone as string) ?? undefined,
  }));
  return mapped.filter((loc) => ALLOWED_COUNTRIES.includes(loc.country));
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoLocation | null> {
  const url = `${GEOCODE_URL}?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Reverse geocoding failed (${res.status})`);
  const data = await res.json();
  if (!data.results || data.results.length === 0) return null;
  const r = data.results[0] as Record<string, unknown>;
  return {
    id: r.id as number,
    name: (r.name as string) ?? 'Current location',
    latitude: r.latitude as number,
    longitude: r.longitude as number,
    country: (r.country as string) ?? '',
    admin1: (r.admin1 as string) ?? undefined,
    timezone: (r.timezone as string) ?? undefined,
  };
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const key = cacheKey(lat, lon);

  const cached = weatherCache.get(key);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL) {
    return cached.data;
  }

  const existing = inflightWeather.get(key);
  if (existing) return existing;

  const promise = doFetchWeather(lat, lon)
    .then((data) => {
      weatherCache.set(key, { data, timestamp: Date.now() });
      inflightWeather.delete(key);
      return data;
    })
    .catch((err) => {
      inflightWeather.delete(key);
      throw err;
    });

  inflightWeather.set(key, promise);
  return promise;
}

async function doFetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'wind_speed_10m',
      'wind_gusts_10m',
      'rain',
      'precipitation_probability',
      'weather_code',
      'is_day',
    ].join(','),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'weather_code',
      'wind_speed_10m',
      'wind_gusts_10m',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'sunrise',
      'sunset',
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
  });

  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (res.status === 429) {
    throw new RateLimitError();
  }
  if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);
  const d = await res.json();

  const nowIdx = findNowIndex(d.hourly.time);

  return {
    timezone: d.timezone,
    current: {
      temperature: d.current.temperature_2m,
      apparentTemperature: d.current.apparent_temperature,
      windSpeed: d.current.wind_speed_10m,
      windGusts: d.current.wind_gusts_10m,
      rainProbability: d.current.precipitation_probability ?? 0,
      weatherCode: d.current.weather_code,
      isDay: d.current.is_day === 1,
      time: d.current.time,
    },
    hourly: {
      time: d.hourly.time.slice(nowIdx, nowIdx + 24),
      temperature: d.hourly.temperature_2m.slice(nowIdx, nowIdx + 24),
      apparentTemperature: d.hourly.apparent_temperature.slice(nowIdx, nowIdx + 24),
      rainProbability: d.hourly.precipitation_probability.slice(nowIdx, nowIdx + 24),
      weatherCode: d.hourly.weather_code.slice(nowIdx, nowIdx + 24),
      windSpeed: d.hourly.wind_speed_10m.slice(nowIdx, nowIdx + 24),
      windGusts: d.hourly.wind_gusts_10m.slice(nowIdx, nowIdx + 24),
    },
    daily: {
      time: d.daily.time,
      weatherCodeMax: d.daily.weather_code,
      temperatureMax: d.daily.temperature_2m_max,
      temperatureMin: d.daily.temperature_2m_min,
      rainProbability: d.daily.precipitation_probability_max,
      windSpeedMax: d.daily.wind_speed_10m_max,
      windGustsMax: d.daily.wind_gusts_10m_max,
      sunrise: d.daily.sunrise,
      sunset: d.daily.sunset,
    },
  };
}

export class RateLimitError extends Error {
  constructor() {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
  }
}

function findNowIndex(times: string[]): number {
  const now = Date.now();
  let idx = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(new Date(times[i]).getTime() - now);
    if (diff < bestDiff) {
      bestDiff = diff;
      idx = i;
    }
  }
  return idx;
}

export function weatherCodeToText(code: number): string {
  const map: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return map[code] ?? 'Unknown';
}

export function weatherCodeToEmoji(code: number, isDay = true): string {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code === 1) return isDay ? '🌤️' : '🌙';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 57) return '🌦️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 85 && code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌡️';
}

export { ALLOWED_COUNTRIES };
