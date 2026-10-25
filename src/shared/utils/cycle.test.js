import {
  loggedPeriods,
  periodAround,
  closePeriodStart,
  toISO,
  todayISO,
  daysInMonth,
  cycleDayOf,
  phaseFor,
  nextMilestone,
  nextPeriodDate,
  formatDisplayDate,
  addDays,
  datesBetween,
  periodStatus,
  trackingStartOf,
  calendarDay,
  periodLogStartForMonth,
} from './cycle.js';
function iso(year, month, day) {
  return toISO(new Date(year, month - 1, day));
}
describe('toISO / daysInMonth', () => {
  test('toISO zero-pads month and day', () => {
    expect(toISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
  test('daysInMonth returns 28 for a non-leap February', () => {
    expect(daysInMonth(2026, 1)).toBe(28);
  });
  test('daysInMonth returns 29 for a leap February', () => {
    expect(daysInMonth(2024, 1)).toBe(29);
  });
});
describe('addDays / datesBetween', () => {
  test('addDays rolls over a month boundary', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02');
  });
  test('addDays supports negative offsets (previous day)', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  test('datesBetween includes both endpoints inclusive', () => {
    expect(datesBetween('2026-07-10', '2026-07-13')).toEqual(['2026-07-10', '2026-07-11', '2026-07-12', '2026-07-13']);
  });
  test('datesBetween returns a single date when start equals end', () => {
    expect(datesBetween('2026-07-10', '2026-07-10')).toEqual(['2026-07-10']);
  });
});
describe('cycleDayOf', () => {
  const lastPeriod = iso(2026, 1, 1);
  test('the period start date itself is cycle day 1', () => {
    expect(cycleDayOf(lastPeriod, lastPeriod, 28)).toBe(1);
  });
  test('the last day of the cycle is cycle day == cycleLength', () => {
    expect(cycleDayOf(iso(2026, 1, 28), lastPeriod, 28)).toBe(28);
  });
  test('wraps into the next cycle after cycleLength days', () => {
    expect(cycleDayOf(iso(2026, 1, 29), lastPeriod, 28)).toBe(1);
    expect(cycleDayOf(iso(2026, 1, 30), lastPeriod, 28)).toBe(2);
  });
  test('a date before the last period wraps backward correctly', () => {
    expect(cycleDayOf(iso(2025, 12, 31), lastPeriod, 28)).toBe(28);
  });
  test('returns null when there is no last period date', () => {
    expect(cycleDayOf(lastPeriod, null, 28)).toBeNull();
  });
});
describe('phaseFor', () => {
  const periodLength = 5;
  const cycleLength = 28;
  test.each([
    [1, 'period'],
    [5, 'period'],
    [6, null],
    [8, null],
    [9, 'fertile'],
    [13, 'fertile'],
    [14, 'ovulation'],
    [15, null],
    [28, null],
  ])('cycle day %i is %s', (cycleDay, expectedKey) => {
    expect(phaseFor(cycleDay, periodLength, cycleLength).key).toBe(expectedKey);
  });
  test('a null cycle day returns a null phase', () => {
    expect(phaseFor(null, periodLength, cycleLength)).toEqual({ key: null, label: null, color: null });
  });
});
describe('nextMilestone', () => {
  const periodLength = 5;
  const cycleLength = 28;
  test.each([
    [1, 'period', 0],
    [5, 'period', 0],
    [6, 'fertile', 3],
    [9, 'fertile', 0],
    [13, 'fertile', 0],
    [14, 'ovulation', 0],
    [15, 'period', 14],
    [28, 'period', 1],
  ])('cycle day %i -> %s in %i day(s)', (cycleDay, expectedKey, expectedDaysUntil) => {
    expect(nextMilestone(cycleDay, cycleLength, periodLength)).toEqual({ key: expectedKey, daysUntil: expectedDaysUntil });
  });
  test('a null cycle day returns null', () => {
    expect(nextMilestone(null, cycleLength, periodLength)).toBeNull();
  });
});
describe('nextPeriodDate', () => {
  test('returns null when there is no last period date', () => {
    expect(nextPeriodDate(null, 28)).toBeNull();
  });
  test('starting the period today predicts the next one a full cycle away', () => {
    const today = todayISO();
    const next = nextPeriodDate(today, 28);
    expect(toISO(next)).toBe(toISO(new Date(new Date().setDate(new Date().getDate() + 28))));
  });
  test('on the last day of the cycle, the next period is predicted tomorrow', () => {
    const [y, m, d] = todayISO().split('-').map(Number);
    const today = new Date(y, m - 1, d);
    const lastPeriod = toISO(new Date(y, m - 1, d - 27));
    const next = nextPeriodDate(lastPeriod, 28);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(toISO(next)).toBe(toISO(tomorrow));
  });
});
describe('formatDisplayDate', () => {
  test('returns null for a falsy input', () => {
    expect(formatDisplayDate(null)).toBeNull();
    expect(formatDisplayDate(undefined)).toBeNull();
  });
  test('formats a plain YYYY-MM-DD string using its own calendar day, not UTC midnight', () => {
    expect(formatDisplayDate('2026-07-28')).toBe('July 28');
  });
  test('formats a Date instance directly', () => {
    expect(formatDisplayDate(new Date(2026, 6, 4))).toBe('July 4');
  });
});
describe('periodStatus', () => {
  test('returns null without a logged period', () => {
    expect(periodStatus('2026-10-15', null, 28)).toBeNull();
  });
  test('tracks normally inside the confirmed cycle', () => {
    expect(periodStatus('2026-09-28', '2026-09-01', 28)).toEqual({
      state: 'tracking',
      cycleDay: 28,
      daysLate: 0,
      expectedDate: '2026-09-29',
      missedCycles: 0,
    });
  });
  test('is due on the predicted start day', () => {
    expect(periodStatus('2026-09-29', '2026-09-01', 28)).toEqual({
      state: 'due',
      cycleDay: 28,
      daysLate: 0,
      expectedDate: '2026-09-29',
      missedCycles: 0,
    });
  });
  test('counts days late until a full cycle has passed, keeping the cycle at its last day', () => {
    expect(periodStatus('2026-10-01', '2026-09-01', 28)).toMatchObject({ state: 'late', daysLate: 2, cycleDay: 28 });
    expect(periodStatus('2026-10-26', '2026-09-01', 28)).toMatchObject({ state: 'late', daysLate: 27, expectedDate: '2026-09-29' });
  });
  test('rolls over to the next predicted start once a full cycle has passed', () => {
    expect(periodStatus('2026-10-27', '2026-09-01', 28)).toEqual({
      state: 'due',
      cycleDay: 28,
      daysLate: 0,
      expectedDate: '2026-10-27',
      missedCycles: 1,
    });
  });
});
describe('trackingStartOf', () => {
  test('uses the stored start, or the first of the month of the last period', () => {
    expect(trackingStartOf('2026-06-01', '2026-09-28')).toBe('2026-06-01');
    expect(trackingStartOf(null, '2026-09-28')).toBe('2026-09-01');
    expect(trackingStartOf(null, null)).toBeNull();
  });
});
describe('calendarDay', () => {
  const base = { lastPeriodDate: '2026-07-01', cycleLength: 28, periodLength: 5, trackingStart: null, logs: {} };
  test('shows nothing before the month of the last period', () => {
    expect(calendarDay('2026-06-30', { ...base, todayIso: '2026-07-10' })).toEqual({ phase: null, predicted: false, marker: null });
  });
  test('shows the confirmed cycle without the predicted flag', () => {
    expect(calendarDay('2026-07-01', { ...base, todayIso: '2026-07-10' })).toEqual({ phase: 'period', predicted: false, marker: null });
    expect(calendarDay('2026-07-14', { ...base, todayIso: '2026-07-10' }).phase).toBe('ovulation');
  });
  test('predicts from today on', () => {
    expect(calendarDay('2026-07-29', { ...base, todayIso: '2026-07-10' })).toEqual({ phase: 'period', predicted: true, marker: null });
  });
  test('leaves past unconfirmed predictions blank and marks the expected start', () => {
    expect(calendarDay('2026-07-29', { ...base, todayIso: '2026-08-03' })).toEqual({ phase: null, predicted: false, marker: 'expected' });
    expect(calendarDay('2026-07-30', { ...base, todayIso: '2026-08-03' }).phase).toBeNull();
  });
  test('marks a predicted start as missed once a full cycle has passed', () => {
    expect(calendarDay('2026-07-29', { ...base, todayIso: '2026-08-27' }).marker).toBe('missed');
  });
  test('marks the due day as an expected predicted period', () => {
    expect(calendarDay('2026-07-29', { ...base, todayIso: '2026-07-29' })).toEqual({
      phase: 'period',
      predicted: true,
      marker: 'expected',
    });
  });
  test('uses logged period days instead of the estimate for the confirmed cycle', () => {
    const logs = { '2026-07-01': { flow: 'medium' }, '2026-07-02': { flow: 'light' } };
    expect(calendarDay('2026-07-02', { ...base, logs, todayIso: '2026-07-10' }).phase).toBe('period');
    expect(calendarDay('2026-07-03', { ...base, logs, todayIso: '2026-07-10' }).phase).toBeNull();
  });
});
describe('periodLogStartForMonth', () => {
  test('starts today in the current month', () => {
    expect(periodLogStartForMonth(2026, 9, '2026-10-18')).toBe('2026-10-18');
  });
  test('starts on the 1st of a past month', () => {
    expect(periodLogStartForMonth(2025, 11, '2026-10-18')).toBe('2025-12-01');
  });
  test('cannot log in a future month', () => {
    expect(periodLogStartForMonth(2026, 11, '2026-10-18')).toBeNull();
  });
});
describe('logged periods', () => {
  const days = (from, n) => Object.fromEntries(Array.from({ length: n }, (_, i) => [addDays(from, i), { flow: 'medium' }]));
  const logs = { ...days('2026-10-07', 5), ...days('2026-10-20', 5), '2026-10-15': { mood: 'calm' } };
  test('groups flow days into periods', () => {
    expect(loggedPeriods(logs)).toEqual([
      { start: '2026-10-07', end: '2026-10-11' },
      { start: '2026-10-20', end: '2026-10-24' },
    ]);
  });
  test('finds the period around a day', () => {
    expect(periodAround(logs, '2026-10-09')).toEqual({ start: '2026-10-07', end: '2026-10-11' });
    expect(periodAround(logs, '2026-10-16')).toBeNull();
  });
  test('flags a new period that starts close to another one', () => {
    const one = days('2026-10-07', 5);
    expect(closePeriodStart({ logs: one, lastPeriodDate: '2026-10-07', start: '2026-10-20', end: '2026-10-24' })).toBe('2026-10-07');
  });
  test('does not flag a period a normal cycle away', () => {
    const one = days('2026-09-12', 5);
    expect(closePeriodStart({ logs: one, lastPeriodDate: '2026-09-12', start: '2026-10-07', end: '2026-10-11' })).toBeNull();
  });
  test('does not flag an edit that touches the same period', () => {
    const one = days('2026-10-07', 5);
    expect(closePeriodStart({ logs: one, lastPeriodDate: '2026-10-07', start: '2026-10-09', end: '2026-10-13' })).toBeNull();
  });
  test('counts the onboarding date when nothing is logged there', () => {
    expect(closePeriodStart({ logs: {}, lastPeriodDate: '2026-10-21', start: '2026-10-07', end: '2026-10-11' })).toBe('2026-10-21');
  });
});
