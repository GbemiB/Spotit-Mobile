import { rankProgress, weekDays } from '../../../src/modules/spotlight/hub/summaryLogic.js';

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
