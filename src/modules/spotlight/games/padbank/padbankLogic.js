export const PACK_COLORS = {
  pink: { bag: '#F2A0AE', dark: '#C8466A' },
  peach: { bag: '#F6C3A8', dark: '#B85A33' },
  rose: { bag: '#E8708A', dark: '#A9405A' },
  green: { bag: '#8FCBA9', dark: '#2F7454' },
};

export const PACK_MARKS = {
  starter: 'M30 33v10M25 38h10',
  school: 'M23 42l7-7 7 7',
  comfort: 'M25 36c0-3.5 10-3.5 10 0s-5 6.5-5 6.5-5-3-5-6.5z',
  reusable: 'M25 39a5 5 0 1 0 1.6-3.7M25 34v3h3',
};

export const CLUE_ICONS = {
  drop: 'M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5z',
  drops: 'M8 4s3.5 3.7 3.5 6a3.5 3.5 0 0 1-7 0c0-2.3 3.5-6 3.5-6zM16 10s3.5 3.7 3.5 6a3.5 3.5 0 0 1-7 0c0-2.3 3.5-6 3.5-6z',
  noMoney: 'M3 8h18v10H3zM3 12h18M5 4l14 18',
  house: 'M4 11l8-7 8 7v9H4zM10 20v-5h4v5',
  tent: 'M3 20L12 4l9 16zM12 4v16M9 20l3-6 3 6',
  noWalk: 'M12 5a1.5 1.5 0 1 0 0-.1M10 21l1.5-6-2-3 1-4h3l2 4M4 4l16 16',
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 1 6.5 18H20',
  walk: 'M13 4.5a1.5 1.5 0 1 0 0-.1M9 21l2-6 3 2v4M11 15l-1-4 3-2 3 3h3M7 11l3-2',
  smile: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM8.5 14a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01',
};

export const CLUE_TONES = ['pink', 'peach', 'green'];

export const RESULTS = {
  great: { word: 'PERFECT!', bg: '#4E9E78', shadow: '#2F7454', icon: 'M5 12.5l4.5 4.5L19 7.5' },
  ok: { word: 'GOOD!', bg: '#E07A4F', shadow: '#B85A33', icon: 'M12 7v6M12 17h.01' },
  oops: { word: 'OOPS!', bg: '#C9604F', shadow: '#8E3A2E', icon: 'M7 7l10 10M17 7L7 17' },
};

export function moodFor(phase, result) {
  if (phase !== 'result') return 'neutral';
  return result === 'oops' ? 'sad' : 'happy';
}

export function clueIcon(name) {
  return CLUE_ICONS[name] || CLUE_ICONS.smile;
}

export function packColor(name) {
  return PACK_COLORS[name] || PACK_COLORS.pink;
}

export function endTitle(hearts, stars) {
  if (hearts <= 0) return 'Out of hearts';
  if (stars === 3) return 'Bank clear!';
  if (stars === 2) return 'Nice day!';
  return 'Bank closed';
}

export function goalLabels(total, budgetGoal) {
  return [`${total} packs out`, `${total} perfect`, `${budgetGoal}+ budget left`];
}

export function nextLabel(finished) {
  return finished ? 'See the day' : 'Next visitor';
}

export function canPick(phase, stock) {
  return (phase === 'ask' || phase === 'route') && stock > 0;
}
