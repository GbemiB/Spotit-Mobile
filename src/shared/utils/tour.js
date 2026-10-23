import AsyncStorage from '@react-native-async-storage/async-storage';
const SEEN_KEY_PREFIX = 'spotit_tour_seen_';
export function firstNameOf(name) {
  const first = (name || '').trim().split(/\s+/)[0] || '';
  return first === 'Friend' ? '' : first;
}
function hers(name) {
  return name ? `${name}'s` : 'her';
}
function ownerCards(firstName) {
  return [
    {
      key: 'welcome',
      title: firstName ? `Welcome, ${firstName}` : 'Welcome to Spot it',
      body: "Here's a quick look at everything Spot it can do for you. It takes about a minute.",
      next: 'Start the tour',
    },
    {
      key: 'cycle',
      title: 'Your cycle at a glance',
      body: 'Home shows where you are in your cycle and counts down to your next period, fertile window and ovulation.',
    },
    {
      key: 'log',
      title: 'Log your period in a few taps',
      body: 'Tap the day it started. We fill in the end from your usual period length, and you can change it any time.',
    },
    {
      key: 'mood',
      title: 'Tell us how you feel',
      body: 'Check in with your mood each day on Home, and add symptoms and notes to any day in the Calendar.',
    },
    {
      key: 'calendar',
      title: 'See your month',
      body: 'The Calendar colours your period, fertile window and ovulation. Tap a day to see or change it, and tap ⓘ for the colour guide.',
    },
    {
      key: 'insights',
      title: 'Learn your patterns',
      body: "Insights shows how long your cycles run, your mood each week and a regularity check once you've logged two cycles.",
    },
    {
      key: 'points',
      title: 'Earn SpotPoints',
      body: 'Every log and check-in earns points. Build a streak, level up, collect badges and spend points in the shop.',
    },
    {
      key: 'reminders',
      title: 'Never be caught off guard',
      body: "Reminders give you a heads-up before your period and ovulation. We'll ask to turn them on next, and you choose which ones in Profile.",
    },
    {
      key: 'share',
      title: 'Share with your partner, keep control',
      body: 'Invite your partner from Profile so they know when your period is coming. Your data is yours: export it or delete it whenever you like.',
      next: 'Start tracking',
    },
  ];
}
function partnerCards(firstName, partnerName) {
  return [
    {
      key: 'partnerWelcome',
      title: firstName ? `Welcome, ${firstName}` : 'Welcome to Spot it',
      body: `You're seeing ${hers(partnerName)} app, just as she sees it. You can look at everything she tracks, but you can't change anything.`,
    },
    {
      key: 'partnerLogs',
      title: 'What she logs',
      body: `Open the Calendar or tap a day on Home to see what ${partnerName || 'she'} logged: flow, mood, symptoms and notes.`,
    },
    {
      key: 'partnerCheckIn',
      title: 'Your daily check-in',
      body: `Tell us how you supported ${partnerName || 'her'} today. Each check-in earns you SpotPoints and builds your streak, and you can spend points in the shop.`,
    },
    {
      key: 'partnerReminder',
      title: 'Know before it starts',
      body: `You'll get a reminder 5 days before ${hers(partnerName)} period. You can turn it off or stop sharing any time in Profile.`,
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
