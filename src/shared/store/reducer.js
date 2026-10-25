import { A } from './actions.js';
import { datesBetween, todayISO, trackingStartOf } from '../utils/cycle.js';
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
  dataOwnerId: null,
  pendingOtpId: null,
  pendingEmail: null,
  otpPurpose: null,
  otpExpiresAt: null,
  resetEmail: null,
  userName: 'Friend',
  accountType: 'owner',
  partnerInviteIntent: false,
  partnerName: '',
  partnerState: null,
  tourPending: false,
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
  trackingStartDate: null,
  periodPromptDismissedOn: null,
  femPoints: 0,
  streak: 0,
  longestStreak: 0,
  lastLogDate: null,
  lastClaimedDate: null,
  logs: {},
  notifs: {
    period: true,
    ovulation: true,
    dailyLog: true,
    digest: false,
    partnerLove: true,
    morningTime: '06:00',
    eveningTime: '20:00',
    periodDaysBefore: [2, 1, 0],
    maxDaysBefore: 2,
  },
  inbox: { items: [], unreadCount: 0 },
  themePref: 'dark',
  isPremium: false,
  plan: null,
  renewsAt: null,
  autoRenew: false,
  history: [],
  badges: [],
  levels: [],
  content: [],
  challenges: [],
  shopProducts: [],
  screen: 'home',
  periodPickerOpen: false,
  periodPickerStart: null,
  toast: null,
  selDate: todayISO(),
  viewMonth: new Date().getMonth(),
  viewYear: new Date().getFullYear(),
  today: todayISO(),
  cycleStatus: null,
  calendarPhases: {},
  partnerLove: {},
  insights: { trends: null, digest: null, regularity: null },
};
const USER_DATA_KEYS = [
  'userName',
  'accountType',
  'partnerName',
  'partnerState',
  'tourPending',
  'goal',
  'dob',
  'cycleLength',
  'periodLength',
  'lastPeriodDate',
  'trackingStartDate',
  'periodPromptDismissedOn',
  'femPoints',
  'streak',
  'longestStreak',
  'lastLogDate',
  'lastClaimedDate',
  'logs',
  'notifs',
  'inbox',
  'isPremium',
  'plan',
  'renewsAt',
  'autoRenew',
  'history',
  'badges',
  'challenges',
  'shopProducts',
  'cycleStatus',
  'calendarPhases',
  'partnerLove',
  'insights',
];
function withoutUserData(state) {
  const cleared = { ...state, dataOwnerId: null };
  USER_DATA_KEYS.forEach(k => {
    cleared[k] = INIT[k];
  });
  return cleared;
}
function replaceLogRange(logs, from, to, fresh) {
  const kept = {};
  Object.keys(logs).forEach(d => {
    if (!from || !to || d < from || d > to) kept[d] = logs[d];
  });
  return { ...kept, ...fresh };
}
function selectionForMonth(year, month) {
  const today = todayISO();
  const first = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  return today.slice(0, 7) === first.slice(0, 7) ? today : null;
}
function withHistory(state, entry) {
  return { ...state, history: [entry, ...state.history].slice(0, MAX_HISTORY) };
}
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
function applyCleared(logs, clearedEntries) {
  (clearedEntries || []).forEach(e => {
    const isEmpty = !e.flow && !e.mood && (!e.symptoms || e.symptoms.length === 0) && !e.notes && !e.intimate;
    if (isEmpty) {
      delete logs[e.date];
    } else {
      logs[e.date] = { flow: e.flow, mood: e.mood, symptoms: e.symptoms, notes: e.notes, intimate: e.intimate };
    }
  });
  return logs;
}
function applySavedPeriod(
  state,
  { dates, flow, date, entry, lastPeriodDate, trackingStartDate, pointsAwarded, newBalance, streak, clearedEntries },
) {
  const today = todayISO();
  const logs = { ...state.logs };
  dates.forEach(d => {
    logs[d] = d === date ? entry : { ...(logs[d] || {}), flow };
  });
  applyCleared(logs, clearedEntries);
  let next = {
    ...state,
    logs,
    lastPeriodDate: lastPeriodDate ?? state.lastPeriodDate,
    trackingStartDate: trackingStartDate ?? state.trackingStartDate,
    cycleStatus: null,
    calendarPhases: {},
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
      const merged = { ...state, ...action.payload, notifs: { ...state.notifs, ...action.payload?.notifs } };
      if (action.payload?.dataOwnerId === undefined) merged.dataOwnerId = merged.userId ?? null;
      if (merged.authDone && !merged.accessToken) {
        return {
          ...withoutUserData(merged),
          authDone: false,
          authScreen: 'welcome',
          accessToken: null,
          refreshToken: null,
          userId: null,
        };
      }
      return merged;
    }
    case A.TODAY_CHANGED: {
      if (action.today === state.today) return state;
      return { ...state, today: action.today };
    }
    case A.GO:
      return { ...state, screen: action.screen };
    case A.OPEN_PERIOD_PICKER:
      return { ...state, periodPickerOpen: true, periodPickerStart: action.startDate ?? null };
    case A.CLOSE_PERIOD_PICKER:
      return { ...state, periodPickerOpen: false, periodPickerStart: null };
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
        tourPending: true,
        authDone: true,
        authScreen: null,
        userName: state.onboardDraft.name || 'Friend',
        goal: action.goal || state.onboardDraft.goal,
        dob: state.onboardDraft.dob,
        lastPeriodDate: state.onboardDraft.lastPeriod || null,
        trackingStartDate: trackingStartOf(null, state.onboardDraft.lastPeriod || null),
        calendarPhases: {},
        cycleLength: action.cycleLength ?? state.cycleLength,
        periodLength: action.periodLength ?? state.periodLength,
        onboardStep: 0,
        screen: 'home',
      };
    case A.SAVE_LOG:
      return applySavedLog(state, action);
    case A.SAVE_LOG_PERIOD:
      return applySavedPeriod(state, action);
    case A.PARTNER_LOVE_HYDRATED: {
      const partnerLove = { ...state.partnerLove };
      (action.from && action.to ? datesBetween(action.from, action.to) : []).forEach(d => delete partnerLove[d]);
      (action.items || []).forEach(item => {
        partnerLove[item.date] = { partnerName: item.partnerName, labels: item.labels || [], note: item.note || null };
      });
      return { ...state, partnerLove };
    }
    case A.PERIOD_REMOVED:
      return {
        ...state,
        logs: applyCleared({ ...state.logs }, action.clearedEntries),
        lastPeriodDate: action.lastPeriodDate ?? null,
        trackingStartDate: action.trackingStartDate ?? state.trackingStartDate,
        cycleStatus: null,
        calendarPhases: {},
        toast: { icon: '✓', text: 'Period removed' },
      };
    case A.DELETE_LOG: {
      const logs = { ...state.logs };
      delete logs[action.date];
      return { ...state, logs };
    }
    case A.LOGS_HYDRATED:
      return { ...state, logs: replaceLogRange(state.logs, action.from, action.to, action.logs) };
    case A.CYCLE_STATUS_HYDRATED:
      return { ...state, cycleStatus: action.status };
    case A.CALENDAR_PHASES_HYDRATED:
      return { ...state, calendarPhases: { ...state.calendarPhases, ...action.phases } };
    case A.INSIGHTS_HYDRATED:
      return { ...state, insights: { ...state.insights, ...action.insights } };
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
    case A.SET_NOTIF_PREFS:
      return { ...state, notifs: { ...state.notifs, ...action.prefs } };
    case A.NOTIFICATIONS_HYDRATED:
    case A.NOTIFICATIONS_UPDATED: {
      const { period, ovulation, dailyLog, digest, partnerLove, morningTime, eveningTime, periodDaysBefore, maxDaysBefore } = action;
      return {
        ...state,
        notifs: {
          period,
          ovulation,
          dailyLog,
          digest,
          partnerLove: partnerLove ?? state.notifs.partnerLove ?? true,
          morningTime: morningTime ?? state.notifs.morningTime,
          eveningTime: eveningTime ?? state.notifs.eveningTime,
          periodDaysBefore: periodDaysBefore ?? state.notifs.periodDaysBefore,
          maxDaysBefore: maxDaysBefore ?? state.notifs.maxDaysBefore,
        },
      };
    }
    case A.INBOX_HYDRATED:
      return { ...state, inbox: { items: action.items || [], unreadCount: action.unreadCount || 0 } };
    case A.INBOX_READ:
      return { ...state, inbox: { items: state.inbox.items.map(item => ({ ...item, read: true })), unreadCount: 0 } };
    case A.SET_THEME:
      return { ...state, themePref: action.pref };
    case A.SUBSCRIPTION_UPDATED: {
      const { isPremium, plan, renewsAt, autoRenew, toast } = action;
      return { ...state, isPremium, plan, renewsAt, autoRenew, toast: toast ?? state.toast };
    }
    case A.PROFILE_HYDRATED:
    case A.PROFILE_UPDATED: {
      const { firstName, lastName, goal, dob, cycleLength, periodLength, lastPeriodDate, trackingStartDate, themePref, isPremium } = action;
      const userName = [firstName, lastName].filter(Boolean).join(' ').trim();
      return {
        ...state,
        userName: userName || state.userName,
        goal,
        dob,
        cycleLength,
        periodLength,
        lastPeriodDate,
        trackingStartDate: trackingStartDate ?? trackingStartOf(null, lastPeriodDate),
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
    case A.CONTENT_HYDRATED:
      return { ...state, content: action.items };
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
      return { ...state, viewMonth: m, viewYear: y, selDate: selectionForMonth(y, m) };
    }
    case A.NEXT_MONTH: {
      let m = state.viewMonth + 1,
        y = state.viewYear;
      if (m > 11) {
        m = 0;
        y++;
      }
      return { ...state, viewMonth: m, viewYear: y, selDate: selectionForMonth(y, m) };
    }
    case A.UPDATE_SETTINGS:
      return { ...state, ...action.patch };
    case A.SET_AUTH_SCREEN:
      if (action.screen === null) return { ...state, authScreen: null, authDone: true };
      return { ...state, authScreen: action.screen };
    case A.AUTH_SUCCESS:
      return {
        ...(state.dataOwnerId === action.userId ? state : withoutUserData(state)),
        dataOwnerId: action.userId,
        accessToken: action.accessToken,
        refreshToken: action.refreshToken,
        userId: action.userId,
        onboarded: action.onboarded ?? state.onboarded,
        accountType: action.accountType || 'owner',
        partnerInviteIntent: false,
        authDone: true,
        authScreen: null,
        screen: 'home',
        pendingOtpId: null,
        pendingEmail: null,
        otpPurpose: null,
        otpExpiresAt: null,
      };
    case A.SET_PARTNER_INTENT:
      return { ...state, partnerInviteIntent: action.value };
    case A.PARTNER_JOINED:
      return {
        ...state,
        accessToken: action.accessToken,
        accountType: 'partner',
        onboarded: true,
        tourPending: true,
        partnerState: 'active',
        screen: 'home',
        logs: INIT.logs,
        cycleStatus: INIT.cycleStatus,
        calendarPhases: INIT.calendarPhases,
        insights: INIT.insights,
      };
    case A.PARTNER_OWNER_HYDRATED:
      return {
        ...state,
        partnerName: (action.nickname || action.firstName || '').trim(),
        cycleLength: action.cycleLength ?? state.cycleLength,
        periodLength: action.periodLength ?? state.periodLength,
        lastPeriodDate: action.lastPeriodDate ?? null,
        trackingStartDate: action.trackingStartDate ?? trackingStartOf(null, action.lastPeriodDate),
      };
    case A.PARTNER_SELF_HYDRATED: {
      const userName = [action.firstName, action.lastName].filter(Boolean).join(' ').trim();
      return {
        ...state,
        userName: userName || state.userName,
        themePref: action.themePref ?? state.themePref,
        isPremium: !!action.isPremium,
      };
    }
    case A.TOUR_DONE:
      return { ...state, tourPending: false };
    case A.PARTNER_STATE:
      return { ...state, partnerState: action.state };
    case A.TOKENS_REFRESHED:
      return { ...state, accessToken: action.accessToken };
    case A.LOGOUT:
      return {
        ...withoutUserData(state),
        authDone: false,
        authScreen: 'welcome',
        accessToken: null,
        refreshToken: null,
        userId: null,
        partnerInviteIntent: false,
        onboardStep: INIT.onboardStep,
        onboardDraft: { ...INIT.onboardDraft },
        inbox: INIT.inbox,
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
