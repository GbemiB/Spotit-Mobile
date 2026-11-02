import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  daysSince,
  shouldInvite,
  mightInvite,
  afterShown,
  afterLater,
  afterVisit,
  readInvite,
  updateInvite,
  wasGuideSeen,
  markGuideSeen,
} from './inviteLogic.js';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const ON = { enabled: true, everyDays: 3, maxDismissals: 3 };

beforeEach(() => AsyncStorage.clear());

describe('daysSince', () => {
  it('counts calendar days across months', () => {
    expect(daysSince('2026-10-30', '2026-11-02')).toBe(3);
  });
  it('is infinite with no start date', () => {
    expect(daysSince(null, '2026-11-02')).toBe(Infinity);
  });
});

describe('shouldInvite', () => {
  it('invites a user who has never seen it or visited', () => {
    expect(shouldInvite({}, ON, '2026-11-02')).toBe(true);
  });
  it('never invites when the admin turned it off', () => {
    expect(shouldInvite({}, { ...ON, enabled: false }, '2026-11-02')).toBe(false);
  });
  it('never invites without settings from the server', () => {
    expect(shouldInvite({}, null, '2026-11-02')).toBe(false);
  });
  it('waits the set number of days after the last invite', () => {
    expect(shouldInvite({ lastShownOn: '2026-11-01' }, ON, '2026-11-03')).toBe(false);
    expect(shouldInvite({ lastShownOn: '2026-11-01' }, ON, '2026-11-04')).toBe(true);
  });
  it('waits the set number of days after the last Spotlight visit', () => {
    expect(shouldInvite({ lastShownOn: '2026-10-01', lastVisitOn: '2026-11-01' }, ON, '2026-11-02')).toBe(false);
    expect(shouldInvite({ lastVisitOn: '2026-11-01' }, ON, '2026-11-04')).toBe(true);
  });
  it('stops after too many Maybe later taps in a row', () => {
    expect(shouldInvite({ lastShownOn: '2026-10-01', dismissals: 3 }, ON, '2026-11-02')).toBe(false);
    expect(shouldInvite({ lastShownOn: '2026-10-01', dismissals: 2 }, ON, '2026-11-02')).toBe(true);
  });
  it('falls back to safe defaults for zero settings', () => {
    expect(shouldInvite({ lastShownOn: '2026-11-01' }, { enabled: true, everyDays: 0, maxDismissals: 0 }, '2026-11-03')).toBe(false);
  });
});

describe('mightInvite', () => {
  it('skips the server call when it was shown or visited today', () => {
    expect(mightInvite({ lastShownOn: '2026-11-02' }, '2026-11-02')).toBe(false);
    expect(mightInvite({ lastVisitOn: '2026-11-02' }, '2026-11-02')).toBe(false);
    expect(mightInvite({ lastShownOn: '2026-11-01' }, '2026-11-02')).toBe(true);
  });
});

describe('record changes', () => {
  it('notes when it was shown', () => {
    expect(afterShown({ dismissals: 1 }, '2026-11-02')).toEqual({ lastShownOn: '2026-11-02', lastVisitOn: null, dismissals: 1 });
  });
  it('counts Maybe later taps', () => {
    expect(afterLater({ dismissals: 1 }).dismissals).toBe(2);
  });
  it('a visit resets the Maybe later count', () => {
    expect(afterVisit({ dismissals: 2 }, '2026-11-02')).toEqual({ lastShownOn: null, lastVisitOn: '2026-11-02', dismissals: 0 });
  });
});

describe('storage', () => {
  it('keeps each user separate', async () => {
    await updateInvite('u1', r => afterShown(r, '2026-11-02'));
    expect((await readInvite('u1')).lastShownOn).toBe('2026-11-02');
    expect((await readInvite('u2')).lastShownOn).toBeNull();
  });
  it('reads an empty record without a user', async () => {
    expect(await readInvite(null)).toEqual({ lastShownOn: null, lastVisitOn: null, dismissals: 0 });
  });
  it('remembers the guide per user', async () => {
    expect(await wasGuideSeen('u1')).toBe(false);
    await markGuideSeen('u1');
    expect(await wasGuideSeen('u1')).toBe(true);
    expect(await wasGuideSeen('u2')).toBe(false);
  });
});
