import type { WeatherData } from '../types';
import { weatherCodeToEmoji } from '../services/weatherService';

interface Props {
  weather: WeatherData;
}

export default function HourlyForecast({ weather }: Props) {
  const h = weather.hourly;

  return (
    <section className="hourly-forecast card">
      <h3 className="section-title">Next 24 Hours</h3>
      <div className="hourly-scroll">
        {h.time.map((time, i) => {
          const date = new Date(time);
          const isNow = i === 0;
          const hour = isNow
            ? 'Now'
            : date.toLocaleTimeString([], { hour: 'numeric' });

          return (
            <div key={time} className={`hour-cell ${isNow ? 'hour-now' : ''}`}>
              <span className="hour-time">{hour}</span>
              <span className="hour-emoji">{weatherCodeToEmoji(h.weatherCode[i], date.getHours() >= 6 && date.getHours() < 19)}</span>
              <span className="hour-temp">{Math.round(h.temperature[i])}°</span>
              <span className="hour-rain">
                {h.rainProbability[i] >= 20 ? `💧${h.rainProbability[i]}%` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
