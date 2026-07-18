export const DEFAULT_CYCLE_LENGTH  = 28;
export const DEFAULT_PERIOD_LENGTH = 5;

export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const DAYS_SHORT = ['S','M','T','W','T','F','S'];

// Mirrors the backend's CyclePhase enum (com.spotit.api.cycle.CyclePhase) — single source
// for phase display text so it isn't hand-copied wherever a phase gets rendered.
export const PHASE_LABELS = {
  period:     'Period',
  follicular: 'Follicular',
  fertile:    'Fertile',
  ovulation:  'Ovulation',
  luteal:     'Luteal',
};

export const PHASE_NOTES = {
  period:     'Menstruation phase. Rest and gentle movement help with cramps.',
  follicular: 'Follicular phase. Energy typically rises after your period.',
  fertile:    'Fertile window — higher chance of conception around these days.',
  ovulation:  'Predicted ovulation day. Your most fertile point of the cycle.',
  luteal:     'Luteal phase. PMS symptoms may appear toward the end.',
};
