import { useCallback, useEffect, useState } from 'react';
import type { GeoLocation, HumourMode, WeatherBundle } from './types';
import { searchLocations, fetchWeather } from './services/weatherService';
import { generateQuip } from './services/humourService';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import HumourSelector from './components/HumourSelector';

export default function App() {
  const [humour, setHumour] = useState<HumourMode>('witty');
  const [, setLocation] = useState<GeoLocation | null>(null);
  const [bundle, setBundle] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(async (loc: GeoLocation) => {
    setLoading(true);
    setError(null);
    try {
      const weather = await fetchWeather(loc.latitude, loc.longitude);
      setBundle({ location: loc, weather });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load weather');
      setBundle(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load London on first mount so the page isn't empty
  useEffect(() => {
    const loc: GeoLocation = {
      id: 2643743,
      name: 'London',
      latitude: 51.5085,
      longitude: -0.1257,
      country: 'United Kingdom',
      admin1: 'England',
      timezone: 'Europe/London',
    };
    setLocation(loc);
    void loadWeather(loc);
  }, [loadWeather]);

  const handleSelect = useCallback(
    (loc: GeoLocation) => {
      setLocation(loc);
      void loadWeather(loc);
    },
    [loadWeather],
  );

  const handleSearch = useCallback(
    async (query: string) => {
      setLoading(true);
      setError(null);
      try {
        const results = await searchLocations(query);
        return results;
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Search failed');
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const quip = bundle
    ? generateQuip({
        humour,
        tempC: bundle.weather.current.temperature,
        apparentC: bundle.weather.current.apparentTemperature,
        windSpeed: bundle.weather.current.windSpeed,
        windGusts: bundle.weather.current.windGusts,
        rainProb: bundle.weather.current.rainProbability,
        weatherCode: bundle.weather.current.weatherCode,
        weatherText: '',
      })
    : '';

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Weather or Not</h1>
        <p className="app-tagline">Weather with personality</p>
      </header>

      <SearchBar onSearch={handleSearch} onSelect={handleSelect} loading={loading} />

      <HumourSelector value={humour} onChange={setHumour} />

      {error && <div className="error-banner">{error}</div>}

      {loading && !bundle && <div className="loading">Loading weather…</div>}

      {bundle && (
        <main className="weather-main">
          <CurrentWeather bundle={bundle} quip={quip} humour={humour} />
          <HourlyForecast weather={bundle.weather} />
          <DailyForecast weather={bundle.weather} />
        </main>
      )}

      <footer className="app-footer">
        <span>Powered by Open-Meteo · No API key required</span>
      </footer>
    </div>
  );
}
