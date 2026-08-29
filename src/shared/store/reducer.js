import { A } from './actions.js';
import { todayISO } from '../utils/cycle.js';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH } from '../constants/cycle.js';
import { toLevelList } from '../utils/levels.js';

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
  userName: 'Friend',
  goal: 'track',
  dob: '',
  onboardStep: 0,
  onboardDraft: {
    name: '',
    dob: '',
    lastPeriod: '',
    goal: 'track',
    cycleLength: DEFAULT_CYCLE_LENGTH,
    periodLength: DEFAULT_PERIOD_LENGTH,
  },
  cycleLength: DEFAULT_CYCLE_LENGTH,
  periodLength: DEFAULT_PERIOD_LENGTH,
  lastPeriodDate: null,
  femPoints: 0,
  streak: 0,
  longestStreak: 0,
  lastLogDate: null,
  lastClaimedDate: null,
  logs: {},
  notifs: { period: true, ovulation: true, dailyLog: true, digest: false },
  themePref: 'system',
  isPremium: false,
  plan: null,
  renewsAt: null,
  autoRenew: false,
  history: [],
  badges: [],
  // Exclusively DB-backed (GET /rewards/levels) — no local fallback data. Empty until that
  // fetch resolves; levelInfo() returns a null-name "not loaded yet" shape for that window.
  levels: [],
  challenges: [],
  shopProducts: [],
  // session
  screen: 'home',
  periodPickerOpen: false,
  toast: null,
  selDate: todayISO(),
  viewMonth: new Date().getMonth(),
  viewYear: new Date().getFullYear(),
  // Tracks the actual calendar date — not persisted (todayISO() re-seeds it fresh each
  // session). Bumped by App.js's AppState listener so screens whose effects depend on it
  // (e.g. HomeScreen's cycle/current and logs-window fetches) refetch when the app resumes
  // from the background on a new day, instead of a stale cycle day sitting there until some
  // unrelated dependency happens to change.
  today: todayISO(),
  // Backend-fetched reference data — not persisted, refetched each session.
  cycleStatus: null,
  calendarPhases: {},
  insights: { trends: null, digest: null, regularity: null },
};

function withHistory(state, entry) {
  return { ...state, history: [entry, ...state.history].slice(0, MAX_HISTORY) };
}

// Called after the server confirms a save (POST /logs/{date}) — points, balance, and streak
// come back from PointsWriteService, so the client trusts them rather than recomputing locally.
function applySavedLog(state, { date, entry, pointsAwarded, newBalance, streak }) {
  const today = todayISO();
  let next = {
    ...state,
    logs: { ...state.logs, [date]: entry },
    lastLogDate: date === today ? today : state.lastLogDate,
    femPoints: newBalance,
    streak,
    longestStreak: Math.max(streak, state.longestStreak),
    toast:
      pointsAwarded > 0
        ? { icon: '🔥', text: `Logged! +${pointsAwarded} SP · ${streak}-day streak` }
        : { icon: '✓', text: 'Entry updated' },
  };
  if (pointsAwarded > 0) {
    next = withHistory(next, { icon: '📝', label: 'Logged flow, mood & symptoms', delta: pointsAwarded, date: todayISO() });
  }
  return next;
}

// Called after PUT /logs/period confirms a period-start save — flow is set across every
// date in the range, but the richer entry (mood/symptoms/notes/intimate) only applies to
// `date` (the period's first day), matching what the backend actually persisted per-day.
function applySavedPeriod(state, { dates, flow, date, entry, lastPeriodDate, pointsAwarded, newBalance, streak, clearedEntries }) {
  const today = todayISO();
  const logs = { ...state.logs };
  dates.forEach(d => {
    logs[d] = d === date ? entry : { ...(logs[d] || {}), flow };
  });
  // If this edit moved or shrank a previously logged period, the backend already cleared the
  // now-stale boundary days server-side — apply the same correction to the local cache, or a
  // calendar dot for one of those days keeps showing from stale client state alone.
  (clearedEntries || []).forEach(e => {
    const isEmpty = !e.flow && !e.mood && (!e.symptoms || e.symptoms.length === 0) && !e.notes && !e.intimate;
    if (isEmpty) {
      delete logs[e.date];
    } else {
      logs[e.date] = { flow: e.flow, mood: e.mood, symptoms: e.symptoms, notes: e.notes, intimate: e.intimate };
    }
  });
  let next = {
    ...state,
    logs,
    lastPeriodDate: lastPeriodDate ?? state.lastPeriodDate,
    // Drop the cached server prediction — it was computed off the old lastPeriodDate, so it
    // would otherwise keep overriding HomeScreen's (now-correct) local fallback calculation
    // until App.js's cycle/current effect re-fetches a fresh one.
    cycleStatus: null,
    lastLogDate: dates.includes(today) ? today : state.lastLogDate,
    femPoints: newBalance,
    streak,
    longestStreak: Math.max(streak, state.longestStreak),
    toast:
      pointsAwarded > 0
        ? { icon: '🔥', text: `Logged! +${pointsAwarded} SP · ${streak}-day streak` }
        : { icon: '✓', text: 'Period logged' },
  };
  if (pointsAwarded > 0) {
    next = withHistory(next, { icon: '📝', label: 'Logged period', delta: pointsAwarded, date: todayISO() });
  }
  return next;
}

export function reducer(state, action) {
  switch (action.type) {
    case A.HYDRATE: {
      const merged = { ...state, ...action.payload };
      // Guards against corrupted/partial persisted state (e.g. a write interrupted between
      // COMPLETE_ONBOARD and AUTH_SUCCESS) — authDone with no token would otherwise render
      // the main app with every authenticated call permanently and silently 401ing, and no
      // token means apiRequest's 401-retry never fires (it's gated on options.token) either.
      if (merged.authDone && !merged.accessToken) {
        return { ...merged, authDone: false, authScreen: 'welcome', accessToken: null, refreshToken: null, userId: null };
      }
      return merged;
    }
    case A.TODAY_CHANGED: {
      // No-op (same object identity) when the date hasn't actually moved, so this doesn't
      // trigger a re-render/refetch churn on every app foreground — only on an actual day change.
      if (action.today === state.today) return state;
      return { ...state, today: action.today };
    }
    case A.GO:
      return { ...state, screen: action.screen };
    case A.OPEN_PERIOD_PICKER:
      return { ...state, periodPickerOpen: true };
    case A.CLOSE_PERIOD_PICKER:
      return { ...state, periodPickerOpen: false };
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
    case A.SAVE_LOG:
      return applySavedLog(state, action);
    case A.SAVE_LOG_PERIOD:
      return applySavedPeriod(state, action);
    case A.DELETE_LOG: {
      const logs = { ...state.logs };
      delete logs[action.date];
      return { ...state, logs };
    }
    case A.LOGS_HYDRATED:
      return { ...state, logs: { ...state.logs, ...action.logs } };
    case A.CYCLE_STATUS_HYDRATED:
      return { ...state, cycleStatus: action.status };
    case A.CALENDAR_PHASES_HYDRATED:
      return { ...state, calendarPhases: { ...state.calendarPhases, ...action.phases } };
    case A.INSIGHTS_HYDRATED:
      return { ...state, insights: { ...state.insights, ...action.insights } };
    // Rewards/shop/settings mutations below all echo a server response (PointsWriteService /
    // ShopWriteService / ChallengeWriteService are the source of truth for balances) — the
    // client applies what came back rather than computing deltas itself.
    case A.DAILY_CLAIM_RESULT: {
      const { pointsAwarded, newBalance, alreadyClaimedToday } = action;
      if (alreadyClaimedToday) return { ...state, toast: { icon: '🎁', text: 'Already claimed today — come back tomorrow' } };
      const next = {
        ...state,
        lastClaimedDate: todayISO(),
        femPoints: newBalance,
        toast: { icon: '🎁', text: `Daily reward claimed · +${pointsAwarded} SP` },
      };
      return withHistory(next, { icon: '🎁', label: 'Daily check-in bonus', delta: pointsAwarded, date: todayISO() });
    }
    case A.AD_WATCH_RESULT: {
      const { pointsAwarded, newBalance } = action;
      const next = { ...state, femPoints: newBalance, toast: { icon: '🎬', text: `+${pointsAwarded} SpotPoints earned` } };
      return withHistory(next, { icon: '🎬', label: 'Watched a rewarded ad', delta: pointsAwarded, date: todayISO() });
    }
    case A.CHALLENGE_CLAIM_RESULT: {
      const { challengeId, pointsAwarded, newBalance } = action;
      const next = {
        ...state,
        femPoints: newBalance,
        challenges: state.challenges.map(c => (c.id === challengeId ? { ...c, claimed: true } : c)),
        toast: { icon: '🏆', text: `Challenge reward claimed · +${pointsAwarded} SP` },
      };
      return withHistory(next, { icon: '🏆', label: 'Claimed a challenge reward', delta: pointsAwarded, date: todayISO() });
    }
    case A.REDEEM_RESULT: {
      const { productId, productName, pointsSpent, newBalance } = action;
      const next = {
        ...state,
        femPoints: newBalance,
        shopProducts: state.shopProducts.map(p => (p.id === productId ? { ...p, locked: true, lockReason: 'redeemed' } : p)),
        toast: { icon: '🎉', text: `${productName} is on its way!` },
      };
      return withHistory(next, { icon: '🎁', label: `Redeemed ${productName}`, delta: -pointsSpent, date: todayISO() });
    }
    case A.TOGGLE_NOTIF:
      return { ...state, notifs: { ...state.notifs, [action.key]: !state.notifs[action.key] } };
    case A.NOTIFICATIONS_HYDRATED:
    case A.NOTIFICATIONS_UPDATED:
      return { ...state, notifs: { period: action.period, ovulation: action.ovulation, dailyLog: action.dailyLog, digest: action.digest } };
    case A.SET_THEME:
      return { ...state, themePref: action.pref };
    case A.SUBSCRIPTION_UPDATED: {
      const { isPremium, plan, renewsAt, autoRenew, toast } = action;
      return { ...state, isPremium, plan, renewsAt, autoRenew, toast: toast ?? state.toast };
    }
    case A.PROFILE_HYDRATED:
    case A.PROFILE_UPDATED: {
      // GET/PATCH /users/me both return the complete current profile (not a partial patch
      // echo) — assign every field as-is, including nulls, rather than falling back to the
      // old state on a nullish value (e.g. a genuinely-cleared lastPeriodDate).
      const { firstName, lastName, goal, dob, cycleLength, periodLength, lastPeriodDate, themePref, isPremium } = action;
      const userName = [firstName, lastName].filter(Boolean).join(' ').trim();
      return {
        ...state,
        userName: userName || state.userName,
        goal,
        dob,
        cycleLength,
        periodLength,
        lastPeriodDate,
        themePref,
        isPremium,
      };
    }
    case A.REWARDS_HYDRATED: {
      const { points, streak, longestStreak } = action;
      return { ...state, femPoints: points, streak, longestStreak: Math.max(longestStreak, state.longestStreak) };
    }
    case A.BADGES_HYDRATED:
      return { ...state, badges: action.badges };
    case A.LEVELS_HYDRATED:
      return { ...state, levels: action.levels.length ? toLevelList(action.levels) : state.levels };
    case A.CHALLENGES_HYDRATED:
      return { ...state, challenges: action.challenges };
    case A.SHOP_PRODUCTS_HYDRATED:
      return { ...state, shopProducts: action.products };
    case A.HISTORY_HYDRATED:
      return { ...state, history: action.entries };
    case A.SHOW_TOAST:
      return { ...state, toast: { icon: action.icon, text: action.text } };
    case A.CLEAR_TOAST:
      return { ...state, toast: null };
    case A.SEL_DATE:
      return { ...state, selDate: action.date };
    case A.PREV_MONTH: {
      let m = state.viewMonth - 1,
        y = state.viewYear;
      if (m < 0) {
        m = 11;
        y--;
      }
      return { ...state, viewMonth: m, viewYear: y };
    }
    case A.NEXT_MONTH: {
      let m = state.viewMonth + 1,
        y = state.viewYear;
      if (m > 11) {
        m = 0;
        y++;
      }
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
      return {
        ...INIT,
        onboarded: false,
        authDone: false,
        authScreen: 'welcome',
        femPoints: 0,
        streak: 0,
        longestStreak: 0,
        logs: {},
        screen: 'home',
      };
    default:
      return state;
  }
}
