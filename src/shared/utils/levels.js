export function toLevelList(apiLevels) {
  return apiLevels.map(l => ({ name: l.name, lo: l.pointsLow, hi: l.pointsHigh }));
}
export function levelOrderFor(levels) {
  return [...levels.map(l => l.name), 'Goddess'];
}
export function levelInfo(fp, levels) {
  if (!levels || levels.length === 0) {
    return { name: null, lo: 0, hi: 0, pct: 0, next: null, idx: -1 };
  }
  for (let i = 0; i < levels.length; i++) {
    const { name, lo, hi } = levels[i];
    if (fp < hi) return { name, lo, hi, pct: (fp - lo) / (hi - lo), next: levels[i + 1] || null, idx: i };
  }
  const top = levels[levels.length - 1];
  return { name: 'Goddess', lo: top.hi, hi: top.hi, pct: 1, next: null, idx: levels.length };
}
