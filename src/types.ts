export type HumourMode = 'playful' | 'witty' | 'sarcastic' | 'brutal';

export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  windSpeed: number;
  windGusts: number;
  rainProbability: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
}

export interface HourlyForecast {
  time: string[];
  temperature: number[];
  apparentTemperature: number[];
  rainProbability: number[];
  weatherCode: number[];
  windSpeed: number[];
  windGusts: number[];
}

export interface DailyForecast {
  time: string[];
  weatherCodeMax: number[];
  temperatureMax: number[];
  temperatureMin: number[];
  rainProbability: number[];
  windSpeedMax: number[];
  windGustsMax: number[];
  sunrise: string[];
  sunset: string[];
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
  timezone: string;
}

export interface WeatherBundle {
  location: GeoLocation;
  weather: WeatherData;
}

export interface WeatherError {
  message: string;
  code: 'fetch' | 'empty' | 'geocode';
}
