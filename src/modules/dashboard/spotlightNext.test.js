import { nextMove } from './spotlightNext.js';

const quizCard = { id: 'know-yourself', kind: 'quiz', name: 'Know Yourself', status: 'live', locked: false, plays: 3 };
const bank = {
  id: 'pad-bank-run',
  kind: 'game',
  name: 'Pad Bank Run',
  blurb: 'Serve visitors.',
  status: 'live',
  locked: false,
  cost: 2,
  freePlaysLeft: 0,
  plays: 0,
  freeUpTo: 2,
};
const give = {
  id: 'give-day',
  kind: 'game',
  name: 'Give Day',
  blurb: 'Give kits.',
  status: 'live',
  locked: false,
  cost: 3,
  freePlaysLeft: 1,
  plays: 0,
  freeUpTo: 0,
};
const pick = { level: 3, topicName: 'My Cycle', levelName: 'Cycle basics', cost: 2 };

describe('nextMove', () => {
  it('hides the card without data or playable challenges', () => {
    expect(nextMove(null)).toBeNull();
    expect(
      nextMove({
        challenges: [
          { ...give, locked: true },
          { ...bank, status: 'soon' },
        ],
      }),
    ).toBeNull();
  });

  it('puts an unbroken streak first when today is not played', () => {
    const home = { stats: { streak: 3, week: [true, true, true, false, false, false, false] }, challenges: [give] };
    expect(nextMove(home)).toEqual({
      title: 'Keep your 3-day Spotlight streak',
      sub: 'Play anything today to keep it going.',
      chip: '3 days',
    });
  });

  it('skips the streak once today is played and offers the free try', () => {
    const home = { stats: { streak: 1, week: [false, false, false, false, false, false, true] }, challenges: [quizCard, bank, give] };
    expect(nextMove(home)).toEqual({ title: 'Free try waiting in Give Day', sub: 'Give kits.', chip: 'Free try' });
  });

  it('offers free days for an unplayed game', () => {
    expect(nextMove({ challenges: [bank] }).title).toBe('Pad Bank Run: Days 1–2 are free');
    expect(nextMove({ challenges: [{ ...give, id: 'x', freePlaysLeft: 0, freeUpTo: 1 }] }).title).toBe('Give Day: Level 1 is free');
  });

  it('falls back to the quiz pick', () => {
    const home = { challenges: [quizCard, { ...bank, plays: 4 }] };
    expect(nextMove(home, { pick })).toEqual({ title: 'Know Yourself: level 3 of My Cycle', sub: 'Cycle basics', chip: '2 SP' });
    expect(nextMove(home, { pick: { ...pick, cost: 0 } }).chip).toBe('Free');
  });

  it('opens the first challenge when nothing else applies', () => {
    expect(nextMove({ challenges: [quizCard] }, null)).toEqual({ title: 'Play Know Yourself', sub: undefined, chip: null });
  });
});
