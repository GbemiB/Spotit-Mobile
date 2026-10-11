// The countdown days a reminder can be sent on. 0 is the predicted day itself.
export const DAY_OPTIONS = [
  { days: 3, label: '3 days before' },
  { days: 2, label: '2 days before' },
  { days: 1, label: '1 day before' },
  { days: 0, label: 'On the day' },
];
// Adds or removes one day, keeping the list in countdown order (largest first).
export function toggleDay(selected, day) {
  const next = selected.includes(day) ? selected.filter(d => d !== day) : [...selected, day];
  return next.sort((a, b) => b - a);
}
// "06:00" -> "6:00 AM", "20:30" -> "8:30 PM"
export function timeLabel(time) {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
