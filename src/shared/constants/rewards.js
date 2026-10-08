export const SHOP_PRODUCT_ICONS = { rosewater_mist: '🌹', vitc_serum: '💧', sheet_mask_set: '🧖‍♀️', skincare_bundle: '🎁' };
// Premium is hidden until subscriptions go through real Google Play / App Store billing. The store
// policies reject paid upgrades that bypass their billing, and the current flow uses a mock receipt.
export const PREMIUM_ENABLED = false;
export const NOTIF_ROWS = [
  { key: 'period', icon: '🩸', colorKey: 'primary', label: 'Period reminders', sub: 'Alerts before your period starts' },
  { key: 'ovulation', icon: '🌼', colorKey: 'tertiary', label: 'Ovulation alerts', sub: 'Fertile window & ovulation day' },
  { key: 'dailyLog', icon: '📝', colorKey: 'success', label: 'Daily log nudge', sub: 'A gentle reminder each evening' },
  { key: 'digest', icon: '📊', colorKey: 'secondary', label: 'Weekly digest', sub: 'Your mood & cycle summary' },
];
