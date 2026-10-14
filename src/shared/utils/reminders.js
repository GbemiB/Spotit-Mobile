export const DAY_OPTIONS = [
  { days: 2, label: '2 days before' },
  { days: 1, label: '1 day before' },
  { days: 0, label: 'On the day' },
];
export function toggleDay(selected, day) {
  const next = selected.includes(day) ? selected.filter(d => d !== day) : [...selected, day];
  return next.sort((a, b) => b - a);
}
export function timeLabel(time) {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
