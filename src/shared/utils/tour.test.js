import AsyncStorage from '@react-native-async-storage/async-storage';
import { tourCards, firstNameOf, wasTourSeen, markTourSeen } from './tour.js';
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
beforeEach(() => AsyncStorage.clear());
describe('firstNameOf', () => {
  test('takes the first word', () => expect(firstNameOf(' Amaka  Obi ')).toBe('Amaka'));
  test('ignores the placeholder name', () => expect(firstNameOf('Friend')).toBe(''));
  test('handles a missing name', () => expect(firstNameOf(undefined)).toBe(''));
});
describe('tourCards for her', () => {
  const cards = tourCards({ accountType: 'owner', userName: 'Amaka Obi' });
  test('has the five agreed cards in order', () => {
    expect(cards.map(c => c.key)).toEqual(['welcome', 'calendar', 'log', 'points', 'control']);
  });
  test('greets her by first name', () => expect(cards[0].title).toBe('Hi, Amaka'));
  test('keeps every line short', () => {
    cards.forEach(c => expect(c.body.split(' ').length).toBeLessThanOrEqual(8));
  });
  test('first and last buttons', () => {
    expect(cards[0].next).toBe('Show me');
    expect(cards[2].next).toBe('Next');
    expect(cards[4].next).toBe('Start tracking');
  });
  test('falls back when no name is known yet', () => {
    expect(tourCards({ accountType: 'owner', userName: 'Friend' })[0].title).toBe('Welcome to Spot it');
  });
});
describe('tourCards for a partner', () => {
  const cards = tourCards({ accountType: 'partner', userName: 'Tunde Bello', partnerName: 'Amaka' });
  test('has the three agreed cards', () => {
    expect(cards.map(c => c.key)).toEqual(['partnerWelcome', 'partnerCheckIn', 'partnerReminder']);
  });
  test('uses the name he saved for her', () => {
    expect(cards[0].title).toBe('Hi, Tunde');
    expect(cards[0].body).toBe('See Amaka’s app. You can look, not change.');
    expect(cards[1].body).toBe('Show up for Amaka, earn SpotPoints.');
    expect(cards[2].body).toBe('A heads-up 5 days before Amaka’s period.');
    expect(cards[2].next).toBe('Get started');
  });
  test('reads naturally before her name has loaded', () => {
    const early = tourCards({ accountType: 'partner', userName: 'Tunde', partnerName: '' });
    expect(early[0].body).toBe('See her app. You can look, not change.');
    expect(early[1].body).toBe('Show up for her, earn SpotPoints.');
    expect(early[2].body).toBe('A heads-up 5 days before her period.');
  });
});
describe('seen flag', () => {
  test('is per account', async () => {
    expect(await wasTourSeen('u1')).toBe(false);
    await markTourSeen('u1');
    expect(await wasTourSeen('u1')).toBe(true);
    expect(await wasTourSeen('u2')).toBe(false);
  });
  test('needs an account', async () => {
    await markTourSeen(null);
    expect(await wasTourSeen(null)).toBe(false);
  });
});
