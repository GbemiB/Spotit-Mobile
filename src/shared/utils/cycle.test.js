import { toISO, todayISO, daysInMonth, cycleDayOf, phaseFor, nextPeriodDate, formatDisplayDate, addDays, datesBetween } from './cycle.js';

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
  const cycleLength = 28; // ovDay = 14

  test.each([
    [1, 'period'],
    [5, 'period'],
    [6, 'follicular'],
    [9, 'follicular'],
    [10, 'fertile'],
    [13, 'fertile'],
    [14, 'ovulation'],
    [15, 'luteal'],
    [28, 'luteal'],
  ])('cycle day %i is %s', (cycleDay, expectedKey) => {
    expect(phaseFor(cycleDay, periodLength, cycleLength).key).toBe(expectedKey);
  });

  test('a null cycle day returns a null phase', () => {
    expect(phaseFor(null, periodLength, cycleLength)).toEqual({ key: null, label: null, color: null });
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
    const lastPeriod = toISO(new Date(y, m - 1, d - 27)); // today is cycle day 28 of 28
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
    // A naive `new Date('2026-07-28')` parses as UTC midnight, which would display as
    // "July 27" in any timezone west of UTC — this must always show the 28th.
    expect(formatDisplayDate('2026-07-28')).toBe('July 28');
  });

  test('formats a Date instance directly', () => {
    expect(formatDisplayDate(new Date(2026, 6, 4))).toBe('July 4');
  });
});
