import type { HumourMode, WeatherBundle } from '../types';
import { weatherCodeToText, weatherCodeToEmoji } from '../services/weatherService';
import { HUMOUR_EMOJI, HUMOUR_LABELS } from '../services/humourService';
import { generateClothingRecommendation } from '../services/clothingService';

interface Props {
  bundle: WeatherBundle;
  quip: string;
  humour: HumourMode;
  fromCache: boolean;
  fetchedAt: number;
}

export default function CurrentWeather({ bundle, quip, humour, fromCache, fetchedAt }: Props) {
  const { location, weather } = bundle;
  const c = weather.current;

  const locationLabel = [location.name, location.admin1, location.country]
    .filter(Boolean)
    .join(', ');

  const clothing = generateClothingRecommendation(c);

  const fetchedLabel = new Date(fetchedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <section className="current-weather card">
      <div className="current-top">
        <div className="current-loc">
          <h2>{location.name}</h2>
          <span className="current-sub">{locationLabel}</span>
        </div>
        <div className="current-emoji">{weatherCodeToEmoji(c.weatherCode, c.isDay)}</div>
      </div>

      {fromCache ? (
        <div className="cache-notice" role="status">
          <span className="cache-icon">📡</span>
          <span>
            Offline — showing cached weather from {fetchedLabel}. This may not reflect current conditions.
          </span>
        </div>
      ) : (
        <div className="updated-time">Updated at {fetchedLabel}</div>
      )}

      <div className="current-temp-row">
        <div className="current-temp">{Math.round(c.temperature)}°</div>
        <div className="current-desc">{weatherCodeToText(c.weatherCode)}</div>
      </div>

      <div className="current-quip">
        <span className="quip-badge">{HUMOUR_EMOJI[humour]} {HUMOUR_LABELS[humour]}</span>
        <p className="quip-text">{quip}</p>
      </div>

      <div className="clothing-rec card-inner">
        <h4 className="rec-title">🧥 What to wear</h4>
        <ul className="rec-items">
          {clothing.items.map((item, i) => (
            <li key={i} className="rec-item">{item}</li>
          ))}
        </ul>
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
