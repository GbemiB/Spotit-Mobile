const LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function rankProgress(rank, stars) {
  if (!rank) return { pct: 0, line: null, top: false };
  if (rank.nextMinStars == null) return { pct: 1, line: 'Top level reached', top: true };
  const span = Math.max(1, rank.nextMinStars - rank.minStars);
  const pct = Math.min(1, Math.max(0, (stars - rank.minStars) / span));
  const need = Math.max(0, rank.nextMinStars - stars);
  return { pct, need, next: rank.nextName, line: `${need} more ${need === 1 ? 'star' : 'stars'} to ${rank.nextName}`, top: false };
}

export function weekDays(todayIso, week = []) {
  const [y, m, d] = todayIso.split('-').map(Number);
  const today = new Date(Date.UTC(y, m - 1, d));
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today.getTime() - (6 - i) * 86400000);
    return { key: i, letter: LETTERS[day.getUTCDay()], played: !!week[i], today: i === 6 };
  });
}
