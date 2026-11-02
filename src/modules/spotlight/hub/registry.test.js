import { moduleFor, blockedReason, CHALLENGE_MODULES } from './registry.js';

jest.mock('../quiz/QuizModule.jsx', () => () => null);
jest.mock('../games/padbank/PadBankModule.jsx', () => () => null);
jest.mock('../games/giveday/GiveDayModule.jsx', () => () => null);

describe('challenge registry', () => {
  const quiz = { id: 'know-yourself', status: 'live', locked: false };
  it('opens a live challenge that has a module in the app', () => {
    expect(moduleFor(quiz)).toBe(CHALLENGE_MODULES['know-yourself']);
    expect(moduleFor({ id: 'pad-bank-run', status: 'live', locked: false })).toBe(CHALLENGE_MODULES['pad-bank-run']);
    expect(blockedReason(quiz)).toBeNull();
  });
  it('treats a live challenge without a module yet as coming soon', () => {
    expect(moduleFor({ id: 'grow-a-maker', status: 'live', locked: false })).toBeNull();
    expect(blockedReason({ id: 'grow-a-maker', status: 'live', locked: false })).toBe('soon');
    expect(moduleFor({ id: 'give-day', status: 'live', locked: false })).toBe(CHALLENGE_MODULES['give-day']);
  });
  it('keeps coming-soon and age-locked challenges closed', () => {
    expect(blockedReason({ ...quiz, status: 'soon' })).toBe('soon');
    expect(blockedReason({ ...quiz, locked: true })).toBe('locked');
    expect(moduleFor(null)).toBeNull();
  });
});
