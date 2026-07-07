const LEVELS = [
  { name: 'Blush',      lo: 0,     hi: 500   },
  { name: 'Petal',      lo: 500,   hi: 2000  },
  { name: 'Rosé',       lo: 2000,  hi: 5000  },
  { name: 'Bloom',      lo: 5000,  hi: 10000 },
  { name: 'Wildflower', lo: 10000, hi: 25000 },
  { name: 'Moonflower', lo: 25000, hi: 50000 },
];

export const LEVEL_ORDER = [...LEVELS.map(l => l.name), 'Goddess'];

export function levelInfo(fp) {
  for (let i = 0; i < LEVELS.length; i++) {
    const { name, lo, hi } = LEVELS[i];
    if (fp < hi) return { name, lo, hi, pct: (fp - lo) / (hi - lo), next: LEVELS[i + 1] || null, idx: i };
  }
  return { name: 'Goddess', lo: 50000, hi: 50000, pct: 1, next: null, idx: LEVELS.length };
}
