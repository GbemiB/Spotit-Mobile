// Admin-configurable now (GET /rewards/levels) — this default is only the fallback used until
// that fetch resolves, or if it fails, so the level strip/progress bar never blocks on it. Same
// shape/values the whole app always had; App.js's rewards effect calls LEVELS_HYDRATED with the
// real thing once it lands.
export const DEFAULT_LEVELS = [
  { name: 'Blush', lo: 0, hi: 500 },
  { name: 'Petal', lo: 500, hi: 2000 },
  { name: 'Rosé', lo: 2000, hi: 5000 },
  { name: 'Bloom', lo: 5000, hi: 10000 },
  { name: 'Wildflower', lo: 10000, hi: 25000 },
  { name: 'Moonflower', lo: 25000, hi: 50000 },
];

export const LEVEL_ORDER = [...DEFAULT_LEVELS.map(l => l.name), 'Goddess'];

// Maps the API shape (GET /rewards/levels: {name, pointsLow, pointsHigh}) to the {name, lo, hi}
// shape levelInfo/LEVEL_ORDER use locally.
export function toLevelList(apiLevels) {
  return apiLevels.map(l => ({ name: l.name, lo: l.pointsLow, hi: l.pointsHigh }));
}

export function levelOrderFor(levels) {
  return [...levels.map(l => l.name), 'Goddess'];
}

export function levelInfo(fp, levels = DEFAULT_LEVELS) {
  for (let i = 0; i < levels.length; i++) {
    const { name, lo, hi } = levels[i];
    if (fp < hi) return { name, lo, hi, pct: (fp - lo) / (hi - lo), next: levels[i + 1] || null, idx: i };
  }
  const top = levels[levels.length - 1];
  return { name: 'Goddess', lo: top.hi, hi: top.hi, pct: 1, next: null, idx: levels.length };
}
