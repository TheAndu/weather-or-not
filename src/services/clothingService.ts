import type { ClothingRecommendation, CurrentWeather } from '../types';

export function generateClothingRecommendation(c: CurrentWeather): ClothingRecommendation {
  const items: string[] = [];
  const temp = c.apparentTemperature;
  const wind = c.windGusts;
  const rain = c.rainProbability;
  const code = c.weatherCode;

  const isSnow = code >= 71 && code <= 77;
  const isThunder = code >= 95;
  const isFog = code === 45 || code === 48;

  if (temp < 0) {
    items.push('Heavy winter coat');
    items.push('Warm hat, scarf, and gloves');
    items.push('Thermal layers');
  } else if (temp < 5) {
    items.push('Winter coat');
    items.push('Hat and gloves');
  } else if (temp < 10) {
    items.push('Warm jacket');
    items.push('Light scarf');
  } else if (temp < 15) {
    items.push('Jacket or warm sweater');
  } else if (temp < 20) {
    items.push('Light jacket or cardigan');
  } else if (temp < 25) {
    items.push('T-shirt with a light layer');
  } else if (temp < 30) {
    items.push('Light, breathable clothing');
  } else {
    items.push('Light clothing and sun protection');
    items.push('Stay hydrated');
  }

  if (rain >= 50 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    items.push('Umbrella');
    items.push('Waterproof jacket');
  } else if (rain >= 25) {
    items.push('Light rain jacket');
  }

  if (isSnow) {
    items.push('Waterproof boots');
    items.push('Warm layers');
  }

  if (wind >= 50) {
    items.push('Windproof outer layer');
  } else if (wind >= 30) {
    items.push('Windbreaker');
  }

  if (isFog) {
    items.push('Reflective or bright clothing for visibility');
  }

  if (isThunder) {
    items.push('Avoid open areas — bring a rain shell');
  }

  if (c.isDay && temp >= 20 && code <= 2) {
    items.push('Sunglasses and sunscreen');
  }

  const summary = items.join(' · ');

  return { items, summary };
}
