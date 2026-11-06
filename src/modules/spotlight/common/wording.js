export function freeLevelsText(n) {
  if (n == null) return '';
  if (n <= 0) return 'Every level costs SP to unlock.';
  if (n === 1) return 'Level 1 of every topic is free.';
  return `Levels 1 to ${n} of every topic are free.`;
}

export function freeLevelsBadge(n) {
  if (!n || n <= 0) return '';
  return n === 1 ? 'Level 1 free' : `Levels 1–${n} free`;
}

export function gameError(e) {
  if (e?.status === 402) return 'You don’t have enough SpotPoints for that yet.';
  return e?.message || 'Something went wrong. Please try again.';
}
