import { ownerCard, expiryLabel, normalizeInviteCode, signedInRoute, setupRoute, dayLogRows, supportLabels } from './partner.js';
describe('ownerCard', () => {
  test('nothing shows until the status has loaded', () => {
    expect(ownerCard(null)).toBe('loading');
  });
  test('a partner account never sees the owner section', () => {
    expect(ownerCard({ role: 'partner', state: 'active' })).toBe('hidden');
  });
  test('each owner state picks its card', () => {
    expect(ownerCard({ role: 'owner', state: 'none' })).toBe('none');
    expect(ownerCard({ role: 'owner', state: 'pending' })).toBe('pending');
    expect(ownerCard({ role: 'owner', state: 'expired' })).toBe('expired');
    expect(ownerCard({ role: 'owner', state: 'active' })).toBe('active');
  });
  test('an unexpected state falls back to the invite card', () => {
    expect(ownerCard({ role: 'owner', state: 'invited' })).toBe('none');
  });
});
describe('expiryLabel', () => {
  test('shows the day, date and 12-hour time', () => {
    expect(expiryLabel(new Date(2026, 9, 24, 9, 0).toISOString())).toBe('Sat 24 Oct, 9:00 AM');
    expect(expiryLabel(new Date(2026, 9, 25, 21, 5).toISOString())).toBe('Sun 25 Oct, 9:05 PM');
    expect(expiryLabel(new Date(2026, 9, 26, 0, 30).toISOString())).toBe('Mon 26 Oct, 12:30 AM');
  });
  test('a missing date gives an empty label', () => {
    expect(expiryLabel(undefined)).toBe('');
  });
});
describe('normalizeInviteCode', () => {
  test('removes spaces and dashes and uses capitals, like the server', () => {
    expect(normalizeInviteCode(' k7p-2qx ')).toBe('K7P2QX');
    expect(normalizeInviteCode('K7P 2QX')).toBe('K7P2QX');
    expect(normalizeInviteCode(undefined)).toBe('');
  });
});
describe('signedInRoute', () => {
  test('a partner account always goes to the partner home', () => {
    expect(signedInRoute({ onboarded: true, accountType: 'partner' })).toBe('partner-home');
  });
  test('an owner goes to set-up until onboarded, then to the tabs', () => {
    expect(signedInRoute({ onboarded: false, accountType: 'owner' })).toBe('setup');
    expect(signedInRoute({ onboarded: true, accountType: 'owner' })).toBe('tabs');
  });
});
describe('setupRoute', () => {
  test('waits for the invite check', () => {
    expect(setupRoute(undefined, false)).toBe('checking');
  });
  test('an invited account sees the join screen unless it chose its own cycle', () => {
    expect(setupRoute({ role: 'owner', state: 'invited', ownerFirstName: 'Amaka' }, false)).toBe('join');
    expect(setupRoute({ role: 'owner', state: 'invited', ownerFirstName: 'Amaka' }, true)).toBe('onboarding');
  });
  test('no invite, or a failed check, goes to the normal cycle questions', () => {
    expect(setupRoute({ role: 'owner', state: 'none' }, false)).toBe('onboarding');
    expect(setupRoute(null, false)).toBe('onboarding');
  });
});
describe('dayLogRows', () => {
  test('shows everything she logged with readable labels', () => {
    expect(dayLogRows({ flow: 'medium', mood: 'irritable', symptoms: ['cramps', 'tender'], intimate: true, notes: ' tired ' })).toEqual({
      flow: 'Medium',
      mood: '😤 Irritable',
      symptoms: ['Cramps', 'Tender breasts'],
      intimate: true,
      notes: 'tired',
    });
  });
  test('an empty or missing day shows nothing', () => {
    expect(dayLogRows(undefined)).toBeNull();
    expect(dayLogRows({ flow: null, mood: null, symptoms: [], intimate: false, notes: '  ' })).toBeNull();
  });
});
test('support labels come from the server options', () => {
  const options = [{ id: 'snacks', label: 'Brought her snacks' }];
  expect(supportLabels(options, ['snacks', 'unknown'])).toEqual(['Brought her snacks', 'unknown']);
});
