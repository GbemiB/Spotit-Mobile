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
        { id: 'read_3', title: 'Read 3 articles', reward: 120, done: 3, total: 3, completed: true, claimed: false },
      ],
    };
    const next = reducer(state, { type: A.CHALLENGE_CLAIM_RESULT, challengeId: 'log_week', pointsAwarded: 150, newBalance: 250 });
    expect(next.femPoints).toBe(250);
    expect(next.challenges.find(c => c.id === 'log_week').claimed).toBe(true);
    expect(next.challenges.find(c => c.id === 'read_3').claimed).toBe(false);
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
  test('NOTIFICATIONS_HYDRATED replaces the notification prefs wholesale', () => {
    const next = reducer(INIT, { type: A.NOTIFICATIONS_HYDRATED, period: false, ovulation: true, dailyLog: false, digest: true });
    expect(next.notifs).toEqual({ period: false, ovulation: true, dailyLog: false, digest: true });
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
