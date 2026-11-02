import { freeLevelsText, freeLevelsShort } from './wording.js';

describe('free levels wording', () => {
  it('follows the number of free levels from the server', () => {
    expect(freeLevelsText(2)).toBe('Levels 1 to 2 of every topic are free.');
    expect(freeLevelsText(1)).toBe('Level 1 of every topic is free.');
    expect(freeLevelsText(0)).toBe('Every level costs SP to unlock.');
    expect(freeLevelsText(null)).toBe('');
    expect(freeLevelsShort(null)).toBe('');
    expect(freeLevelsShort(2)).toBe('levels 1–2 of every topic are free');
    expect(freeLevelsShort(0)).toBe('every level costs SP');
  });
});
