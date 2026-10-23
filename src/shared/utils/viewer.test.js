import { viewerOf, heroParts, lateParts, milestoneLead, ovulationInsight, noPeriodCopy, calendarNote, regularityTitle } from './viewer.js';
const owner = viewerOf({ accountType: 'owner', partnerName: '' });
const partner = viewerOf({ accountType: 'partner', partnerName: 'Amaka' });
const text = parts => parts.map(p => p.text).join(' ');
test('the viewer knows whose data is on screen', () => {
  expect(owner).toEqual({ isPartner: false, name: null });
  expect(partner).toEqual({ isPartner: true, name: 'Amaka' });
  expect(viewerOf({ accountType: 'partner', partnerName: '' }).name).toBe('Your partner');
});
test('her own wording is unchanged', () => {
  expect(text(heroParts('period', 3, owner))).toBe('You’re on day 3 of your period');
  expect(text(heroParts('fertile', 12, owner))).toBe('You’re in your fertile window');
  expect(text(heroParts('ovulation', 14, owner))).toBe('Today is your predicted ovulation day');
  expect(heroParts('luteal', 20, owner)).toBeNull();
  expect(text(lateParts({ state: 'due' }, owner))).toBe('Your period is due today');
  expect(text(lateParts({ state: 'late', daysLate: 2 }, owner))).toBe('Your period is predicted to be 2 days late');
  expect(milestoneLead('period', owner)).toBe('Your period starts in');
  expect(milestoneLead('fertile', owner)).toBe('Your fertile window starts in');
  expect(ovulationInsight('luteal', 28, owner)).toEqual({
    title: 'Track your ovulation',
    body: 'Ovulation is predicted around day 14 of your cycle.',
  });
  expect(noPeriodCopy(owner).headline).toBe('Log a period to see your predictions');
  expect(calendarNote('no-period', owner)).toBe('Log your last period to see cycle phases here.');
  expect(regularityTitle('regular', owner)).toBe('Your cycles look regular');
});
test('his wording talks about her', () => {
  expect(text(heroParts('period', 3, partner))).toBe('Amaka is on day 3 of her period');
  expect(text(heroParts('fertile', 12, partner))).toBe('Amaka is in her fertile window');
  expect(text(lateParts({ state: 'late', daysLate: 1 }, partner))).toBe('Amaka’s period is predicted to be 1 day late');
  expect(milestoneLead('period', partner)).toBe('Amaka’s period starts in');
  expect(milestoneLead('ovulation', partner)).toBe('Ovulation in');
  expect(ovulationInsight('fertile', 28, partner).title).toBe('Amaka’s fertile window is open');
  expect(noPeriodCopy(partner).headline).toBe('Amaka hasn’t logged a period yet');
  expect(calendarNote('before-tracking', partner)).toBe('Amaka’s calendar starts in the month of her first period with Spot it.');
  expect(regularityTitle('irregular_cycle_length', partner)).toBe('Amaka’s cycle length has varied');
  expect(regularityTitle('unusual_period_length', partner)).toBe('Unusual period length detected');
});
