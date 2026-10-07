# Weather or Not

A mobile-first weather PWA with personality. Get real weather data with a side of humor — choose your tone and let the quips roll.

## Features

- **Search any location** — type a city name and pick from live results powered by Open-Meteo geocoding. Results are limited to the United Kingdom, Netherlands, and Denmark.
- **Use my location** — click the "Use my location" button to fetch weather for your current position. Location permission is requested only when you click, and coordinates are never stored.
- **Current weather** — temperature, apparent ("feels like") temperature, wind speed, wind gusts, rain probability, and a plain-language weather description.
- **Clothing recommendation** — practical, rule-based advice on what to wear, generated from the current conditions (separate from the humorous text).
- **Next 24 hours** — a horizontally scrollable hourly forecast.
- **7-day forecast** — daily highs, lows, conditions, and rain chance.
- **Humour selector** — four deterministic tones with no AI APIs:
  - **Playful** 😄 — cheerful and fun
  - **Witty** 😎 — clever and smart
  - **Sarcastic** 🙄 — dry and eye-rolly
  - **Brutal** 💀 — harsh and unforgiving

The humour is fully deterministic: the same weather conditions and tone always produce the same quip. It uses a seeded hash of the temperature, wind, and rain values to pick from a curated bank of lines — no API calls, no randomness across reloads.

## PWA Features

- Installable on mobile and desktop (web app manifest + service worker via `vite-plugin-pwa`).
- Static assets are precached for offline use.
- Open-Meteo API requests use **network-first caching** — fresh data is always preferred, but cached data is shown when offline.
- Cached weather is never shown as "current" — a banner clearly states when data is from cache and when it was last updated.
- Weather cache expires after 30 minutes.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** build tool
- **vite-plugin-pwa** for service worker and manifest
- **Open-Meteo API** for weather and geocoding (no API key required)

## Getting Started

```bash
npm install
npm run dev      # local development
npm run build    # production build
npm run preview  # production preview
```

## Project Structure

```
src/
├── main.tsx                    # App entry point
├── App.tsx                     # Main app component
├── types.ts                    # TypeScript type definitions
├── services/
│   ├── weatherService.ts       # Open-Meteo API calls + weather code mapping
│   ├── humourService.ts        # Deterministic humour generation
│   └── clothingService.ts      # Rule-based clothing recommendations
├── components/
│   ├── SearchBar.tsx           # Location search with autocomplete + geolocation
│   ├── HumourSelector.tsx      # Tone picker (playful/witty/sarcastic/brutal)
│   ├── CurrentWeather.tsx      # Current conditions + humour quip + clothing
│   ├── HourlyForecast.tsx      # 24-hour scrollable forecast
│   └── DailyForecast.tsx       # 7-day forecast
└── styles/
    └── global.css              # Mobile-first responsive styles
```

## Data Source

All weather data comes from [Open-Meteo](https://open-meteo.com/), a free weather API that requires no API key.
