import { phases } from '../styles/colors.js';
import { PHASE_LABELS } from '../constants/cycle.js';

export function toISO(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function todayISO() {
  return toISO(new Date());
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Builds from local Y/M/D components (not a raw Date offset) for the same reason
// formatDisplayDate/nextPeriodDate do — parsing a "YYYY-MM-DD" string as UTC midnight
// shifts it a calendar day west of UTC.
export function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + n);
  return toISO(date);
}

export function datesBetween(startIso, endIso) {
  const dates = [];
  for (let d = startIso; d <= endIso; d = addDays(d, 1)) {
    dates.push(d);
  }
  return dates;
}

export function cycleDayOf(dateISO, lastPeriodDate, cycleLength) {
  if (!lastPeriodDate) return null;
  const target = new Date(dateISO);
  const start = new Date(lastPeriodDate);
  target.setHours(12, 0, 0, 0);
  start.setHours(12, 0, 0, 0);
  const diff = Math.round((target - start) / 86400000);
  return (((diff % cycleLength) + cycleLength) % cycleLength) + 1;
}

export function phaseFor(cycleDay, periodLength = 5, cycleLength = 28) {
  if (cycleDay == null) return { key: null, label: null, color: null };
  const ovDay = cycleLength - 14;
  let key;
  if (cycleDay <= periodLength) key = 'period';
  else if (cycleDay === ovDay) key = 'ovulation';
  else if (cycleDay >= ovDay - 4 && cycleDay < ovDay) key = 'fertile';
  else if (cycleDay > ovDay) key = 'luteal';
  else key = 'follicular';
  return { key, label: PHASE_LABELS[key], color: phases[key] };
}

export function nextPeriodDate(lastPeriodDate, cycleLength) {
  if (!lastPeriodDate) return null;
  // Route through cycleDayOf (todayISO() vs. the stored lastPeriodDate string) instead of
  // diffing `new Date()` against `new Date(lastPeriodDate)` directly — the latter parses the
  // plain YYYY-MM-DD string as UTC midnight, which lands on the previous local calendar day
  // for any timezone west of UTC, desyncing it by a day from the real `new Date()` instant.
  const todayIso = todayISO();
  const cycleDay = cycleDayOf(todayIso, lastPeriodDate, cycleLength);
  const daysLeft = cycleLength - cycleDay + 1;
  const [y, m, d] = todayIso.split('-').map(Number);
  const next = new Date(y, m - 1, d);
  next.setDate(next.getDate() + daysLeft);
  return next;
}

export function formatDisplayDate(isoOrDate) {
  if (!isoOrDate) return null;
  // A plain "YYYY-MM-DD" string parses as UTC midnight — formatting that with
  // toLocaleDateString (which reads local Y/M/D) shows the previous calendar day for any
  // timezone west of UTC. Build the Date from local Y/M/D components instead when we're
  // given a date-only string; Date instances (e.g. computed nextPeriodDate) pass through as-is.
  let d;
  if (typeof isoOrDate === 'string') {
    const [y, m, day] = isoOrDate.split('-').map(Number);
    d = new Date(y, m - 1, day);
  } else {
    d = new Date(isoOrDate);
  }
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}
