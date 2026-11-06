import { loveLine, loveIcon, timeAgo, replyText } from '../../../src/shared/utils/partnerLove.js';
test('one line per kind', () => {
  expect(loveLine({ kind: 'promise', labels: ['Tea & treats', 'Back rub'] })).toBe('Promised: Tea & treats · Back rub');
  expect(loveLine({ kind: 'text', labels: [], note: 'Proud of you' })).toBe('“Proud of you”');
  expect(loveLine({ kind: 'expression', labels: [], expressionEmoji: '🤗', expressionLabel: 'Hug' })).toBe('🤗 Hug');
});
test('an icon per kind', () => {
  expect(loveIcon({ kind: 'expression', expressionEmoji: '🤗' })).toBe('🤗');
  expect(loveIcon({ kind: 'text' })).toBe('💌');
  expect(loveIcon({ kind: 'promise' })).toBe('🤝');
});
test('time since the send', () => {
  const now = Date.parse('2026-10-24T12:00:00Z');
  expect(timeAgo(null, now)).toBe('');
  expect(timeAgo('2026-10-24T12:00:00Z', now)).toBe('just now');
  expect(timeAgo('2026-10-24T11:50:00Z', now)).toBe('10 min ago');
  expect(timeAgo('2026-10-24T11:00:00Z', now)).toBe('1 hour ago');
  expect(timeAgo('2026-10-24T09:00:00Z', now)).toBe('3 hours ago');
});
test('her reply text', () => {
  expect(replyText({ replyNote: 'Thank you', replyHeart: true })).toBe('Thank you');
  expect(replyText({ replyHeart: true })).toBe('You loved this ♡');
  expect(replyText({})).toBe('');
});
