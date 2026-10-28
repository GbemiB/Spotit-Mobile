import { LEVEL_COUNT, LEVEL_NAMES, START_LIVES, HINT_COST } from './sampleQuiz.js';

export function ageOn(dob, today) {
  if (!dob || !today) return null;
  const [y, m, d] = String(dob).slice(0, 10).split('-').map(Number);
  const [ty, tm, td] = String(today).slice(0, 10).split('-').map(Number);
  if (!y || !ty) return null;
  let age = ty - y;
  if (tm < m || (tm === m && td < d)) age -= 1;
  return age;
}

export function isTopicLocked(topic, age) {
  if (topic.minAge <= 13) return false;
  return age == null || age < topic.minAge;
}

export function levelCost(n) {
  return n <= 3 ? 0 : 30 + (n - 4) * 10;
}

export function buildLevels(progress) {
  const current = progress?.current ?? 1;
  const stars = progress?.stars ?? {};
  return Array.from({ length: LEVEL_COUNT }, (_, i) => {
    const n = i + 1;
    const state = n < current ? 'cleared' : n === current ? 'current' : 'locked';
    return { n, name: LEVEL_NAMES[i] || `Level ${n}`, cost: levelCost(n), state, stars: stars[n] ?? 0 };
  });
}

export function topicStatus(progress) {
  if (!progress) return { label: 'Free to start', pct: 0 };
  const current = progress.current ?? 1;
  return { label: `Level ${current} of ${LEVEL_COUNT}`, pct: Math.round(((current - 1) / LEVEL_COUNT) * 100) };
}

export function sheetModeFor(level, balance) {
  if (level.cost === 0) return 'start';
  return balance >= level.cost ? 'unlock' : 'short';
}

export function initialPlay(questions) {
  return {
    phase: 'intro',
    round: 0,
    total: questions.length,
    lives: START_LIVES,
    streak: 0,
    best: 0,
    correct: 0,
    hinted: false,
    hintsSpent: 0,
    picked: null,
    right: null,
  };
}

export function playReducer(state, action) {
  switch (action.type) {
    case 'start':
      return { ...state, phase: 'countdown' };
    case 'go':
      return { ...state, phase: 'question' };
    case 'hint':
      if (state.phase !== 'question' || state.hinted) return state;
      return { ...state, hinted: true, hintsSpent: state.hintsSpent + HINT_COST };
    case 'answer': {
      if (state.phase !== 'question') return state;
      const right = action.choice === action.answer;
      const streak = right ? state.streak + 1 : 0;
      return {
        ...state,
        phase: 'feedback',
        picked: action.choice,
        right,
        streak,
        best: Math.max(state.best, streak),
        correct: state.correct + (right ? 1 : 0),
        lives: right ? state.lives : state.lives - 1,
      };
    }
    case 'next': {
      if (state.phase !== 'feedback') return state;
      if (state.lives <= 0) return { ...state, phase: 'out' };
      if (state.round + 1 >= state.total) return { ...state, phase: 'cleared' };
      return { ...state, phase: 'question', round: state.round + 1, hinted: false, picked: null, right: null };
    }
    case 'restart':
      return initialPlay({ length: state.total });
    default:
      return state;
  }
}

export function starsFor(state) {
  return state.phase === 'cleared' ? Math.max(1, state.lives) : 0;
}

export function resultTitle(stars) {
  if (stars >= 3) return 'You aced it!';
  if (stars === 2) return 'Nicely done!';
  return 'You made it!';
}

export function feedbackTitle(right, streak) {
  if (!right) return 'Not quite!';
  if (streak >= 3) return 'On fire!';
  if (streak === 2) return 'Spot on!';
  return 'Nailed it!';
}
