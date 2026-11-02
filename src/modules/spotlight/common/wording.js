export function freeLevelsText(n) {
  if (!n || n <= 0) return 'Every level costs SP to unlock.';
  if (n === 1) return 'Level 1 of every topic is free.';
  return `Levels 1 to ${n} of every topic are free.`;
}

export function freeLevelsShort(n) {
  if (!n || n <= 0) return 'every level costs SP';
  if (n === 1) return 'level 1 of every topic is free';
  return `levels 1–${n} of every topic are free`;
}
