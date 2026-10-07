import type { WeatherData } from '../types';
import { weatherCodeToEmoji, weatherCodeToText } from '../services/weatherService';

interface Props {
  weather: WeatherData;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DailyForecast({ weather }: Props) {
  const d = weather.daily;
  const today = new Date().toDateString();

  return (
    <section className="daily-forecast card">
      <h3 className="section-title">7-Day Forecast</h3>
      <div className="daily-list">
        {d.time.map((dateStr, i) => {
          const date = new Date(dateStr);
          const isToday = date.toDateString() === today;
          const dayName = isToday ? 'Today' : DAY_NAMES[date.getDay()];

          return (
            <div key={dateStr} className={`day-row ${isToday ? 'day-today' : ''}`}>
              <span className="day-name">{dayName}</span>
              <span className="day-emoji">{weatherCodeToEmoji(d.weatherCodeMax[i], true)}</span>
              <span className="day-desc">{weatherCodeToText(d.weatherCodeMax[i])}</span>
              <span className="day-rain">
                {d.rainProbability[i] >= 20 ? `💧 ${d.rainProbability[i]}%` : ''}
              </span>
              <span className="day-temps">
                <span className="temp-max">{Math.round(d.temperatureMax[i])}°</span>
                <span className="temp-min">{Math.round(d.temperatureMin[i])}°</span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
