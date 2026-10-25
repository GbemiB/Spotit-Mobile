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
  let key = null;
  if (cycleDay <= periodLength) key = 'period';
  else if (cycleDay === ovDay) key = 'ovulation';
  else if (cycleDay >= ovDay - 5 && cycleDay < ovDay) key = 'fertile';
  return { key, label: key ? PHASE_LABELS[key] : null, color: key ? phases[key] : null };
}
export function nextMilestone(cycleDay, cycleLength, periodLength) {
  if (cycleDay == null) return null;
  const ovDay = cycleLength - 14;
  const fertileStart = ovDay - 5;
  if (cycleDay <= periodLength) return { key: 'period', daysUntil: 0 };
  if (cycleDay === ovDay) return { key: 'ovulation', daysUntil: 0 };
  if (cycleDay >= fertileStart && cycleDay < ovDay) return { key: 'fertile', daysUntil: 0 };
  const distanceTo = target => (((target - cycleDay) % cycleLength) + cycleLength) % cycleLength;
  const candidates = [
    { key: 'period', daysUntil: distanceTo(1) },
    { key: 'fertile', daysUntil: distanceTo(fertileStart) },
    { key: 'ovulation', daysUntil: distanceTo(ovDay) },
  ];
  return candidates.reduce((soonest, c) => (c.daysUntil < soonest.daysUntil ? c : soonest));
}
export function nextPeriodDate(lastPeriodDate, cycleLength) {
  if (!lastPeriodDate) return null;
  const todayIso = todayISO();
  const cycleDay = cycleDayOf(todayIso, lastPeriodDate, cycleLength);
  const daysLeft = cycleLength - cycleDay + 1;
  const [y, m, d] = todayIso.split('-').map(Number);
  const next = new Date(y, m - 1, d);
  next.setDate(next.getDate() + daysLeft);
  return next;
}
function daysBetween(fromIso, toIso) {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  from.setHours(12, 0, 0, 0);
  to.setHours(12, 0, 0, 0);
  return Math.round((to - from) / 86400000);
}
export function periodStatus(todayIso, lastPeriodDate, cycleLength) {
  if (!lastPeriodDate || !cycleLength) return null;
  const diff = daysBetween(lastPeriodDate, todayIso);
  if (diff < cycleLength) {
    return {
      state: 'tracking',
      cycleDay: cycleDayOf(todayIso, lastPeriodDate, cycleLength),
      daysLate: 0,
      expectedDate: addDays(lastPeriodDate, cycleLength),
      missedCycles: 0,
    };
  }
  const cycles = Math.floor(diff / cycleLength);
  const daysLate = diff - cycles * cycleLength;
  return {
    state: daysLate === 0 ? 'due' : 'late',
    cycleDay: cycleLength,
    daysLate,
    expectedDate: addDays(lastPeriodDate, cycles * cycleLength),
    missedCycles: cycles - 1,
  };
}
export function trackingStartOf(storedStart, lastPeriodDate) {
  if (storedStart) return storedStart;
  return lastPeriodDate ? `${lastPeriodDate.slice(0, 7)}-01` : null;
}
export function calendarDay(iso, { lastPeriodDate, cycleLength, periodLength, trackingStart, logs = {}, todayIso }) {
  const none = { phase: null, predicted: false, marker: null };
  const start = trackingStartOf(trackingStart, lastPeriodDate);
  if (start && iso < start) return none;
  if (logs[iso]?.flow) return { phase: 'period', predicted: false, marker: null };
  if (!lastPeriodDate || !cycleLength || iso < lastPeriodDate) return none;
  const diff = daysBetween(lastPeriodDate, iso);
  if (diff < cycleLength) {
    const key = phaseFor(diff + 1, periodLength, cycleLength).key;
    const cycleEnd = addDays(lastPeriodDate, cycleLength);
    const loggedThisCycle = Object.keys(logs).some(d => logs[d]?.flow && d >= lastPeriodDate && d < cycleEnd);
    return { phase: loggedThisCycle && key === 'period' ? null : key, predicted: false, marker: null };
  }
  const expectedStart = diff % cycleLength === 0;
  if (iso < todayIso) {
    const marker = expectedStart ? (addDays(iso, cycleLength) > todayIso ? 'expected' : 'missed') : null;
    return { phase: null, predicted: false, marker };
  }
  const key = phaseFor(cycleDayOf(iso, lastPeriodDate, cycleLength), periodLength, cycleLength).key;
  return { phase: key, predicted: true, marker: expectedStart && iso === todayIso ? 'expected' : null };
}
export function formatDisplayDate(isoOrDate) {
  if (!isoOrDate) return null;
  let d;
  if (typeof isoOrDate === 'string') {
    const [y, m, day] = isoOrDate.split('-').map(Number);
    d = new Date(y, m - 1, day);
  } else {
    d = new Date(isoOrDate);
  }
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}
export function periodLogStartForMonth(year, month, todayIso) {
  const first = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  if (first.slice(0, 7) === todayIso.slice(0, 7)) return todayIso;
  return first < todayIso ? first : null;
}
const PERIOD_GAP_DAYS = 2;
export const CLOSE_PERIOD_DAYS = 15;
function daysApart(a, b) {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round(Math.abs(new Date(ay, am - 1, ad) - new Date(by, bm - 1, bd)) / 86400000);
}
export function loggedPeriods(logs) {
  const days = Object.keys(logs || {})
    .filter(d => logs[d]?.flow)
    .sort();
  const periods = [];
  days.forEach(d => {
    const last = periods[periods.length - 1];
    if (last && d <= addDays(last.end, PERIOD_GAP_DAYS)) {
      last.end = d;
    } else {
      periods.push({ start: d, end: d });
    }
  });
  return periods;
}
export function periodAround(logs, iso) {
  if (!iso) return null;
  return loggedPeriods(logs).find(p => iso >= addDays(p.start, -PERIOD_GAP_DAYS) && iso <= addDays(p.end, PERIOD_GAP_DAYS)) || null;
}
export function closePeriodStart({ logs, lastPeriodDate, start, end }) {
  const periods = loggedPeriods(logs);
  if (lastPeriodDate && !periodAround(logs, lastPeriodDate)) periods.push({ start: lastPeriodDate, end: lastPeriodDate });
  const close = periods
    .filter(p => !(start <= addDays(p.end, PERIOD_GAP_DAYS) && end >= addDays(p.start, -PERIOD_GAP_DAYS)))
    .filter(p => daysApart(p.start, start) < CLOSE_PERIOD_DAYS)
    .sort((a, b) => daysApart(a.start, start) - daysApart(b.start, start));
  return close.length ? close[0].start : null;
}
