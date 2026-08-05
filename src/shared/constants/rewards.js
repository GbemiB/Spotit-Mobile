// Products/challenges themselves come from the backend (GET /shop/products,
// GET /rewards/challenges) — icons are presentation-only, so they're mapped
// locally by id rather than round-tripping through the API.
export const SHOP_PRODUCT_ICONS = {
  rosewater_mist: '🌹',
  vitc_serum: '💧',
  sheet_mask_set: '🧖‍♀️',
  skincare_bundle: '🎁',
};

// colorKey resolves to `colors[colorKey]Soft` at render time for the icon's
// tinted background, so it stays theme-correct in both light and dark.
export const NOTIF_ROWS = [
  { key: 'period', icon: '🩸', colorKey: 'primary', label: 'Period reminders', sub: 'Alerts before your period starts' },
  { key: 'ovulation', icon: '🌼', colorKey: 'tertiary', label: 'Ovulation alerts', sub: 'Fertile window & ovulation day' },
  { key: 'dailyLog', icon: '📝', colorKey: 'success', label: 'Daily log nudge', sub: 'A gentle reminder each evening' },
  { key: 'digest', icon: '📊', colorKey: 'secondary', label: 'Weekly digest', sub: 'Your mood & cycle summary' },
];
