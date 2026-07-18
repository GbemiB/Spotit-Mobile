import { A } from './actions.js';
import { todayISO } from '../utils/cycle.js';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '../constants/cycle.js';
import { levelInfo, LEVEL_ORDER } from '../utils/levels.js';

const MAX_HISTORY = 20;

export const INIT = {
  onboarded: false,
  authDone: false,
  authScreen: 'splash',
  accessToken: null,
  refreshToken: null,
  userId: null,
  pendingOtpId: null,
  pendingEmail: null,
  otpPurpose: null,
  otpExpiresAt: null,
  resetEmail: null,
  userName: 'Gbemisola',
  goal: 'track',
  dob: '',
  onboardStep: 0,
  onboardDraft: { name: '', dob: '', lastPeriod: '', goal: 'track', cycleLength: DEFAULT_CYCLE_LENGTH, periodLength: DEFAULT_PERIOD_LENGTH },
  cycleLength: DEFAULT_CYCLE_LENGTH,
  periodLength: DEFAULT_PERIOD_LENGTH,
  lastPeriodDate: null,
  femPoints: 1840,
  streak: 6,
  longestStreak: 12,
  lastLogDate: null,
  lastClaimedDate: null,
  logs: {},
  notifs: { period: true, ovulation: true, dailyLog: true, digest: false },
  themePref: 'system',
  isPremium: false,
  plan: null,
  renewsAt: null,
  autoRenew: false,
  history: [
    { icon: '🩸', label: 'Logged period start', delta: 50, date: 'Jun 16' },
    { icon: '📝', label: 'Daily mood & symptom log', delta: 30, date: 'Jun 22' },
    { icon: '📚', label: 'Read a health article', delta: 20, date: 'Jun 27' },
    { icon: '✅', label: 'Weekly health check-in', delta: 100, date: 'Jun 28' },
    { icon: '🎁', label: 'Daily check-in bonus', delta: 50, date: 'Jun 28' },
  ],
  // session
  screen: 'home',
  logOpen: false,
  logEditDate: null,
  toast: null,
  selDate: todayISO(),
  viewMonth: new Date().getMonth(),
  viewYear: new Date().getFullYear(),
  draftLog: { flow: null, mood: null, symptoms: [], notes: '', intimate: false },
  // Backend-fetched reference data — not persisted, refetched each session.
  cycleStatus: null,
  calendarPhases: {},
  contentFeed: null,
  insights: { trends: null, digest: null, regularity: null },
};

function openLog(state, dateISO) {
  const existing = state.logs[dateISO] || {};
  return {
    ...state,
    logOpen: true,
    logEditDate: dateISO,
    draftLog: {
      flow: existing.flow || null,
      mood: existing.mood || null,
      symptoms: existing.symptoms ? [...existing.symptoms] : [],
      notes: existing.notes || '',
      intimate: existing.intimate || false,
    },
  };
}

function withHistory(state, entry) {
  return { ...state, history: [entry, ...state.history].slice(0, MAX_HISTORY) };
}

// Called after the server confirms a save (POST /logs/{date}) — points, balance, and streak
// come back from PointsWriteService, so the client trusts them rather than recomputing locally.
function applySavedLog(state, { date, entry, pointsAwarded, newBalance, streak }) {
  const today = todayISO();
  let next = {
    ...state,
    logOpen: false,
    logEditDate: null,
    draftLog: { ...INIT.draftLog },
    logs: { ...state.logs, [date]: entry },
    lastLogDate: date === today ? today : state.lastLogDate,
    femPoints: newBalance,
    streak,
    longestStreak: Math.max(streak, state.longestStreak),
    toast: pointsAwarded > 0
      ? { icon: '🔥', text: `Logged! +${pointsAwarded} SP · ${streak}-day streak` }
      : { icon: '✓', text: 'Entry updated' },
  };
  if (pointsAwarded > 0) {
    next = withHistory(next, { icon: '📝', label: 'Logged flow, mood & symptoms', delta: pointsAwarded, date: 'Today' });
  }
  return next;
}

export function reducer(state, action) {
  switch (action.type) {
    case A.HYDRATE:
      return { ...state, ...action.payload };
    case A.GO:
      return { ...state, screen: action.screen };
    case A.OPEN_LOG:
      return openLog(state, action.date || todayISO());
    case A.CLOSE_LOG:
      return { ...state, logOpen: false, logEditDate: null, draftLog: { ...INIT.draftLog } };
    case A.ONBOARD_FIELD:
      return { ...state, onboardDraft: { ...state.onboardDraft, [action.field]: action.value } };
    case A.NEXT_ONBOARD:
      return { ...state, onboardStep: state.onboardStep + 1 };
    case A.PREV_ONBOARD:
      return { ...state, onboardStep: Math.max(0, state.onboardStep - 1) };
    case A.COMPLETE_ONBOARD:
      return {
        ...state,
        onboarded: true,
        authDone: true,
        authScreen: null,
        userName: state.onboardDraft.name || 'Friend',
        goal: action.goal || state.onboardDraft.goal,
        dob: state.onboardDraft.dob,
        lastPeriodDate: state.onboardDraft.lastPeriod || null,
        cycleLength: action.cycleLength ?? state.cycleLength,
        periodLength: action.periodLength ?? state.periodLength,
        onboardStep: 0,
        screen: 'home',
      };
    case A.SET_DRAFT_FLOW:
      return { ...state, draftLog: { ...state.draftLog, flow: action.id } };
    case A.SET_DRAFT_MOOD:
      return { ...state, draftLog: { ...state.draftLog, mood: action.id } };
    case A.TOGGLE_DRAFT_SYM: {
      const syms = state.draftLog.symptoms;
      return { ...state, draftLog: { ...state.draftLog, symptoms: syms.includes(action.id) ? syms.filter(x => x !== action.id) : [...syms, action.id] } };
    }
    case A.SET_DRAFT_NOTES:
      return { ...state, draftLog: { ...state.draftLog, notes: action.value } };
    case A.SET_DRAFT_INTIMATE:
      return { ...state, draftLog: { ...state.draftLog, intimate: action.value } };
    case A.SAVE_LOG:
      return applySavedLog(state, action);
    case A.DELETE_LOG: {
      const logs = { ...state.logs }; delete logs[action.date];
      return { ...state, logs };
    }
    case A.LOGS_HYDRATED:
      return { ...state, logs: { ...state.logs, ...action.logs } };
    case A.CYCLE_STATUS_HYDRATED:
      return { ...state, cycleStatus: action.status };
    case A.CALENDAR_PHASES_HYDRATED:
      return { ...state, calendarPhases: { ...state.calendarPhases, ...action.phases } };
    case A.CONTENT_FEED_HYDRATED:
      return { ...state, contentFeed: action.items };
    case A.INSIGHTS_HYDRATED:
      return { ...state, insights: { ...state.insights, ...action.insights } };
    case A.CLAIM_DAILY: {
      const today = todayISO();
      if (state.lastClaimedDate === today) return state;
      const next = { ...state, lastClaimedDate: today, femPoints: state.femPoints + 50, toast: { icon: '🎁', text: 'Daily reward claimed · +50 SP' } };
      return withHistory(next, { icon: '🎁', label: 'Daily check-in bonus', delta: 50, date: 'Today' });
    }
    case A.WATCH_AD: {
      const next = { ...state, femPoints: state.femPoints + 100, toast: { icon: '🎬', text: '+100 SpotPoints earned' } };
      return withHistory(next, { icon: '🎬', label: 'Watched a rewarded ad', delta: 100, date: 'Today' });
    }
    case A.TOGGLE_NOTIF:
      return { ...state, notifs: { ...state.notifs, [action.key]: !state.notifs[action.key] } };
    case A.SET_THEME:
      return { ...state, themePref: action.pref };
    case A.SUBSCRIPTION_UPDATED: {
      const { isPremium, plan, renewsAt, autoRenew, toast } = action;
      return { ...state, isPremium, plan, renewsAt, autoRenew, toast: toast ?? state.toast };
    }
    case A.REDEEM: {
      const { product } = action;
      const lv = levelInfo(state.femPoints);
      const levelOk = LEVEL_ORDER.indexOf(lv.name) >= LEVEL_ORDER.indexOf(product.minLevel);
      const premiumOk = !product.premium || state.isPremium;
      if (!levelOk || !premiumOk) {
        return { ...state, toast: { icon: '🌸', text: !levelOk ? `Unlocks at ${product.minLevel}` : 'Premium only' } };
      }
      if (state.femPoints < product.fp) {
        return { ...state, toast: { icon: '🌸', text: 'Not enough Spotit points yet' } };
      }
      const next = { ...state, femPoints: state.femPoints - product.fp, toast: { icon: '🎉', text: `${product.name} is on its way!` } };
      return withHistory(next, { icon: '🎁', label: `Redeemed ${product.name}`, delta: -product.fp, date: 'Today' });
    }
    case A.CLEAR_TOAST:
      return { ...state, toast: null };
    case A.SEL_DATE:
      return { ...state, selDate: action.date };
    case A.PREV_MONTH: {
      let m = state.viewMonth - 1, y = state.viewYear;
      if (m < 0) { m = 11; y--; }
      return { ...state, viewMonth: m, viewYear: y };
    }
    case A.NEXT_MONTH: {
      let m = state.viewMonth + 1, y = state.viewYear;
      if (m > 11) { m = 0; y++; }
      return { ...state, viewMonth: m, viewYear: y };
    }
    case A.UPDATE_SETTINGS:
      return { ...state, ...action.patch };
    case A.SET_AUTH_SCREEN:
      if (action.screen === null) return { ...state, authScreen: null, authDone: true };
      return { ...state, authScreen: action.screen };
    case A.AUTH_SUCCESS:
      return {
        ...state,
        accessToken: action.accessToken,
        refreshToken: action.refreshToken,
        userId: action.userId,
        onboarded: action.onboarded ?? state.onboarded,
        authDone: true,
        authScreen: null,
        pendingOtpId: null,
        pendingEmail: null,
        otpPurpose: null,
        otpExpiresAt: null,
      };
    case A.TOKENS_REFRESHED:
      // POST /auth/refresh only rotates the access token — refreshToken is omitted from the
      // action and stays whatever's already in state.
      return { ...state, accessToken: action.accessToken };
    case A.LOGOUT:
      // Clears the onboarding draft (dob, last period, cycle/period length, goal) too — otherwise
      // the next login on this device (same account or a different one) lands back on the
      // onboarding calendar still showing whatever was previously picked.
      return {
        ...state,
        authDone: false,
        authScreen: 'welcome',
        accessToken: null,
        refreshToken: null,
        userId: null,
        onboardStep: INIT.onboardStep,
        onboardDraft: { ...INIT.onboardDraft },
      };
    case A.RESET_DATA:
      return { ...INIT, onboarded: false, authDone: false, authScreen: 'welcome', femPoints: 0, streak: 0, longestStreak: 0, logs: {}, screen: 'home' };
    default:
      return state;
  }
}
