// No local level data at all — tiers come exclusively from GET /rewards/levels (DB-backed, see
// LevelDefinitionService on the backend). `levels` is required here on purpose: callers must
// pass whatever's currently in state.levels (empty array until that fetch resolves), rather
// than this module silently supplying its own copy of the thresholds.

// Maps the API shape (GET /rewards/levels: {name, pointsLow, pointsHigh}) to the {name, lo, hi}
// shape levelInfo/levelOrderFor use locally.
export function toLevelList(apiLevels) {
  return apiLevels.map(l => ({ name: l.name, lo: l.pointsLow, hi: l.pointsHigh }));
}

export function levelOrderFor(levels) {
  return [...levels.map(l => l.name), 'Goddess'];
}

// Returns a null-ish "not loaded yet" shape (name: null) when `levels` is empty, instead of
// crashing or making up a level — callers should treat level.name == null as still-loading.
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
