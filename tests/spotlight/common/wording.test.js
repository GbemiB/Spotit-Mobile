import { freeLevelsText, freeLevelsBadge, gameError } from '../../../src/modules/spotlight/common/wording.js';

describe('free levels wording', () => {
  it('follows the number of free levels from the server', () => {
    expect(freeLevelsText(2)).toBe('Levels 1 to 2 of every topic are free.');
    expect(freeLevelsText(1)).toBe('Level 1 of every topic is free.');
    expect(freeLevelsText(0)).toBe('Every level costs SP to unlock.');
    expect(freeLevelsText(null)).toBe('');
  });
});

describe('game errors', () => {
  it('keeps the SP message and otherwise shows what the server said', () => {
    expect(gameError({ status: 402, message: 'Not enough points' })).toBe('You don’t have enough SpotPoints for that yet.');
    expect(gameError({ status: 409, message: 'This day has no visitors yet.' })).toBe('This day has no visitors yet.');
    expect(gameError({ status: 403, message: 'Win more stars to open this part of the map.' })).toBe(
      'Win more stars to open this part of the map.',
    );
    expect(gameError(null)).toBe('Something went wrong. Please try again.');
  });
});

describe('free levels badge', () => {
  it('names the free levels shortly', () => {
    expect(freeLevelsBadge(2)).toBe('Levels 1–2 free');
    expect(freeLevelsBadge(1)).toBe('Level 1 free');
    expect(freeLevelsBadge(0)).toBe('');
    expect(freeLevelsBadge(undefined)).toBe('');
  });
});
