import AsyncStorage from '@react-native-async-storage/async-storage';

const INVITE_KEY = 'spotit_spotlight_invite_';
const GUIDE_KEY = 'spotit_spotlight_guide_seen_';
const EMPTY = { lastShownOn: null, lastVisitOn: null, dismissals: 0 };

function dayNumber(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

export function daysSince(fromIso, toIso) {
  if (!fromIso || !toIso) return Infinity;
  return dayNumber(toIso) - dayNumber(fromIso);
}

export function shouldInvite(record, invite, today) {
  if (!invite || invite.enabled === false) return false;
  const r = { ...EMPTY, ...record };
  const maxDismissals = invite.maxDismissals > 0 ? invite.maxDismissals : 3;
  const everyDays = invite.everyDays > 0 ? invite.everyDays : 3;
  if (r.dismissals >= maxDismissals) return false;
  const latest = [r.lastShownOn, r.lastVisitOn].filter(Boolean).sort().pop();
  return !latest || daysSince(latest, today) >= everyDays;
}

export function mightInvite(record, today) {
  const r = { ...EMPTY, ...record };
  return r.lastShownOn !== today && r.lastVisitOn !== today;
}

export function afterShown(record, today) {
  return { ...EMPTY, ...record, lastShownOn: today };
}

export function afterLater(record) {
  const r = { ...EMPTY, ...record };
  return { ...r, dismissals: r.dismissals + 1 };
}

export function afterVisit(record, today) {
  return { ...EMPTY, ...record, lastVisitOn: today, dismissals: 0 };
}

export async function readInvite(userId) {
  if (!userId) return { ...EMPTY };
  try {
    const raw = await AsyncStorage.getItem(INVITE_KEY + userId);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export async function saveInvite(userId, record) {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(INVITE_KEY + userId, JSON.stringify(record));
  } catch {
    return;
  }
}

export async function updateInvite(userId, change) {
  const next = change(await readInvite(userId));
  await saveInvite(userId, next);
  return next;
}

export async function wasGuideSeen(userId) {
  if (!userId) return true;
  try {
    return (await AsyncStorage.getItem(GUIDE_KEY + userId)) === '1';
  } catch {
    return true;
  }
}

export async function markGuideSeen(userId) {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(GUIDE_KEY + userId, '1');
  } catch {
    return;
  }
}
