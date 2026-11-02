import QuizModule from '../quiz/QuizModule.jsx';
import PadBankModule from '../v2/padbank/PadBankV2.jsx';
import GiveDayModule from '../v2/giveday/GiveDayV2.jsx';

export const CHALLENGE_MODULES = {
  'know-yourself': QuizModule,
  'pad-bank-run': PadBankModule,
  'give-day': GiveDayModule,
};

export function moduleFor(challenge) {
  if (!challenge || challenge.locked || challenge.status !== 'live') return null;
  return CHALLENGE_MODULES[challenge.id] || null;
}

export function blockedReason(challenge) {
  if (challenge.locked) return 'locked';
  return moduleFor(challenge) ? null : 'soon';
}
