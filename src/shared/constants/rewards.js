export const SHOP_PRODUCTS = [
  { id: 'rosewater_mist',  name: 'Rosewater Face Mist',       fp: 800,  minLevel: 'Petal',      premium: false, icon: '🌹' },
  { id: 'vitc_serum',      name: 'Vitamin C Serum',           fp: 2500, minLevel: 'Rosé',       premium: false, icon: '💧' },
  { id: 'sheet_mask_set',  name: 'Hydrating Sheet Mask Set',  fp: 4000, minLevel: 'Bloom',      premium: true,  icon: '🧖‍♀️' },
  { id: 'skincare_bundle', name: 'Luxury Skincare Bundle',    fp: 8000, minLevel: 'Wildflower', premium: true,  icon: '🎁' },
];

// `type: 'weekly_log'` challenges are computed from real logs (days logged this
// week out of 7); `type: 'static'` ones use their own done/total since there's
// no real tracking behind them yet (e.g. reading articles).
export const CHALLENGES = [
  { id: 'log_week', type: 'weekly_log', title: 'Log your mood every day', reward: 150, total: 7 },
  { id: 'read_3',   type: 'static',     title: 'Read 3 nutrition articles', reward: 120, total: 3, done: 1 },
];

// colorKey resolves to `colors[colorKey]Soft` at render time for the icon's
// tinted background, so it stays theme-correct in both light and dark.
export const NOTIF_ROWS = [
  { key: 'period',    icon: '🩸', colorKey: 'primary',   label: 'Period reminders',  sub: 'Alerts before your period starts' },
  { key: 'ovulation', icon: '🌼', colorKey: 'tertiary',  label: 'Ovulation alerts',  sub: 'Fertile window & ovulation day' },
  { key: 'dailyLog',  icon: '📝', colorKey: 'success',   label: 'Daily log nudge',   sub: 'A gentle reminder each evening' },
  { key: 'digest',    icon: '📊', colorKey: 'secondary', label: 'Weekly digest',     sub: 'Your mood & cycle summary' },
];
