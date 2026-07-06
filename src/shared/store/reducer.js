import { A } from './actions.js';
import { toISO, todayISO } from '../utils/cycle.js';
import { DEFAULT_CYCLE_LENGTH, DEFAULT_PERIOD_LENGTH, DEFAULT_LAST_PERIOD } from '../constants/cycle.js';

export const INIT = {
  onboarded: false,
  authDone: false,
  authScreen: 'splash',
  resetEmail: null,
  userName: 'Gbemisola',
  goal: 'track',
  dob: '',
  onboardStep: 0,
  onboardDraft: { name: '', dob: '', lastPeriod: '', goal: 'track' },
  cycleLength: DEFAULT_CYCLE_LENGTH,
  periodLength: DEFAULT_PERIOD_LENGTH,
  lastPeriodDate: DEFAULT_LAST_PERIOD,
  femPoints: 1840,
  streak: 6,
  longestStreak: 12,
  lastLogDate: null,
  lastClaimedDate: null,
  logs: {},
  notifications: true,
  // session
  screen: 'home',
  logOpen: false,
  logEditDate: null,
  toast: null,
  selDate: todayISO(),
  viewMonth: new Date().getMonth(),
  viewYear: new Date().getFullYear(),
  draftLog: { flow: null, mood: null, symptoms: [], notes: '', intimate: false },
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

function saveLog(state) {
  const date = state.logEditDate || todayISO();
  const today = todayISO();
  const isNew = !state.logs[date];
  let { streak, longestStreak } = state;
  if (date === today && isNew) {
    const yest = new Date(); yest.setDate(yest.getDate() - 1);
    streak = (state.lastLogDate === toISO(yest) || state.lastLogDate === today)
      ? state.streak + 1 : 1;
    longestStreak = Math.max(streak, state.longestStreak);
  }
  const femPoints = isNew && date === today ? state.femPoints + 80 : state.femPoints;
  const toast = isNew && date === today
    ? { icon: '🔥', text: `Logged! +80 FP · ${streak}-day streak` }
    : { icon: '✓', text: 'Entry updated' };
  return {
    ...state,
    logOpen: false,
    logs: { ...state.logs, [date]: { ...state.draftLog } },
    lastLogDate: date === today ? today : state.lastLogDate,
    femPoints, streak, longestStreak, toast,
  };
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
      return { ...state, logOpen: false, logEditDate: null };
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
        goal: state.onboardDraft.goal,
        dob: state.onboardDraft.dob,
        lastPeriodDate: state.onboardDraft.lastPeriod || DEFAULT_LAST_PERIOD,
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
      return saveLog(state);
    case A.DELETE_LOG: {
      const logs = { ...state.logs }; delete logs[action.date];
      return { ...state, logs };
    }
    case A.CLAIM_DAILY: {
      const today = todayISO();
      if (state.lastClaimedDate === today) return state;
      return { ...state, lastClaimedDate: today, femPoints: state.femPoints + 50, toast: { icon: '🎁', text: 'Daily reward claimed · +50 FP' } };
    }
    case A.WATCH_AD:
      return { ...state, femPoints: state.femPoints + 100, toast: { icon: '🎬', text: '+100 SpotPoints earned' } };
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
    case A.LOGOUT:
      return { ...state, authDone: false, authScreen: 'welcome' };
    case A.RESET_DATA:
      return { ...INIT, onboarded: false, authDone: false, authScreen: 'welcome', femPoints: 0, streak: 0, longestStreak: 0, logs: {}, screen: 'home' };
    default:
      return state;
  }
}
