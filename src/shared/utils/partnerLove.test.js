import { loveLine, loveHeadline } from './partnerLove.js';
test('one line per kind', () => {
  expect(loveLine({ kind: 'promise', labels: ['Tea & treats', 'Back rub'] })).toBe('Promised: Tea & treats · Back rub');
  expect(loveLine({ kind: 'text', labels: [], note: 'Proud of you' })).toBe('“Proud of you”');
  expect(loveLine({ kind: 'expression', labels: [], expressionEmoji: '🤗', expressionLabel: 'Hug' })).toBe('🤗 Hug');
});
test('headline counts the sends', () => {
  expect(loveHeadline([{ partnerName: 'Tunde' }], 'Your partner')).toBe('Tunde sent you love today');
  expect(loveHeadline([{ partnerName: 'Tunde' }, {}, {}], 'Your partner')).toBe('Tunde sent you love 3 times today');
});
