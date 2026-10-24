import {
  ownerCard,
  expiryLabel,
  normalizeInviteCode,
  signedInRoute,
  setupRoute,
  dayLogRows,
  supportLabels,
  homeInviteCopy,
  connectedLine,
  connectedTitle,
  inviteExpiryText,
  sharedSinceLabel,
  headsUpChip,
} from './partner.js';
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
describe('homeInviteCopy', () => {
  test('on her period it names the day', () => {
    const copy = homeInviteCopy({ firstName: 'Amaka', phaseKey: 'period', cycleDay: 2, daysToPeriod: 26 });
    expect(copy.title).toBe('Day 2. Let them show up.');
    expect(copy.body).toBe('Your partner sees where you are and what you need.');
  });
  test('a week or less before her period it counts down', () => {
    expect(homeInviteCopy({ firstName: 'Amaka', phaseKey: 'luteal', cycleDay: 23, daysToPeriod: 5 }).title).toBe('5 days to go, Amaka.');
    expect(homeInviteCopy({ firstName: 'Amaka', phaseKey: 'luteal', cycleDay: 27, daysToPeriod: 1 }).title).toBe('1 day to go, Amaka.');
  });
  test('in the fertile window it talks about planning together', () => {
    expect(homeInviteCopy({ firstName: 'Amaka', phaseKey: 'fertile', cycleDay: 11, daysToPeriod: 17 }).title).toBe(
      'Planning together, Amaka?',
    );
    expect(homeInviteCopy({ firstName: 'Amaka', phaseKey: 'ovulation', cycleDay: 14, daysToPeriod: 14 }).body).toBe(
      'Share your fertile window with your partner.',
    );
  });
  test('other days, or no name or prediction, say better together', () => {
    expect(homeInviteCopy({ firstName: 'Amaka', phaseKey: 'follicular', cycleDay: 8, daysToPeriod: 20 }).title).toBe(
      'Better together, Amaka.',
    );
    const plain = homeInviteCopy({ firstName: '', phaseKey: null, cycleDay: null, daysToPeriod: null });
    expect(plain.title).toBe('Better together.');
    expect(plain.body).toBe('Let your partner see your cycle and show up on purpose.');
    expect(homeInviteCopy({ firstName: '', phaseKey: 'period', cycleDay: null }).title).toBe('Let them show up.');
  });
});
describe('connected card', () => {
  test('is short and names him', () => {
    expect(connectedTitle('Tunde')).toBe('You and Tunde, in sync');
    expect(connectedTitle('')).toBe('You and your partner, in sync');
    expect(connectedLine({ partnerName: 'Tunde' })).toBe('Tunde sees your cycle, read-only.');
    expect(connectedLine({ partnerName: null })).toBe('Your partner sees your cycle, read-only.');
  });
});
describe('inviteExpiryText', () => {
  const now = new Date('2026-10-24T09:00:00Z');
  test('counts down the days left', () => {
    expect(inviteExpiryText('2026-10-26T10:00:00Z', now)).toBe('code expires in 2 days');
    expect(inviteExpiryText('2026-10-25T10:00:00Z', now)).toBe('code expires tomorrow');
    expect(inviteExpiryText('2026-10-24T20:00:00Z', now)).toBe('code expires today');
    expect(inviteExpiryText('2026-10-24T08:00:00Z', now)).toBe('code expired');
  });
});
describe('sharedSinceLabel', () => {
  test('shows the day sharing started', () => {
    expect(sharedSinceLabel('2026-10-23T12:00:00Z')).toBe('Sharing since 23 October');
    expect(sharedSinceLabel(null)).toBeNull();
  });
});
describe('headsUpChip', () => {
  test('counts down to his reminder, then to her period', () => {
    expect(headsUpChip(15)).toBe('Heads-up in 10 days');
    expect(headsUpChip(6)).toBe('Heads-up tomorrow');
    expect(headsUpChip(5)).toBe('Heads-up today');
    expect(headsUpChip(3)).toBe('Period in 3 days');
    expect(headsUpChip(1)).toBe('Period tomorrow');
    expect(headsUpChip(null)).toBeNull();
    expect(headsUpChip(0)).toBeNull();
  });
});
