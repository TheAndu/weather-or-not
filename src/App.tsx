import { useCallback, useEffect, useState } from 'react';
import type { GeoLocation, HumourMode, WeatherBundle } from './types';
import { fetchWeather, reverseGeocode } from './services/weatherService';
import { generateQuip } from './services/humourService';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import HumourSelector from './components/HumourSelector';

const DEFAULT_LOCATION: GeoLocation = {
  id: 2643743,
  name: 'London',
  latitude: 51.5085,
  longitude: -0.1257,
  country: 'United Kingdom',
  admin1: 'England',
  timezone: 'Europe/London',
};

export default function App() {
  const [humour, setHumour] = useState<HumourMode>('witty');
  const [bundle, setBundle] = useState<WeatherBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const loadWeather = useCallback(async (loc: GeoLocation) => {
    setLoading(true);
    setError(null);
    try {
      const weather = await fetchWeather(loc.latitude, loc.longitude);
      setBundle({ location: loc, weather, fetchedAt: Date.now(), fromCache: false });
    } catch (e) {
      if (bundle) {
        setBundle({ ...bundle, fromCache: true });
        setError(null);
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load weather');
      }
    } finally {
      setLoading(false);
    }
  }, [bundle]);

  useEffect(() => {
    void loadWeather(DEFAULT_LOCATION);
  }, [loadWeather]);

  const handleSelect = useCallback(
    (loc: GeoLocation) => {
      void loadWeather(loc);
    },
    [loadWeather],
  );

  const handleUseMyLocation = useCallback(() => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Use the search bar instead.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          if (loc) {
            void loadWeather(loc);
          } else {
            const fallback: GeoLocation = {
              id: -1,
              name: 'Current location',
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              country: '',
            };
            void loadWeather(fallback);
          }
        } catch {
          setGeoError('Could not determine your city from your location. Try searching instead.');
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location permission denied. You can still search for a city manually.');
        } else {
          setGeoError('Could not get your location. Try searching for a city instead.');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, [loadWeather]);

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

      <SearchBar
        onSelect={handleSelect}
        onUseMyLocation={handleUseMyLocation}
        loading={loading}
        geoLoading={geoLoading}
        geoError={geoError}
      />

      <HumourSelector value={humour} onChange={setHumour} />

      {error && <div className="error-banner">{error}</div>}

      {loading && !bundle && <div className="loading">Loading weather…</div>}

      {!loading && !bundle && !error && (
        <div className="empty-state">
          <span className="empty-icon">🌦️</span>
          <p>Search for a city or use your location to see the weather.</p>
        </div>
      )}

      {bundle && (
        <main className="weather-main">
          <CurrentWeather
            bundle={bundle}
            quip={quip}
            humour={humour}
            fromCache={bundle.fromCache}
            fetchedAt={bundle.fetchedAt}
          />
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
