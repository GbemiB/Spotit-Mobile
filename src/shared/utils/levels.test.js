import { levelInfo, LEVEL_ORDER } from './levels.js';

describe('levelInfo', () => {
  test('zero points starts at Blush', () => {
    const info = levelInfo(0);
    expect(info.name).toBe('Blush');
    expect(info.lo).toBe(0);
    expect(info.hi).toBe(500);
    expect(info.pct).toBe(0);
    expect(info.next).toEqual({ name: 'Petal', lo: 500, hi: 2000 });
  });

  test('points just below a threshold stay in the lower level', () => {
    expect(levelInfo(499).name).toBe('Blush');
  });

  test('points at a threshold roll into the next level', () => {
    const info = levelInfo(500);
    expect(info.name).toBe('Petal');
    expect(info.lo).toBe(500);
    expect(info.hi).toBe(2000);
    expect(info.pct).toBe(0);
  });

  test('mid-level points compute the correct progress percentage', () => {
    // Rosé spans [2000, 5000); 3500 is exactly halfway through.
    const info = levelInfo(3500);
    expect(info.name).toBe('Rosé');
    expect(info.pct).toBe(0.5);
  });

  test('the last defined level has no further "next" tier', () => {
    const info = levelInfo(49_999);
    expect(info.name).toBe('Moonflower');
    expect(info.next).toBeNull();
  });

  test.each([50_000, 50_001, 1_000_000])('%i points is capped at Goddess', points => {
    const info = levelInfo(points);
    expect(info.name).toBe('Goddess');
    expect(info.lo).toBe(50_000);
    expect(info.hi).toBe(50_000);
    expect(info.pct).toBe(1);
    expect(info.next).toBeNull();
  });

  test('LEVEL_ORDER ends with Goddess after the six named levels', () => {
    expect(LEVEL_ORDER).toEqual(['Blush', 'Petal', 'Rosé', 'Bloom', 'Wildflower', 'Moonflower', 'Goddess']);
  });
});
