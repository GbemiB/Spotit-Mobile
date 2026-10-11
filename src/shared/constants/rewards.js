export const SHOP_PRODUCT_ICONS = { rosewater_mist: '🌹', vitc_serum: '💧', sheet_mask_set: '🧖‍♀️', skincare_bundle: '🎁' };
// Premium is hidden until subscriptions go through real Google Play / App Store billing. The store
// policies reject paid upgrades that bypass their billing, and the current flow uses a mock receipt.
export const PREMIUM_ENABLED = false;
export const NOTIF_ROWS = [
  { key: 'period', icon: '🩸', colorKey: 'primary', label: 'Period reminders', sub: 'A countdown to your predicted period' },
  { key: 'ovulation', icon: '🌼', colorKey: 'tertiary', label: 'Ovulation updates', sub: 'On your predicted ovulation day' },
  { key: 'dailyLog', icon: '📝', colorKey: 'success', label: 'Daily log nudge', sub: 'An evening prompt on your period days' },
  { key: 'digest', icon: '📊', colorKey: 'secondary', label: 'Weekly digest', sub: 'Sundays: your logging and mood summary' },
];
