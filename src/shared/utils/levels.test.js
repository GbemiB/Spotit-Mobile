import { levelInfo, levelOrderFor, toLevelList } from './levels.js';

// Fixture only — the app itself no longer holds this data; it's exclusively DB-backed
// (GET /rewards/levels). Same thresholds the old hardcoded array had, just local to this test.
const LEVELS = [
  { name: 'Blush', lo: 0, hi: 500 },
  { name: 'Petal', lo: 500, hi: 2000 },
  { name: 'Rosé', lo: 2000, hi: 5000 },
  { name: 'Bloom', lo: 5000, hi: 10000 },
  { name: 'Wildflower', lo: 10000, hi: 25000 },
  { name: 'Moonflower', lo: 25000, hi: 50000 },
];

describe('levelInfo', () => {
  test('zero points starts at Blush', () => {
    const info = levelInfo(0, LEVELS);
    expect(info.name).toBe('Blush');
    expect(info.lo).toBe(0);
    expect(info.hi).toBe(500);
    expect(info.pct).toBe(0);
    expect(info.next).toEqual({ name: 'Petal', lo: 500, hi: 2000 });
  });

  test('points just below a threshold stay in the lower level', () => {
    expect(levelInfo(499, LEVELS).name).toBe('Blush');
  });

  test('points at a threshold roll into the next level', () => {
    const info = levelInfo(500, LEVELS);
    expect(info.name).toBe('Petal');
    expect(info.lo).toBe(500);
    expect(info.hi).toBe(2000);
    expect(info.pct).toBe(0);
  });

  test('mid-level points compute the correct progress percentage', () => {
    // Rosé spans [2000, 5000); 3500 is exactly halfway through.
    const info = levelInfo(3500, LEVELS);
    expect(info.name).toBe('Rosé');
    expect(info.pct).toBe(0.5);
  });

  test('the last defined level has no further "next" tier', () => {
    const info = levelInfo(49_999, LEVELS);
    expect(info.name).toBe('Moonflower');
    expect(info.next).toBeNull();
  });

  test.each([50_000, 50_001, 1_000_000])('%i points is capped at Goddess', points => {
    const info = levelInfo(points, LEVELS);
    expect(info.name).toBe('Goddess');
    expect(info.lo).toBe(50_000);
    expect(info.hi).toBe(50_000);
    expect(info.pct).toBe(1);
    expect(info.next).toBeNull();
  });

  test('an empty levels list (not loaded yet) returns a null-name shape instead of crashing', () => {
    expect(levelInfo(1000, [])).toEqual({ name: null, lo: 0, hi: 0, pct: 0, next: null, idx: -1 });
  });

  test('levelOrderFor ends with Goddess after the given levels', () => {
    expect(levelOrderFor(LEVELS)).toEqual(['Blush', 'Petal', 'Rosé', 'Bloom', 'Wildflower', 'Moonflower', 'Goddess']);
  });
});

describe('toLevelList', () => {
  test('maps the API shape (pointsLow/pointsHigh) to the local lo/hi shape', () => {
    expect(toLevelList([{ name: 'Blush', pointsLow: 0, pointsHigh: 500 }])).toEqual([{ name: 'Blush', lo: 0, hi: 500 }]);
  });
});
