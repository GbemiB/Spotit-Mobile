import { phases } from '../styles/colors.js';
import { PHASE_LABELS } from '../constants/cycle.js';

export function toISO(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function todayISO() { return toISO(new Date()); }

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function cycleDayOf(dateISO, lastPeriodDate, cycleLength) {
  const target = new Date(dateISO);
  const start = new Date(lastPeriodDate);
  target.setHours(12, 0, 0, 0);
  start.setHours(12, 0, 0, 0);
  const diff = Math.round((target - start) / 86400000);
  return ((diff % cycleLength) + cycleLength) % cycleLength + 1;
}

export function phaseFor(cycleDay, periodLength = 5, cycleLength = 28) {
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
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const start = new Date(lastPeriodDate);
  start.setHours(12, 0, 0, 0);
  const diff = Math.round((today - start) / 86400000);
  const cycleDay = ((diff % cycleLength) + cycleLength) % cycleLength + 1;
  const daysLeft = cycleLength - cycleDay + 1;
  const next = new Date(today);
  next.setDate(next.getDate() + daysLeft);
  return next;
}

export function formatDisplayDate(isoOrDate) {
  const d = new Date(isoOrDate);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}
