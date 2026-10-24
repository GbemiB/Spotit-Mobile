import AsyncStorage from '@react-native-async-storage/async-storage';
const SEEN_KEY_PREFIX = 'spotit_tour_seen_';
export function firstNameOf(name) {
  const first = (name || '').trim().split(/\s+/)[0] || '';
  return first === 'Friend' ? '' : first;
}
function hers(name) {
  return name ? `${name}’s` : 'her';
}
function ownerCards(firstName) {
  return [
    { key: 'welcome', title: firstName ? `Hi, ${firstName}` : 'Welcome to Spot it', body: 'Your cycle, made simple.', next: 'Show me' },
    { key: 'calendar', title: 'Know what’s next', body: 'Period, fertile days and ovulation, colour-coded.' },
    { key: 'log', title: 'Log in a tap', body: 'Your period, mood and symptoms, any day.' },
    { key: 'points', title: 'Earn SpotPoints', body: 'Every log and check-in counts.' },
    { key: 'control', title: 'You’re in control', body: 'Change any of it in Profile.', next: 'Start tracking' },
  ];
}
function partnerCards(firstName, partnerName) {
  return [
    {
      key: 'partnerWelcome',
      title: firstName ? `Hi, ${firstName}` : 'Welcome to Spot it',
      body: `See ${hers(partnerName)} app. You can look, not change.`,
      next: 'Show me',
    },
    { key: 'partnerCheckIn', title: 'Check in daily', body: `Show up for ${partnerName || 'her'}, earn SpotPoints.` },
    {
      key: 'partnerReminder',
      title: 'Know before it starts',
      body: `A heads-up 5 days before ${hers(partnerName)} period.`,
      next: 'Get started',
    },
  ];
}
export function tourCards({ accountType, userName, partnerName }) {
  const firstName = firstNameOf(userName);
  const cards = accountType === 'partner' ? partnerCards(firstName, (partnerName || '').trim()) : ownerCards(firstName);
  return cards.map(card => ({ next: 'Next', ...card }));
}
export async function wasTourSeen(userId) {
  if (!userId) return false;
  try {
    return (await AsyncStorage.getItem(SEEN_KEY_PREFIX + userId)) === '1';
  } catch {
    return false;
  }
}
export async function markTourSeen(userId) {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(SEEN_KEY_PREFIX + userId, '1');
  } catch {
    return;
  }
}
