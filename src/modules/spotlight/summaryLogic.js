import AsyncStorage from '@react-native-async-storage/async-storage';

const RANK_KEY = 'spotit_spotlight_rank_';
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

export function streakLabel(streak) {
  if (!streak) return 'Start a streak today';
  return streak === 1 ? '1-day streak' : `${streak}-day streak`;
}

export function summaryLine(stats) {
  const run = stats?.bestRun || 0;
  const topics = stats?.topicsStarted || 0;
  if (!run && !topics) return null;
  const runText = `${run} right in a row`;
  const topicText = topics === 1 ? '1 topic started' : `${topics} topics started`;
  return { run: runText, topics: topicText };
}

export function isRankUp(storedId, rank) {
  return !!rank && !!storedId && storedId !== rank.id;
}

export async function readSeenRank(userId) {
  if (!userId) return null;
  try {
    return await AsyncStorage.getItem(RANK_KEY + userId);
  } catch {
    return null;
  }
}

export async function saveSeenRank(userId, rankId) {
  if (!userId || !rankId) return;
  try {
    await AsyncStorage.setItem(RANK_KEY + userId, rankId);
  } catch {
    return;
  }
}
