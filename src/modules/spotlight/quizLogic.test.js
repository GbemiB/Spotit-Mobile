import {
  ageOn,
  isTopicLocked,
  levelCost,
  buildLevels,
  topicStatus,
  sheetModeFor,
  initialPlay,
  playReducer,
  starsFor,
  resultTitle,
  feedbackTitle,
} from './quizLogic.js';
import { SAMPLE_QUESTIONS, TOPICS } from './sampleQuiz.js';

const Q = SAMPLE_QUESTIONS;

function play(answers) {
  let s = playReducer(playReducer(initialPlay(Q), { type: 'start' }), { type: 'go' });
  answers.forEach((choice, i) => {
    s = playReducer(s, { type: 'answer', choice, answer: Q[i].answer });
    s = playReducer(s, { type: 'next' });
  });
  return s;
}

describe('ageOn', () => {
  it('counts a birthday that has not come yet this year', () => {
    expect(ageOn('2010-06-15', '2026-06-14')).toBe(15);
    expect(ageOn('2010-06-15', '2026-06-15')).toBe(16);
  });
  it('returns null without a date of birth', () => {
    expect(ageOn('', '2026-01-01')).toBeNull();
  });
});

describe('isTopicLocked', () => {
  const adult = TOPICS.find(t => t.minAge === 18);
  const teen = TOPICS.find(t => t.minAge === 13);
  it('locks 18+ topics for teens and unknown ages', () => {
    expect(isTopicLocked(adult, 16)).toBe(true);
    expect(isTopicLocked(adult, null)).toBe(true);
    expect(isTopicLocked(adult, 18)).toBe(false);
  });
  it('never locks 13+ topics', () => {
    expect(isTopicLocked(teen, 13)).toBe(false);
  });
});

describe('levels', () => {
  it('keeps levels 1 to 3 free and prices the rest', () => {
    expect([1, 2, 3, 4, 5].map(levelCost)).toEqual([0, 0, 0, 30, 40]);
  });
  it('marks cleared, current and locked levels', () => {
    const levels = buildLevels({ current: 2, stars: { 1: 3 } });
    expect(levels[0]).toMatchObject({ state: 'cleared', stars: 3 });
    expect(levels[1].state).toBe('current');
    expect(levels[2].state).toBe('locked');
    expect(levels).toHaveLength(10);
  });
  it('describes topic progress', () => {
    expect(topicStatus(undefined)).toEqual({ label: 'Free to start', pct: 0 });
    expect(topicStatus({ current: 3 }).label).toBe('Level 3 of 10');
  });
  it('picks the right sheet', () => {
    expect(sheetModeFor({ cost: 0 }, 0)).toBe('start');
    expect(sheetModeFor({ cost: 30 }, 30)).toBe('unlock');
    expect(sheetModeFor({ cost: 30 }, 12)).toBe('short');
  });
});

describe('playReducer', () => {
  it('clears a level with three stars when every answer is right', () => {
    const s = play(Q.map(q => q.answer));
    expect(s.phase).toBe('cleared');
    expect(s.correct).toBe(5);
    expect(s.best).toBe(5);
    expect(starsFor(s)).toBe(3);
  });
  it('runs out of hearts after three wrong answers', () => {
    const wrong = Q.map(q => (q.answer === 'myth' ? 'fact' : 'myth'));
    const s = play(wrong.slice(0, 3));
    expect(s.phase).toBe('out');
    expect(s.lives).toBe(0);
    expect(starsFor(s)).toBe(0);
  });
  it('charges a hint once per round', () => {
    let s = playReducer(playReducer(initialPlay(Q), { type: 'start' }), { type: 'go' });
    s = playReducer(s, { type: 'hint' });
    s = playReducer(s, { type: 'hint' });
    expect(s.hintsSpent).toBe(5);
  });
  it('ignores answers outside a question', () => {
    const s = initialPlay(Q);
    expect(playReducer(s, { type: 'answer', choice: 'myth', answer: 'myth' })).toBe(s);
  });
});

describe('titles', () => {
  it('grows with the streak', () => {
    expect(feedbackTitle(true, 1)).toBe('Nailed it!');
    expect(feedbackTitle(true, 2)).toBe('Spot on!');
    expect(feedbackTitle(true, 4)).toBe('On fire!');
    expect(feedbackTitle(false, 0)).toBe('Not quite!');
  });
  it('follows the stars', () => {
    expect(resultTitle(3)).toBe('You aced it!');
    expect(resultTitle(1)).toBe('You made it!');
  });
});
