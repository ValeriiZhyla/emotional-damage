// Browser-independent domain rules. Storage and DOM effects stay in app.js.
export const STORAGE_KEY = 'emotional-damage.v1';
export const LANGUAGES = ['en', 'de', 'ru'];
export const MAX_VALUE = 19;
export const STEPS_PER_ZONE = 5;
export const DEFAULT_VALUE = 2;

export function defaultState(language = 'en') {
  return {
    version: 1,
    value: DEFAULT_VALUE,
    language: LANGUAGES.includes(language) ? language : 'en',
  };
}

export function parseState(raw, language = 'en') {
  const state = defaultState(language);
  if (typeof raw !== 'string') return state;
  let saved;
  try {
    saved = JSON.parse(raw);
  } catch {
    return state;
  }
  if (saved?.version !== 1) return state;
  if (Number.isInteger(saved.value) && saved.value >= 0 && saved.value <= MAX_VALUE)
    state.value = saved.value;
  if (LANGUAGES.includes(saved.language)) state.language = saved.language;
  return state;
}

export function positionPercent(value) {
  return ((value + 0.5) * 100) / (MAX_VALUE + 1);
}

const palette = [
  { at: 0, accent: [151, 199, 123] },
  { at: 4, accent: [178, 199, 122] },
  { at: 9, accent: [224, 188, 112] },
  // Blend through coral across Overloaded, reaching red at Exhausted.
  { at: 15, accent: [255, 105, 115] },
  { at: MAX_VALUE, accent: [255, 77, 90] },
];

export function stressAccent(value) {
  const bounded = Number.isFinite(value) ? Math.max(0, Math.min(MAX_VALUE, value)) : DEFAULT_VALUE;
  const upper = palette.findIndex((stop) => stop.at >= bounded);
  if (upper === 0) return `rgb(${palette[0].accent.join(', ')})`;
  const low = palette[upper - 1];
  const high = palette[upper];
  const fraction = (bounded - low.at) / (high.at - low.at);
  return `rgb(${low.accent.map((channel, index) => Math.round(channel + (high.accent[index] - channel) * fraction)).join(', ')})`;
}
