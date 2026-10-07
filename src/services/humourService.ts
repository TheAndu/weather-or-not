import type { HumourMode } from '../types';

interface HumourContext {
  humour: HumourMode;
  tempC: number;
  apparentC: number;
  windSpeed: number; // km/h
  windGusts: number; // km/h
  rainProb: number; // %
  weatherCode: number;
  weatherText: string;
}

// A small deterministic PRNG so the same weather + mode always produces
// the same quip (no AI, no randomness across reloads).
function seededString(humour: string, ...parts: (number | string)[]): number {
  let h = 2166136261;
  const str = [humour, ...parts.map(String)].join('|');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function tempCategory(tempC: number): 'freezing' | 'cold' | 'mild' | 'warm' | 'hot' {
  if (tempC < 0) return 'freezing';
  if (tempC < 10) return 'cold';
  if (tempC < 20) return 'mild';
  if (tempC < 28) return 'warm';
  return 'hot';
}

const TEMP_QUIPS: Record<HumourMode, Record<string, string[]>> = {
  playful: {
    freezing: [
      "Brrr! The penguins are living their best life out there!",
      "It's so cold the polar bears are wearing scarves.",
    ],
    cold: [
      "Time to build a snowman! Oh wait, no snow. Just cold. Cold man it is.",
      "Cold enough that your nose doubles as a personal ice-maker.",
    ],
    mild: [
      "Goldilocks weather — not too hot, not too cold, just right!",
      "Perfect temperature to exist outdoors without complaining!",
    ],
    warm: [
      "Lovely and warm — your ice cream is melting, eat faster!",
      "Sunscreen weather! The sun is giving free hugs today.",
    ],
    hot: [
      "It's a toaster oven out there! Stay hydrated, little cracker!",
      "So hot you could fry an egg on the sidewalk. Or your forehead.",
    ],
  },
  witty: {
    freezing: [
      "The temperature called. It said it's taking a personal day.",
      "Cold enough to make your shadow shiver.",
    ],
    cold: [
      "The wind has opinions today, and all of them are chilly.",
      "A brisk reminder that the sun is not your boss.",
    ],
    mild: [
      "The weather is sitting on the fence — and we respect it.",
      "Neither sweater nor shorts. Nature is feeling indecisive.",
    ],
    warm: [
      "The sun is doing the most today, and frankly, it's working.",
      "Warm enough to justify every cold drink you've ever wanted.",
    ],
    hot: [
      "The sun is not taking applications for 'moderate' today.",
      "Air conditioning has officially become a personality trait.",
    ],
  },
  sarcastic: {
    freezing: [
      "Oh wonderful, another day of questioning every life choice that led you outside.",
      "Because nothing says 'fun' like losing feeling in your extremities.",
    ],
    cold: [
      "Great. Another day where the wind thinks it's the main character.",
      "Oh joy, cold air for free. What a generous planet.",
    ],
    mild: [
      "The weather is fine. Good for you, weather. Have a cookie.",
      "Mild. How thrilling. The weather is really pushing boundaries today.",
    ],
    warm: [
      "Oh look, the sun showed up to work today. How unprecedented.",
      "Warm. Because what we really needed was more sweating.",
    ],
    hot: [
      "Fantastic. It's a furnace out there. Stay inside and rethink your choices.",
      "The sun has decided to be extra today, and we're all suffering for it.",
    ],
  },
  brutal: {
    freezing: [
      "It is brutally, unforgivingly freezing. Don't go outside unless your life depends on it.",
      "Subzero. Your face will hurt. Your soul will hurt more.",
    ],
    cold: [
      "Cold enough to ruin your whole day. Dress like you're going to war with the wind.",
      "The cold doesn't care about your feelings. And neither does the gust.",
    ],
    mild: [
      "Mild. You'll find a way to be disappointed anyway.",
      "It's fine. That's the problem. It's aggressively fine.",
    ],
    warm: [
      "It's warm. You'll still find something to complain about, won't you.",
      "Warm and pleasant. You have no excuse to be miserable today.",
    ],
    hot: [
      "It is dangerously hot. Minimize your existence outside.",
      "Boiling. The sun is not your friend today. It never was.",
    ],
  },
};

const RAIN_QUIPS: Record<HumourMode, string[]> = {
  playful: [
    "Grab your umbrella — it's going to be a splashy day!",
    "Rain is coming! Perfect weather for jumping in puddles!",
  ],
  witty: [
    "The clouds are negotiating. They may close the deal today.",
    "Rain probability says: bring a parachute, or at least an umbrella.",
  ],
  sarcastic: [
    "Oh good, a chance of rain. Because your shoes needed a wash anyway.",
    "Possible rain. Because dry hair is overrated.",
  ],
  brutal: [
    "Rain is coming. Your day is about to get worse. Prepare accordingly.",
    "High rain chance. You will get wet. You will not enjoy it.",
  ],
};

const WIND_QUIPS: Record<HumourMode, string[]> = {
  playful: [
    "Windy! Hold onto your hat — or it'll fly to the next town!",
    "The wind is doing gymnastics out there!",
  ],
  witty: [
    "The wind has a schedule today, and it does not include yours.",
    "Gusts strong enough to rearrange your hairstyle opinions.",
  ],
  sarcastic: [
    "Oh lovely, the wind is blowing. How original.",
    "Gusty conditions, because walking in a straight line is too mainstream.",
  ],
  brutal: [
    "The wind will push you around. It does not care about your plans.",
    "Strong gusts. You are lighter than you think. Stay grounded.",
  ],
};

export function generateQuip(ctx: HumourContext): string {
  const cat = tempCategory(ctx.tempC);
  const seed = seededString(
    ctx.humour,
    cat,
    Math.round(ctx.tempC),
    Math.round(ctx.windSpeed),
    Math.round(ctx.rainProb),
  );

  const tempQuips = TEMP_QUIPS[ctx.humour][cat];
  const tempQuip = pick(tempQuips, seed);

  // If rain probability is high, sometimes blend in a rain quip
  if (ctx.rainProb >= 60) {
    const rainSeed = seededString(ctx.humour, 'rain', Math.round(ctx.rainProb));
    return `${tempQuip} ${pick(RAIN_QUIPS[ctx.humour], rainSeed)}`;
  }

  // If wind is strong, sometimes blend in a wind quip
  if (ctx.windGusts >= 50) {
    const windSeed = seededString(ctx.humour, 'wind', Math.round(ctx.windGusts));
    return `${tempQuip} ${pick(WIND_QUIPS[ctx.humour], windSeed)}`;
  }

  return tempQuip;
}

export const HUMOUR_LABELS: Record<HumourMode, string> = {
  playful: 'Playful',
  witty: 'Witty',
  sarcastic: 'Sarcastic',
  brutal: 'Brutal',
};

export const HUMOUR_EMOJI: Record<HumourMode, string> = {
  playful: '😄',
  witty: '😎',
  sarcastic: '🙄',
  brutal: '💀',
};
