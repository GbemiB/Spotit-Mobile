const LEVELS = [
  { name: 'Seedling',   lo: 0,     hi: 500   },
  { name: 'Blossom',    lo: 500,   hi: 2000  },
  { name: 'Petal',      lo: 2000,  hi: 5000  },
  { name: 'Bloom',      lo: 5000,  hi: 10000 },
  { name: 'Wildflower', lo: 10000, hi: 25000 },
  { name: 'Moonflower', lo: 25000, hi: 50000 },
];

export function levelInfo(fp) {
  for (let i = 0; i < LEVELS.length; i++) {
    const { name, lo, hi } = LEVELS[i];
    if (fp < hi) return { name, lo, hi, pct: (fp - lo) / (hi - lo), next: LEVELS[i + 1] || null, idx: i };
  }
  return { name: 'Legend', lo: 50000, hi: 50000, pct: 1, next: null, idx: 5 };
}
