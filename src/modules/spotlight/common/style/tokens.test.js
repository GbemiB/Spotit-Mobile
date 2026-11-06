import { spotTokens, levelColor } from './tokens.js';

describe('level colours', () => {
  it('gives each Give Day level its own colour', () => {
    const t = spotTokens(false);
    const colors = [1, 2, 3, 4, 5].map(n => levelColor(t, n));
    expect(new Set(colors).size).toBe(5);
    expect(levelColor(t, 6)).toBe(colors[0]);
    expect(levelColor(spotTokens(true), 1)).toBeTruthy();
  });
});
