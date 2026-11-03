import { priceFor } from './PlayCards.jsx';

describe('game card price', () => {
  const game = { kind: 'game', cost: 10, costFrom: false, freePlaysLeft: 0, plays: 3 };
  it('says free to play when a game costs nothing to open', () => {
    expect(priceFor({ ...game, cost: 0, freePlaysLeft: 1, plays: 0 }, 2, true)).toEqual({ label: 'Free to play', after: '', free: true });
    expect(priceFor({ ...game, cost: 0 }, 2, false).label).toBe('Free to play');
  });
  it('shows the free try and then the price for paid games', () => {
    expect(priceFor({ ...game, freePlaysLeft: 1, plays: 0 }, 2, false)).toEqual({
      label: 'Free try waiting',
      after: 'then 10 SP',
      free: true,
    });
    expect(priceFor(game, 2, false)).toEqual({ label: '10 SP', after: '', free: false });
  });
  it('shows the free quiz levels for the quiz', () => {
    expect(priceFor({ kind: 'quiz', cost: 0 }, 2, false).label).toBe('Levels 1–2 free');
  });
});
