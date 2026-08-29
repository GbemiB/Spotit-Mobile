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
