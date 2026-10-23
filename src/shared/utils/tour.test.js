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
  test('has the nine agreed cards in order', () => {
    expect(cards.map(c => c.key)).toEqual(['welcome', 'cycle', 'log', 'mood', 'calendar', 'insights', 'points', 'reminders', 'share']);
  });
  test('welcomes her by first name', () => expect(cards[0].title).toBe('Welcome, Amaka'));
  test('first and last buttons', () => {
    expect(cards[0].next).toBe('Start the tour');
    expect(cards[4].next).toBe('Next');
    expect(cards[8].next).toBe('Start tracking');
  });
  test('falls back when no name is known yet', () => {
    expect(tourCards({ accountType: 'owner', userName: 'Friend' })[0].title).toBe('Welcome to Spot it');
  });
});
describe('tourCards for a partner', () => {
  const cards = tourCards({ accountType: 'partner', userName: 'Tunde Bello', partnerName: 'Amaka' });
  test('has the four agreed cards', () => {
    expect(cards.map(c => c.key)).toEqual(['partnerWelcome', 'partnerLogs', 'partnerCheckIn', 'partnerReminder']);
  });
  test('uses the name he saved for her', () => {
    expect(cards[0].title).toBe('Welcome, Tunde');
    expect(cards[0].body).toContain("You're seeing Amaka's app");
    expect(cards[2].body).toContain('how you supported Amaka today');
    expect(cards[3].body).toContain("5 days before Amaka's period");
    expect(cards[3].next).toBe('Get started');
  });
  test('reads naturally before her name has loaded', () => {
    const early = tourCards({ accountType: 'partner', userName: 'Tunde', partnerName: '' });
    expect(early[0].body).toContain("You're seeing her app");
    expect(early[1].body).toContain('see what she logged');
    expect(early[3].body).toContain('5 days before her period');
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
