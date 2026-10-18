import { reducer, INIT } from './reducer.js';
import { A } from './actions.js';
import { todayISO } from '../utils/cycle.js';
describe('HYDRATE', () => {
  test('merges the persisted payload into state', () => {
    const next = reducer(INIT, { type: A.HYDRATE, payload: { userName: 'Ada', femPoints: 42 } });
    expect(next.userName).toBe('Ada');
    expect(next.femPoints).toBe(42);
  });
  test('forces a logout when authDone is true but there is no access token', () => {
    const corrupted = { onboarded: true, authDone: true, accessToken: null, refreshToken: null, userId: null };
    const next = reducer(INIT, { type: A.HYDRATE, payload: corrupted });
    expect(next.authDone).toBe(false);
    expect(next.authScreen).toBe('welcome');
    expect(next.accessToken).toBeNull();
    expect(next.refreshToken).toBeNull();
  });
  test('does not force a logout when a real access token is present', () => {
    const healthy = { onboarded: true, authDone: true, accessToken: 'a.jwt.token', refreshToken: 'a.refresh.token' };
    const next = reducer(INIT, { type: A.HYDRATE, payload: healthy });
    expect(next.authDone).toBe(true);
    expect(next.accessToken).toBe('a.jwt.token');
  });
});
describe('SAVE_LOG', () => {
  const baseState = { ...INIT, femPoints: 100, streak: 2, longestStreak: 5, logs: {} };
  test('a newly-earned entry updates balance, streak, and history', () => {
    const next = reducer(baseState, {
      type: A.SAVE_LOG,
      date: '2026-07-28',
      entry: { flow: 'medium', mood: 'happy', symptoms: [], notes: '', intimate: false },
      pointsAwarded: 10,
      newBalance: 110,
      streak: 3,
      isNewEntry: true,
    });
    expect(next.femPoints).toBe(110);
    expect(next.streak).toBe(3);
    expect(next.longestStreak).toBe(5);
    expect(next.logs['2026-07-28']).toEqual({ flow: 'medium', mood: 'happy', symptoms: [], notes: '', intimate: false });
    expect(next.history[0]).toMatchObject({ delta: 10, label: 'Logged flow, mood & symptoms' });
    expect(next.toast.text).toContain('+10 SP');
  });
  test('editing an entry that earns no points does not touch history or the streak', () => {
    const next = reducer(baseState, {
      type: A.SAVE_LOG,
      date: '2026-07-28',
      entry: { flow: 'light', mood: null, symptoms: [], notes: '', intimate: false },
      pointsAwarded: 0,
      newBalance: 100,
      streak: 2,
      isNewEntry: false,
    });
    expect(next.femPoints).toBe(100);
    expect(next.history).toHaveLength(0);
    expect(next.toast.text).toBe('Entry updated');
  });
  test('a new longest streak replaces the old record', () => {
    const next = reducer(baseState, {
      type: A.SAVE_LOG,
      date: '2026-07-28',
      entry: {},
      pointsAwarded: 10,
      newBalance: 110,
      streak: 9,
      isNewEntry: true,
    });
    expect(next.longestStreak).toBe(9);
  });
});
describe('SAVE_LOG_PERIOD', () => {
  const baseState = { ...INIT, femPoints: 100, streak: 2, longestStreak: 5, logs: {}, lastPeriodDate: null };
  test('sets flow across the whole range and the full entry on the start date', () => {
    const next = reducer(baseState, {
      type: A.SAVE_LOG_PERIOD,
      dates: ['2026-07-10', '2026-07-11', '2026-07-12'],
      date: '2026-07-10',
      flow: 'medium',
      entry: { flow: 'medium', mood: 'calm', symptoms: ['cramps'], notes: 'notes', intimate: true },
      lastPeriodDate: '2026-07-10',
      pointsAwarded: 80,
      newBalance: 180,
      streak: 3,
    });
    expect(next.logs['2026-07-10']).toEqual({ flow: 'medium', mood: 'calm', symptoms: ['cramps'], notes: 'notes', intimate: true });
    expect(next.logs['2026-07-11']).toEqual({ flow: 'medium' });
    expect(next.logs['2026-07-12']).toEqual({ flow: 'medium' });
    expect(next.lastPeriodDate).toBe('2026-07-10');
    expect(next.femPoints).toBe(180);
    expect(next.toast.text).toContain('+80 SP');
  });
  test('preserves existing per-day fields on continuation days instead of clobbering them', () => {
    const state = { ...baseState, logs: { '2026-07-11': { mood: 'sad', notes: 'rough day' } } };
    const next = reducer(state, {
      type: A.SAVE_LOG_PERIOD,
      dates: ['2026-07-10', '2026-07-11'],
      date: '2026-07-10',
      flow: 'heavy',
      entry: { flow: 'heavy', mood: null, symptoms: [], notes: '', intimate: false },
      lastPeriodDate: '2026-07-10',
      pointsAwarded: 0,
      newBalance: 100,
      streak: 2,
    });
    expect(next.logs['2026-07-11']).toEqual({ mood: 'sad', notes: 'rough day', flow: 'heavy' });
  });
  test('clearedEntries removes stale flow-only days and preserves days with other data', () => {
    const state = { ...baseState, logs: { '2026-08-01': { flow: 'medium' }, '2026-08-02': { flow: 'medium', notes: 'cramping' } } };
    const next = reducer(state, {
      type: A.SAVE_LOG_PERIOD,
      dates: ['2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07'],
      date: '2026-08-03',
      flow: 'medium',
      entry: { flow: 'medium', mood: null, symptoms: [], notes: '', intimate: false },
      lastPeriodDate: '2026-08-03',
      pointsAwarded: 10,
      newBalance: 110,
      streak: 1,
      clearedEntries: [
        { date: '2026-08-01', flow: null, mood: null, symptoms: [], notes: null, intimate: false },
        { date: '2026-08-02', flow: null, mood: null, symptoms: [], notes: 'cramping', intimate: false },
      ],
    });
    expect(next.logs['2026-08-01']).toBeUndefined();
    expect(next.logs['2026-08-02']).toEqual({ flow: null, mood: null, symptoms: [], notes: 'cramping', intimate: false });
    expect(next.logs['2026-08-03']).toEqual({ flow: 'medium', mood: null, symptoms: [], notes: '', intimate: false });
  });
  test('a null lastPeriodDate blocked by the backend guard falls back to existing state', () => {
    const state = { ...baseState, lastPeriodDate: '2026-07-05' };
    const next = reducer(state, {
      type: A.SAVE_LOG_PERIOD,
      dates: ['2026-04-01'],
      date: '2026-04-01',
      flow: 'light',
      entry: { flow: 'light', mood: null, symptoms: [], notes: '', intimate: false },
      lastPeriodDate: '2026-07-05',
      pointsAwarded: 0,
      newBalance: 100,
      streak: 2,
    });
    expect(next.lastPeriodDate).toBe('2026-07-05');
  });
});
describe('rewards/shop result actions', () => {
  test('DAILY_CLAIM_RESULT when already claimed leaves the balance untouched', () => {
    const state = { ...INIT, femPoints: 100, history: [] };
    const next = reducer(state, { type: A.DAILY_CLAIM_RESULT, pointsAwarded: 0, newBalance: 100, alreadyClaimedToday: true });
    expect(next.femPoints).toBe(100);
    expect(next.history).toHaveLength(0);
    expect(next.toast.text).toMatch(/already claimed/i);
  });
  test('DAILY_CLAIM_RESULT on a fresh claim awards points and logs history', () => {
    const state = { ...INIT, femPoints: 100, history: [] };
    const next = reducer(state, { type: A.DAILY_CLAIM_RESULT, pointsAwarded: 50, newBalance: 150, alreadyClaimedToday: false });
    expect(next.femPoints).toBe(150);
    expect(next.lastClaimedDate).toBe(todayISO());
    expect(next.history[0]).toMatchObject({ delta: 50, label: 'Daily check-in bonus' });
  });
  test('AD_WATCH_RESULT awards points and logs history', () => {
    const state = { ...INIT, femPoints: 100, history: [] };
    const next = reducer(state, { type: A.AD_WATCH_RESULT, pointsAwarded: 25, newBalance: 125 });
    expect(next.femPoints).toBe(125);
    expect(next.history[0]).toMatchObject({ delta: 25, label: 'Watched a rewarded ad' });
  });
  test('CHALLENGE_CLAIM_RESULT marks only the claimed challenge and awards points', () => {
    const state = {
      ...INIT,
      femPoints: 100,
      history: [],
      challenges: [
        { id: 'log_week', title: 'Log every day', reward: 150, done: 7, total: 7, completed: true, claimed: false },
        { id: 'log_streak', title: 'Keep a 5-day streak', reward: 120, done: 5, total: 5, completed: true, claimed: false },
      ],
    };
    const next = reducer(state, { type: A.CHALLENGE_CLAIM_RESULT, challengeId: 'log_week', pointsAwarded: 150, newBalance: 250 });
    expect(next.femPoints).toBe(250);
    expect(next.challenges.find(c => c.id === 'log_week').claimed).toBe(true);
    expect(next.challenges.find(c => c.id === 'log_streak').claimed).toBe(false);
  });
  test('REDEEM_RESULT locks the redeemed product and deducts points', () => {
    const state = {
      ...INIT,
      femPoints: 1000,
      history: [],
      shopProducts: [{ id: 'rosewater_mist', name: 'Rosewater Face Mist', cost: 800, locked: false, lockReason: null }],
    };
    const next = reducer(state, {
      type: A.REDEEM_RESULT,
      productId: 'rosewater_mist',
      productName: 'Rosewater Face Mist',
      pointsSpent: 800,
      newBalance: 200,
    });
    expect(next.femPoints).toBe(200);
    expect(next.shopProducts[0].locked).toBe(true);
    expect(next.history[0]).toMatchObject({ delta: -800, label: 'Redeemed Rosewater Face Mist' });
  });
});
describe('profile and notifications', () => {
  test('PROFILE_HYDRATED assigns fields as-is, including explicit nulls', () => {
    const state = { ...INIT, lastPeriodDate: '2026-06-01', dob: '1998-01-01' };
    const next = reducer(state, {
      type: A.PROFILE_HYDRATED,
      firstName: 'Ada',
      lastName: 'Lovelace',
      goal: 'track',
      dob: null,
      cycleLength: 30,
      periodLength: 6,
      lastPeriodDate: null,
      themePref: 'dark',
      isPremium: true,
    });
    expect(next.userName).toBe('Ada Lovelace');
    expect(next.dob).toBeNull();
    expect(next.lastPeriodDate).toBeNull();
    expect(next.cycleLength).toBe(30);
    expect(next.themePref).toBe('dark');
    expect(next.isPremium).toBe(true);
    expect(next.trackingStartDate).toBeNull();
  });
  test('PROFILE_HYDRATED takes the tracking start, or falls back to the month of the last period', () => {
    const profile = { type: A.PROFILE_HYDRATED, firstName: 'Ada', lastName: 'L', cycleLength: 28, periodLength: 5, themePref: 'system' };
    expect(reducer(INIT, { ...profile, lastPeriodDate: '2026-09-28', trackingStartDate: '2026-07-01' }).trackingStartDate).toBe(
      '2026-07-01',
    );
    expect(reducer(INIT, { ...profile, lastPeriodDate: '2026-09-28' }).trackingStartDate).toBe('2026-09-01');
  });
  test('PROFILE_HYDRATED keeps the existing name when first/last are both blank', () => {
    const state = { ...INIT, userName: 'Existing Name' };
    const next = reducer(state, {
      type: A.PROFILE_HYDRATED,
      firstName: '',
      lastName: '',
      goal: 'track',
      dob: null,
      cycleLength: 28,
      periodLength: 5,
      lastPeriodDate: null,
      themePref: 'system',
      isPremium: false,
    });
    expect(next.userName).toBe('Existing Name');
  });
  test('NOTIFICATIONS_HYDRATED takes the switches, times and countdown days from the server', () => {
    const next = reducer(INIT, {
      type: A.NOTIFICATIONS_HYDRATED,
      period: false,
      ovulation: true,
      dailyLog: false,
      digest: true,
      morningTime: '07:30',
      eveningTime: '21:00',
      periodDaysBefore: [1, 0],
      ovulationDaysBefore: [0],
      maxDaysBefore: 3,
    });
    expect(next.notifs).toEqual({
      period: false,
      ovulation: true,
      dailyLog: false,
      digest: true,
      morningTime: '07:30',
      eveningTime: '21:00',
      periodDaysBefore: [1, 0],
      maxDaysBefore: 3,
    });
  });
  test('NOTIFICATIONS_HYDRATED from a server that only knows the four switches keeps the other settings', () => {
    const next = reducer(INIT, { type: A.NOTIFICATIONS_HYDRATED, period: false, ovulation: true, dailyLog: false, digest: true });
    expect(next.notifs).toEqual({ ...INIT.notifs, period: false, ovulation: true, dailyLog: false, digest: true });
  });
  test('SET_NOTIF_PREFS changes only the given settings', () => {
    const next = reducer(INIT, { type: A.SET_NOTIF_PREFS, prefs: { ovulation: false, periodDaysBefore: [2, 0] } });
    expect(next.notifs).toEqual({ ...INIT.notifs, ovulation: false, periodDaysBefore: [2, 0] });
  });
  test('HYDRATE fills in reminder settings missing from a state saved by 1.0', () => {
    const saved = { notifs: { period: false, ovulation: true, dailyLog: true, digest: false } };
    const next = reducer(INIT, { type: A.HYDRATE, payload: saved });
    expect(next.notifs.period).toBe(false);
    expect(next.notifs.periodDaysBefore).toEqual([2, 1, 0]);
    expect(next.notifs.morningTime).toBe('06:00');
  });
  test('INBOX_HYDRATED stores the inbox and INBOX_READ clears the unread marks', () => {
    const items = [{ id: 'a', title: 'Period reminder', body: 'In 3 days.', read: false }];
    const hydrated = reducer(INIT, { type: A.INBOX_HYDRATED, items, unreadCount: 1 });
    expect(hydrated.inbox).toEqual({ items, unreadCount: 1 });
    const read = reducer(hydrated, { type: A.INBOX_READ });
    expect(read.inbox.unreadCount).toBe(0);
    expect(read.inbox.items[0].read).toBe(true);
  });
  test('LOGOUT empties the inbox', () => {
    const state = { ...INIT, inbox: { items: [{ id: 'a' }], unreadCount: 1 } };
    expect(reducer(state, { type: A.LOGOUT }).inbox).toEqual(INIT.inbox);
  });
  test('TOGGLE_NOTIF flips a single key without touching the others', () => {
    const next = reducer(INIT, { type: A.TOGGLE_NOTIF, key: 'digest' });
    expect(next.notifs.digest).toBe(!INIT.notifs.digest);
    expect(next.notifs.period).toBe(INIT.notifs.period);
  });
});
describe('REWARDS_HYDRATED', () => {
  test('sets balance and streak, and never lowers the longest streak on record', () => {
    const state = { ...INIT, longestStreak: 20 };
    const next = reducer(state, { type: A.REWARDS_HYDRATED, points: 500, streak: 4, longestStreak: 4 });
    expect(next.femPoints).toBe(500);
    expect(next.streak).toBe(4);
    expect(next.longestStreak).toBe(20);
  });
  test('a higher server-reported longest streak wins', () => {
    const state = { ...INIT, longestStreak: 3 };
    const next = reducer(state, { type: A.REWARDS_HYDRATED, points: 500, streak: 10, longestStreak: 10 });
    expect(next.longestStreak).toBe(10);
  });
});
describe('simple hydration assignments', () => {
  test('BADGES_HYDRATED / CHALLENGES_HYDRATED / SHOP_PRODUCTS_HYDRATED / HISTORY_HYDRATED', () => {
    const badges = [{ id: 'first_flow', name: 'First Flow', earned: true }];
    const challenges = [{ id: 'log_week', title: 'Log every day' }];
    const products = [{ id: 'rosewater_mist', name: 'Rosewater Face Mist' }];
    const entries = [{ icon: '🎁', label: 'Daily check-in bonus', delta: 50, date: '2026-07-28' }];
    expect(reducer(INIT, { type: A.BADGES_HYDRATED, badges }).badges).toBe(badges);
    expect(reducer(INIT, { type: A.CHALLENGES_HYDRATED, challenges }).challenges).toBe(challenges);
    expect(reducer(INIT, { type: A.SHOP_PRODUCTS_HYDRATED, products }).shopProducts).toBe(products);
    expect(reducer(INIT, { type: A.HISTORY_HYDRATED, entries }).history).toBe(entries);
  });
});
describe('toasts', () => {
  test('SHOW_TOAST sets the toast and CLEAR_TOAST removes it', () => {
    const shown = reducer(INIT, { type: A.SHOW_TOAST, icon: '🌸', text: 'Something happened' });
    expect(shown.toast).toEqual({ icon: '🌸', text: 'Something happened' });
    const cleared = reducer(shown, { type: A.CLEAR_TOAST });
    expect(cleared.toast).toBeNull();
  });
});
describe('LOGOUT and RESET_DATA', () => {
  test('LOGOUT clears auth state and the in-progress onboarding draft', () => {
    const state = {
      ...INIT,
      authDone: true,
      accessToken: 'token',
      refreshToken: 'refresh',
      userId: 'user-1',
      onboardStep: 2,
      onboardDraft: { ...INIT.onboardDraft, name: 'Ada' },
    };
    const next = reducer(state, { type: A.LOGOUT });
    expect(next.authDone).toBe(false);
    expect(next.authScreen).toBe('welcome');
    expect(next.accessToken).toBeNull();
    expect(next.onboardStep).toBe(0);
    expect(next.onboardDraft.name).toBe('');
  });
  test("LOGOUT removes the account's data from the phone but keeps the theme", () => {
    const state = {
      ...INIT,
      authDone: true,
      accessToken: 'token',
      userId: 'user-1',
      dataOwnerId: 'user-1',
      themePref: 'light',
      lastPeriodDate: '2026-10-05',
      femPoints: 300,
      logs: { '2026-10-14': { mood: 'happy' } },
      history: [{ label: 'Logged', delta: 10 }],
      calendarPhases: { '2026-10-05': { phase: 'period', predicted: false, marker: null } },
    };
    const next = reducer(state, { type: A.LOGOUT });
    expect(next.logs).toEqual({});
    expect(next.lastPeriodDate).toBeNull();
    expect(next.femPoints).toBe(0);
    expect(next.history).toEqual([]);
    expect(next.calendarPhases).toEqual({});
    expect(next.dataOwnerId).toBeNull();
    expect(next.themePref).toBe('light');
  });
  test('RESET_DATA wipes points, streaks, and logs back to zero', () => {
    const state = { ...INIT, femPoints: 5000, streak: 10, longestStreak: 20, logs: { '2026-07-28': {} } };
    const next = reducer(state, { type: A.RESET_DATA });
    expect(next.femPoints).toBe(0);
    expect(next.streak).toBe(0);
    expect(next.longestStreak).toBe(0);
    expect(next.logs).toEqual({});
    expect(next.onboarded).toBe(false);
  });
});
describe('COMPLETE_ONBOARD', () => {
  test('marks onboarding done and adopts the draft values', () => {
    const state = {
      ...INIT,
      onboardDraft: { name: 'Ada Lovelace', dob: '1998-01-01', lastPeriod: '2026-06-01', goal: 'track', cycleLength: 30, periodLength: 6 },
    };
    const next = reducer(state, { type: A.COMPLETE_ONBOARD, goal: 'track', cycleLength: 30, periodLength: 6 });
    expect(next.onboarded).toBe(true);
    expect(next.authDone).toBe(true);
    expect(next.userName).toBe('Ada Lovelace');
    expect(next.lastPeriodDate).toBe('2026-06-01');
    expect(next.screen).toBe('home');
  });
});
describe('switching accounts', () => {
  const signIn = userId => ({ type: A.AUTH_SUCCESS, accessToken: 't', refreshToken: 'r', userId, onboarded: true });
  test('signing in as a different account starts with no data from the previous one', () => {
    const state = {
      ...INIT,
      dataOwnerId: 'user-1',
      logs: { '2026-10-14': { mood: 'happy' } },
      femPoints: 300,
      lastPeriodDate: '2026-09-01',
    };
    const next = reducer(state, signIn('user-2'));
    expect(next.logs).toEqual({});
    expect(next.femPoints).toBe(0);
    expect(next.lastPeriodDate).toBeNull();
    expect(next.dataOwnerId).toBe('user-2');
  });
  test('signing in again as the same account keeps its data', () => {
    const state = { ...INIT, dataOwnerId: 'user-1', logs: { '2026-10-14': { mood: 'happy' } } };
    expect(reducer(state, signIn('user-1')).logs).toEqual({ '2026-10-14': { mood: 'happy' } });
  });
  test('data stored without a known owner is cleared on sign-in', () => {
    const state = { ...INIT, dataOwnerId: null, logs: { '2026-10-14': { mood: 'happy' } } };
    expect(reducer(state, signIn('user-1')).logs).toEqual({});
  });
  test('data saved before this version is owned by the signed-in account', () => {
    const next = reducer(INIT, { type: A.HYDRATE, payload: { userId: 'user-1', authDone: true, accessToken: 't' } });
    expect(next.dataOwnerId).toBe('user-1');
  });
});
describe('LOGS_HYDRATED', () => {
  test('replaces the fetched range with what the server returned', () => {
    const state = {
      ...INIT,
      logs: { '2026-09-30': { mood: 'calm' }, '2026-10-14': { mood: 'happy' }, '2026-10-19': { mood: 'sad' } },
    };
    const next = reducer(state, {
      type: A.LOGS_HYDRATED,
      from: '2026-10-01',
      to: '2026-10-31',
      logs: { '2026-10-05': { flow: 'medium' } },
    });
    expect(next.logs).toEqual({ '2026-09-30': { mood: 'calm' }, '2026-10-05': { flow: 'medium' } });
  });
  test('merges when no range is given', () => {
    const state = { ...INIT, logs: { '2026-10-14': { mood: 'happy' } } };
    const next = reducer(state, { type: A.LOGS_HYDRATED, logs: { '2026-10-15': { mood: 'calm' } } });
    expect(Object.keys(next.logs)).toEqual(['2026-10-14', '2026-10-15']);
  });
});
describe('changing month', () => {
  test('no day is selected after moving to another month', () => {
    const next = reducer({ ...INIT, viewYear: 2030, viewMonth: 0, selDate: '2030-01-15' }, { type: A.NEXT_MONTH });
    expect(next.viewMonth).toBe(1);
    expect(next.selDate).toBeNull();
  });
  test('the selected day moves to today when returning to the current month', () => {
    const now = new Date();
    const previous = { ...INIT, viewYear: now.getFullYear(), viewMonth: now.getMonth() + 1, selDate: '2000-01-01' };
    const next = reducer(previous.viewMonth > 11 ? { ...previous, viewYear: now.getFullYear() + 1, viewMonth: 0 } : previous, {
      type: A.PREV_MONTH,
    });
    expect(next.selDate).toBe(todayISO());
  });
});
describe('period sheet', () => {
  test('opens with the chosen start day and forgets it when closed', () => {
    const open = reducer(INIT, { type: A.OPEN_PERIOD_PICKER, startDate: '2026-10-05' });
    expect(open.periodPickerOpen).toBe(true);
    expect(open.periodPickerStart).toBe('2026-10-05');
    const closed = reducer(open, { type: A.CLOSE_PERIOD_PICKER });
    expect(closed.periodPickerOpen).toBe(false);
    expect(closed.periodPickerStart).toBeNull();
  });
  test('opens without a start day from Home', () => {
    expect(reducer(INIT, { type: A.OPEN_PERIOD_PICKER }).periodPickerStart).toBeNull();
  });
});
