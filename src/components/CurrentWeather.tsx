import type { HumourMode, WeatherBundle } from '../types';
import { weatherCodeToText, weatherCodeToEmoji } from '../services/weatherService';
import { HUMOUR_EMOJI, HUMOUR_LABELS } from '../services/humourService';

interface Props {
  bundle: WeatherBundle;
  quip: string;
  humour: HumourMode;
}

export default function CurrentWeather({ bundle, quip, humour }: Props) {
  const { location, weather } = bundle;
  const c = weather.current;

  const locationLabel = [location.name, location.admin1, location.country]
    .filter(Boolean)
    .join(', ');

  return (
    <section className="current-weather card">
      <div className="current-top">
        <div className="current-loc">
          <h2>{location.name}</h2>
          <span className="current-sub">{locationLabel}</span>
        </div>
        <div className="current-emoji">{weatherCodeToEmoji(c.weatherCode, c.isDay)}</div>
      </div>

      <div className="current-temp-row">
        <div className="current-temp">{Math.round(c.temperature)}°</div>
        <div className="current-desc">{weatherCodeToText(c.weatherCode)}</div>
      </div>

      <div className="current-quip">
        <span className="quip-badge">{HUMOUR_EMOJI[humour]} {HUMOUR_LABELS[humour]}</span>
        <p className="quip-text">{quip}</p>
      </div>

      <div className="current-grid">
        <div className="metric">
          <span className="metric-icon">🌡️</span>
          <span className="metric-label">Feels like</span>
          <span className="metric-value">{Math.round(c.apparentTemperature)}°C</span>
        </div>
        <div className="metric">
          <span className="metric-icon">💨</span>
          <span className="metric-label">Wind</span>
          <span className="metric-value">{Math.round(c.windSpeed)} km/h</span>
        </div>
        <div className="metric">
          <span className="metric-icon">🌪️</span>
          <span className="metric-label">Gusts</span>
          <span className="metric-value">{Math.round(c.windGusts)} km/h</span>
        </div>
        <div className="metric">
          <span className="metric-icon">🌧️</span>
          <span className="metric-label">Rain chance</span>
          <span className="metric-value">{c.rainProbability}%</span>
        </div>
      </div>
    </section>
  );
}
