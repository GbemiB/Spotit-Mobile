export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Mirrors the backend's CyclePhase enum (com.spotit.api.cycle.CyclePhase) — single source
// for phase display text so it isn't hand-copied wherever a phase gets rendered. Only
// period/fertile/ovulation are tracked; the luteal/follicular stretches aren't labeled.
export const PHASE_LABELS = {
  period: 'Period',
  fertile: 'Fertile',
  ovulation: 'Ovulation',
};

export const PHASE_NOTES = {
  period: 'Menstruation phase. Rest and gentle movement help with cramps.',
  fertile: 'Fertile window — higher chance of conception around these days.',
  ovulation: 'Predicted ovulation day. Your most fertile point of the cycle.',
};
