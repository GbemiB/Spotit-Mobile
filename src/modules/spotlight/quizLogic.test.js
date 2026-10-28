import {
  splitTitle,
  topicStatus,
  toCards,
  toGroups,
  toLevel,
  toPick,
  sheetModeFor,
  initialPlay,
  playReducer,
  resultTitle,
  feedbackTitle,
  friendlyError,
} from './quizLogic.js';
import * as quizApi from '../../shared/api/quiz.js';
import { apiRequest } from '../../shared/api/client.js';

jest.mock('../../shared/api/client.js', () => ({ apiRequest: jest.fn(() => Promise.resolve({})) }));

const card = over => ({
  id: 'my-cycle',
  name: 'My Cycle',
  groupId: 'body',
  tone: 'pink',
  minAge: 13,
  locked: false,
  started: true,
  currentLevel: 2,
  levelCount: 3,
  levelsCleared: 1,
  ready: true,
  ...over,
});

const attempt = {
  attemptId: 'a1',
  rounds: [
    { round: 0, statement: 'A' },
    { round: 1, statement: 'B' },
  ],
  lives: 3,
};
const result = over => ({
  round: 0,
  right: true,
  answer: 'fact',
  explanation: 'Because',
  funFact: null,
  lives: 3,
  streak: 1,
  bestStreak: 1,
  correct: 1,
  status: 'playing',
  stars: 0,
  nextLevelOpened: null,
  ...over,
});

describe('mapping server data', () => {
  it('splits a level name for the two-colour headline', () => {
    expect(splitTitle('When you ovulate')).toEqual({ titleA: 'When you ', titleB: 'ovulate' });
    expect(splitTitle('Basics')).toEqual({ titleA: '', titleB: 'Basics' });
  });
  it('describes each topic state', () => {
    expect(topicStatus(card())).toEqual({ label: 'Level 2 of 3', pct: 33 });
    expect(topicStatus(card({ locked: true })).label).toBe('Opens at 18');
    expect(topicStatus(card({ ready: false })).label).toBe('Coming soon');
    expect(topicStatus(card({ started: false, levelsCleared: 0 })).label).toBe('Start playing');
    expect(topicStatus(card({ levelsCleared: 3, ready: false })).label).toBe('All levels cleared');
  });
  it('builds cards, groups, levels and the pick', () => {
    expect(toCards([card()])[0].topic).toEqual({ id: 'my-cycle', name: 'My Cycle', group: 'body', tone: 'pink', minAge: 13 });
    expect(toGroups({ groups: [{ id: 'body', label: 'Body basics', tone: 'pink', topics: [card()] }] })[0]).toMatchObject({
      key: 'body',
      items: [{ locked: false }],
    });
    expect(toGroups(null)).toEqual([]);
    expect(toLevel({ number: 2, name: 'N', cost: 30, state: 'current', stars: 0, ready: true })).toMatchObject({ n: 2, cost: 30 });
    const pick = toPick({
      topicId: 'my-cycle',
      topicName: 'My Cycle',
      groupId: 'body',
      tone: 'pink',
      level: 1,
      levelName: 'Your period basics',
      cost: 0,
    });
    expect(pick).toMatchObject({ free: true, titleB: 'basics', level: { n: 1 } });
    expect(toPick(null)).toBeNull();
  });
  it('picks the right sheet', () => {
    expect(sheetModeFor({ cost: 0 }, 0)).toBe('start');
    expect(sheetModeFor({ cost: 30 }, 30)).toBe('unlock');
    expect(sheetModeFor({ cost: 30 }, 12)).toBe('short');
  });
});

describe('playReducer', () => {
  it('runs a game from start to a cleared level', () => {
    let s = playReducer(playReducer(initialPlay(), { type: 'loading' }), { type: 'started', attempt });
    expect(s).toMatchObject({ phase: 'countdown', total: 2, lives: 3, busy: false });
    s = playReducer(s, { type: 'go' });
    s = playReducer(s, { type: 'answered', result: result() });
    expect(s.phase).toBe('feedback');
    s = playReducer(s, { type: 'next' });
    expect(s).toMatchObject({ phase: 'question', round: 1, feedback: null });
    s = playReducer(s, { type: 'answered', result: result({ round: 1, status: 'cleared', stars: 3, nextLevelOpened: 2, correct: 2 }) });
    s = playReducer(s, { type: 'next' });
    expect(s).toMatchObject({ phase: 'cleared', stars: 3, nextLevel: 2, correct: 2 });
  });
  it('ends when the hearts run out', () => {
    let s = playReducer(playReducer(initialPlay(), { type: 'started', attempt }), { type: 'go' });
    s = playReducer(s, { type: 'answered', result: result({ right: false, lives: 0, status: 'out' }) });
    expect(playReducer(s, { type: 'next' }).phase).toBe('out');
  });
  it('keeps a hint for the round and clears it on the next', () => {
    let s = playReducer(playReducer(initialPlay(), { type: 'started', attempt }), { type: 'go' });
    s = playReducer(s, { type: 'hinted', hint: 'Think' });
    expect(s).toMatchObject({ hinted: true, hint: 'Think' });
    s = playReducer(playReducer(s, { type: 'answered', result: result() }), { type: 'next' });
    expect(s).toMatchObject({ hinted: false, hint: null });
  });
  it('shows errors and ignores steps out of order', () => {
    const s = playReducer(initialPlay(), { type: 'failed', message: 'Oops' });
    expect(s).toMatchObject({ error: 'Oops', busy: false });
    expect(playReducer(s, { type: 'go' })).toBe(s);
    expect(playReducer(s, { type: 'next' })).toBe(s);
    expect(playReducer(s, { type: 'restart' })).toEqual(initialPlay());
    expect(playReducer(s, { type: 'other' })).toBe(s);
  });
});

describe('words', () => {
  it('titles follow the streak and stars', () => {
    expect(feedbackTitle(true, 1)).toBe('Nailed it!');
    expect(feedbackTitle(true, 2)).toBe('Spot on!');
    expect(feedbackTitle(true, 4)).toBe('On fire!');
    expect(feedbackTitle(false, 0)).toBe('Not quite!');
    expect(resultTitle(3)).toBe('You aced it!');
    expect(resultTitle(2)).toBe('Nicely done!');
    expect(resultTitle(1)).toBe('You made it!');
  });
  it('turns server errors into friendly words', () => {
    expect(friendlyError({ status: 402 })).toMatch(/SpotPoints/);
    expect(friendlyError({ status: 409 })).toMatch(/isn’t ready/);
    expect(friendlyError({ status: 403 })).toMatch(/isn’t open/);
    expect(friendlyError({ message: 'Network' })).toBe('Network');
    expect(friendlyError(null)).toMatch(/went wrong/);
  });
});

describe('quiz api', () => {
  beforeEach(() => jest.clearAllMocks());
  it('calls the quiz endpoints', () => {
    quizApi.getHome('t');
    quizApi.getTopics('t');
    quizApi.getTopic('my cycle', 't');
    quizApi.startLevel({ topicId: 'my-cycle', level: 2 }, 't');
    quizApi.takeHint('a1', 0, 't');
    quizApi.answer('a1', 0, 'myth', 't');
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/quiz/home', { token: 't' });
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/quiz/topics/my%20cycle', { token: 't' });
    expect(apiRequest).toHaveBeenNthCalledWith(4, '/quiz/attempts', {
      method: 'POST',
      body: { topicId: 'my-cycle', level: 2 },
      token: 't',
    });
    expect(apiRequest).toHaveBeenNthCalledWith(5, '/quiz/attempts/a1/hint', { method: 'POST', body: { round: 0 }, token: 't' });
    expect(apiRequest).toHaveBeenNthCalledWith(6, '/quiz/attempts/a1/answers', {
      method: 'POST',
      body: { round: 0, choice: 'myth' },
      token: 't',
    });
  });
});
