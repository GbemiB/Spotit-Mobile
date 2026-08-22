// Cycle-phase colors are intentionally theme-invariant — they're semantic/data-viz
// colors (same meaning in light & dark), not UI chrome.
export const phases = {
  period: '#E5383B',
  fertile: '#5FA98C',
  ovulation: '#D6A24E',
};

// Third-party brand colors that must not shift with the theme (e.g. Apple's
// "Sign in with Apple" button is required to stay near-black).
export const brandFixed = {
  apple: '#000000',
};

export const light = {
  white: '#FFFFFF',
  black: '#000000',

  primary: '#DC5A74',
  primaryDark: '#C04E68',
  primaryLight: '#F2A0AE',
  primarySoft: '#FFF0F2',
  primarySoftBorder: '#F2D0D8',

  secondary: '#9B86C9',
  secondarySoft: '#F4F1FB',

  tertiary: '#D6A24E',
  tertiarySoft: '#FBF1E0',
  // Warm brown accent for "insight" copy (ovulation card title, digest card
  // title) — distinct from the gold `tertiary` used for dots/highlights.
  tertiaryDeep: '#A9663D',

  background: '#FBF6F4',
  surface: '#FFFFFF',
  surfaceAlt: '#FAFAFA',
  border: '#F2E6E1',

  textPrimary: '#2E2429',
  textSecondary: '#6E6066',
  textMuted: '#9A8B90',
  textFaint: '#C2AEA6',
  textDisabled: '#B9A9A2',

  success: '#4E9E78',
  successSoft: '#E7F2EB',
  successBorder: '#B7DFC8',
  warning: '#D6A24E',
  warningSoft: '#FBF1E0',
  error: '#DC2626',
  errorSoft: '#FEF2F2',
  errorBorder: '#FECACA',
  info: '#A8C5DA',
  infoSoft: '#EAF3F8',

  overlay: 'rgba(46,36,41,0.45)',
  shadow: '#2E2429',
  // Always a dark, high-contrast surface (paired with white text) — used for
  // toasts/tooltips that should pop the same way in both light and dark mode.
  inverseSurface: '#2E2429',

  gradient: {
    primary: ['#C04E68', '#DC5A74'],
    primaryVivid: ['#A9426A', '#C04E68', '#DC5A74'],
    primaryAccent: ['#E2647C', '#DC5A74'],
    fabAccent: ['#C04E68', '#DC5A74', '#E2647C'],
    ring: ['#F2A0AE', '#DC5A74', '#D6A24E'],
  },

  // Auth/onboarding flow only — the warm gradient screens from the Welcome/Signup/Login
  // design, distinct from the flat c.background used by the main app.
  authGradient: ['#FFF3F1', '#FCE0DE', '#F6C7C9', '#EEACAF'],
  splashGradient: ['#FFFDFC', '#FCEEEA', '#F7E3DC'],
  authGradientCta: ['#F2A0AE', '#DC5A74'],
  authHeading: '#2E2429',
  authBody: '#5C2430',
  authLabel: '#B0827D',
  authBorder: '#DDCBC2',
  authBorderStrong: '#C9AFA3',
  authAccent: '#C04E68',
  authInputBg: '#FFFFFF',
  authInputBorder: '#EAD3CC',
};

export const dark = {
  white: '#FFFFFF',
  black: '#000000',

  primary: '#E2647C',
  primaryDark: '#C9536D',
  primaryLight: '#F2A0AE',
  primarySoft: 'rgba(220,90,116,0.16)',
  primarySoftBorder: 'rgba(220,90,116,0.35)',

  secondary: '#B4A2DA',
  secondarySoft: 'rgba(155,134,201,0.16)',

  tertiary: '#E0B564',
  tertiarySoft: 'rgba(214,162,78,0.16)',
  tertiaryDeep: '#F0A868',

  background: '#181214',
  surface: '#221A1D',
  surfaceAlt: '#2A2023',
  border: '#3A2C30',

  textPrimary: '#F5EDE9',
  textSecondary: '#C7B8BD',
  textMuted: '#96878C',
  textFaint: '#7A6C71',
  textDisabled: '#6E6066',

  success: '#6BBF9B',
  successSoft: 'rgba(78,158,120,0.18)',
  successBorder: 'rgba(107,191,155,0.4)',
  warning: '#E0B564',
  warningSoft: 'rgba(214,162,78,0.18)',
  error: '#F87171',
  errorSoft: 'rgba(220,38,38,0.18)',
  errorBorder: 'rgba(248,113,113,0.4)',
  info: '#8FB8D6',
  infoSoft: 'rgba(168,197,218,0.16)',

  overlay: 'rgba(0,0,0,0.6)',
  shadow: '#000000',
  inverseSurface: '#2A2023',

  gradient: {
    primary: ['#C9536D', '#E2647C'],
    primaryVivid: ['#8F3357', '#C04E68', '#E2647C'],
    primaryAccent: ['#E2647C', '#F2879B'],
    fabAccent: ['#C9536D', '#E2647C', '#F2879B'],
    ring: ['#F2A0AE', '#E2647C', '#E0B564'],
  },

  // Auth/onboarding flow only — mirrors the design's dark-mode gradient screens.
  authGradient: ['#160A0C', '#180A0E', '#1C0910', '#200A13'],
  splashGradient: ['#160A0C', '#150910', '#1C0910'],
  authGradientCta: ['#F2A0AE', '#DC5A74'],
  authHeading: '#FFFFFF',
  authBody: 'rgba(255,255,255,0.65)',
  authLabel: 'rgba(255,255,255,0.45)',
  authBorder: 'rgba(255,255,255,0.16)',
  authBorderStrong: 'rgba(255,255,255,0.28)',
  authAccent: '#F2A0AE',
  authInputBg: 'rgba(255,255,255,0.06)',
  authInputBorder: 'rgba(255,255,255,0.16)',
};
