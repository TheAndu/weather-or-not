# Weather or Not

A mobile-first weather PWA with personality. Get real weather data with a side of humor — choose your tone and let the quips roll.

## Features

- **Search any location** — type a city name and pick from live results powered by Open-Meteo geocoding.
- **Current weather** — temperature, apparent ("feels like") temperature, wind speed, wind gusts, rain probability, and a plain-language weather description.
- **Next 24 hours** — a horizontally scrollable hourly forecast.
- **7-day forecast** — daily highs, lows, conditions, and rain chance.
- **Humour selector** — four deterministic tones with no AI APIs:
  - **Playful** 😄 — cheerful and fun
  - **Witty** 😎 — clever and smart
  - **Sarcastic** 🙄 — dry and eye-rolly
  - **Brutal** 💀 — harsh and unforgiving

The humour is fully deterministic: the same weather conditions and tone always produce the same quip. It uses a seeded hash of the temperature, wind, and rain values to pick from a curated bank of lines — no API calls, no randomness across reloads.

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** build tool
- **Open-Meteo API** for weather and geocoding (no API key required)
- PWA-ready (manifest + theme color)

## Getting Started

```bash
npm install
npm run dev      # local development
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
│   └── humourService.ts        # Deterministic humour generation
├── components/
│   ├── SearchBar.tsx           # Location search with autocomplete
│   ├── HumourSelector.tsx      # Tone picker (playful/witty/sarcastic/brutal)
│   ├── CurrentWeather.tsx      # Current conditions + humour quip
│   ├── HourlyForecast.tsx      # 24-hour scrollable forecast
│   └── DailyForecast.tsx       # 7-day forecast
└── styles/
    └── global.css              # Mobile-first responsive styles
```

## Data Source

All weather data comes from [Open-Meteo](https://open-meteo.com/), a free weather API that requires no API key.
