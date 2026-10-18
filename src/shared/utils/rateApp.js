import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as StoreReview from 'expo-store-review';
const STATE_KEY = 'spotit_rating_state';
const DAY_MS = 24 * 60 * 60 * 1000;
export const RATING_RULES = { minDaysInstalled: 7, minLogs: 3, daysBetweenAsks: 90, maxAsksPerYear: 3 };
export const RATING_DELAY_MS = 1500;
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.spotit.app';
export const canRateApp = Platform.OS === 'android';
export function isRatingDue({ installedAt, logCount, asks }, now) {
  if (!installedAt || now - installedAt < RATING_RULES.minDaysInstalled * DAY_MS) return false;
  if (logCount < RATING_RULES.minLogs) return false;
  if (asks.filter(t => now - t < 365 * DAY_MS).length >= RATING_RULES.maxAsksPerYear) return false;
  return now - Math.max(0, ...asks) >= RATING_RULES.daysBetweenAsks * DAY_MS;
}
async function readState() {
  try {
    const saved = JSON.parse((await AsyncStorage.getItem(STATE_KEY)) || '{}');
    return {
      logCount: Number(saved.logCount) || 0,
      asks: Array.isArray(saved.asks) ? saved.asks : [],
      firstSeenAt: saved.firstSeenAt || null,
    };
  } catch {
    return { logCount: 0, asks: [], firstSeenAt: null };
  }
}
async function installedAt(fallback) {
  try {
    const time = (await Application.getInstallationTimeAsync())?.getTime();
    if (time) return time;
  } catch {}
  return fallback;
}
async function check(countLog) {
  if (!canRateApp) return false;
  try {
    const now = Date.now();
    const state = await readState();
    if (!state.firstSeenAt) state.firstSeenAt = now;
    if (countLog) state.logCount += 1;
    const facts = { installedAt: await installedAt(state.firstSeenAt), logCount: state.logCount, asks: state.asks };
    const due = isRatingDue(facts, now) && (await StoreReview.isAvailableAsync());
    if (due) state.asks = [...state.asks, now].slice(-RATING_RULES.maxAsksPerYear);
    await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state));
    if (due) setTimeout(() => StoreReview.requestReview().catch(() => {}), RATING_DELAY_MS);
    return due;
  } catch {
    return false;
  }
}
let queue = Promise.resolve(false);
function enqueue(countLog) {
  const run = queue.then(() => check(countLog));
  queue = run.catch(() => false);
  return run;
}
export function noteLogSaved() {
  return enqueue(true);
}
export function noteLevelUp() {
  return enqueue(false);
}
export function openStoreListing() {
  return Linking.openURL(StoreReview.storeUrl() || PLAY_STORE_URL).catch(() => {});
}
