import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  rankProgress,
  weekDays,
  streakLabel,
  summaryLine,
  isRankUp,
  readSeenRank,
  saveSeenRank,
  challengeTag,
  splitChallenges,
  freeLevelsText,
  freeLevelsShort,
} from './summaryLogic.js';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const explorer = { id: 'explorer', name: 'Explorer', minStars: 15, nextName: 'Myth Buster', nextMinStars: 45 };

describe('rankProgress', () => {
  it('fills the ring between this rank and the next', () => {
    expect(rankProgress(explorer, 33)).toMatchObject({ pct: 0.6, need: 12, line: '12 more stars to Myth Buster' });
    expect(rankProgress(explorer, 44).line).toBe('1 more star to Myth Buster');
  });
  it('is full at the top rank', () => {
    expect(rankProgress({ id: 'top', name: 'Know-It-All', minStars: 90 }, 120)).toEqual({ pct: 1, line: 'Top level reached', top: true });
  });
  it('is empty without ranks', () => {
    expect(rankProgress(null, 10).pct).toBe(0);
  });
});

describe('weekDays', () => {
  it('labels the last 7 days ending today', () => {
    const days = weekDays('2026-11-02', [false, true, false, true, true, true, true]);
    expect(days.map(d => d.letter).join('')).toBe('TWTFSSM');
    expect(days[6]).toMatchObject({ today: true, played: true });
    expect(days[0].played).toBe(false);
  });
});

describe('summary text', () => {
  it('describes the streak', () => {
    expect(streakLabel(0)).toBe('Start a streak today');
    expect(streakLabel(1)).toBe('1-day streak');
    expect(streakLabel(4)).toBe('4-day streak');
  });
  it('describes the best run and topics, or nothing before the first game', () => {
    expect(summaryLine({ bestRun: 6, topicsStarted: 3 })).toEqual({ run: '6 right in a row', topics: '3 topics started' });
    expect(summaryLine({ bestRun: 2, topicsStarted: 1 }).topics).toBe('1 topic started');
    expect(summaryLine({ bestRun: 0, topicsStarted: 0 })).toBeNull();
  });
});

describe('rank up', () => {
  beforeEach(() => AsyncStorage.clear());
  it('celebrates only when a remembered rank changes', () => {
    expect(isRankUp(null, explorer)).toBe(false);
    expect(isRankUp('explorer', explorer)).toBe(false);
    expect(isRankUp('curious', explorer)).toBe(true);
  });
  it('remembers the last rank per user', async () => {
    await saveSeenRank('u1', 'explorer');
    expect(await readSeenRank('u1')).toBe('explorer');
    expect(await readSeenRank('u2')).toBeNull();
  });
});

describe('challenges', () => {
  const game = { id: 'pad-factory', kind: 'game', cost: 10, costFrom: true, status: 'live', locked: false };
  it('shows the price from the server for a live game', () => {
    expect(challengeTag(game)).toEqual({ text: 'Game · from 10 SP', muted: false });
    expect(challengeTag({ ...game, costFrom: false, cost: 15 }).text).toBe('Game · 15 SP');
  });
  it('shows coming soon or the age lock instead of a price', () => {
    expect(challengeTag({ ...game, status: 'soon' })).toEqual({ text: 'Coming soon', muted: true });
    expect(challengeTag({ ...game, locked: true }).text).toBe('Opens at 18');
  });
  it('splits the quiz from the games, keeping server order', () => {
    const list = [
      { id: 'q', kind: 'quiz' },
      { id: 'a', kind: 'game' },
      { id: 'b', kind: 'game' },
    ];
    expect(splitChallenges(list).quiz.id).toBe('q');
    expect(splitChallenges(list).games.map(g => g.id)).toEqual(['a', 'b']);
    expect(splitChallenges(undefined)).toEqual({ quiz: null, games: [] });
  });
});

describe('free levels wording', () => {
  it('follows the number of free levels from the server', () => {
    expect(freeLevelsText(2)).toBe('Levels 1 to 2 of every topic are free.');
    expect(freeLevelsText(1)).toBe('Level 1 of every topic is free.');
    expect(freeLevelsText(0)).toBe('Every level costs SP to unlock.');
    expect(freeLevelsShort(2)).toBe('levels 1–2 of every topic are free');
    expect(freeLevelsShort(undefined)).toBe('every level costs SP');
  });
});
