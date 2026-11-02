import QuizModule from '../quiz/QuizModule.jsx';

export const CHALLENGE_MODULES = {
  'know-yourself': QuizModule,
};

export function moduleFor(challenge) {
  if (!challenge || challenge.locked || challenge.status !== 'live') return null;
  return CHALLENGE_MODULES[challenge.id] || null;
}

export function blockedReason(challenge) {
  if (challenge.locked) return 'locked';
  return moduleFor(challenge) ? null : 'soon';
}
