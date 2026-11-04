const DARK = {
  bg: '#181214',
  surface: '#221A1D',
  border: '#3A2C30',
  text: '#F5EDE9',
  text2: '#C7B8BD',
  text3: '#96878C',
  glow: 'rgba(226,100,124,0.18)',
  petal: 'rgba(242,160,174,0.5)',
  spark: '#FFE3B0',
  pink: '#E2647C',
  pinkInk: '#F2A0AE',
  pinkSoft: 'rgba(220,90,116,0.16)',
  pinkBorder: 'rgba(220,90,116,0.4)',
  green: '#4E9E78',
  greenInk: '#6BBF9B',
  greenSoft: 'rgba(78,158,120,0.18)',
  greenBorder: 'rgba(107,191,155,0.4)',
  gold: '#E0B564',
  goldBar: '#E0B564',
  goldSoft: 'rgba(214,162,78,0.18)',
  goldInk: '#E0B564',
  peachSoft: 'rgba(240,168,104,0.16)',
  peachInk: '#F0A868',
  orange: '#F0A868',
  orangeSoft: 'rgba(240,168,104,0.16)',
  red: '#F08A7A',
  redSoft: 'rgba(240,138,122,0.16)',
  track: '#3A2C30',
  starOff: '#3A2C30',
  overlay: 'rgba(0,0,0,0.6)',
  cardShadow: 'transparent',
  disabledBg: '#2A2023',
  disabledFg: '#7A6C71',
  cardGlow: 'rgba(226,100,124,0.20)',
  dash: '#4A3438',
  heroBg: ['#2E1E24', '#241A1E', '#1E171A'],
  levelColors: ['#6BBF9B', '#F0A868', '#E0B564', '#E2647C', '#F2A0AE'],
};

const LIGHT = {
  bg: '#FBF6F4',
  surface: '#FFFFFF',
  border: '#F2E6E1',
  text: '#2E2429',
  text2: '#6E6066',
  text3: '#9A8B90',
  glow: '#FFE9DF',
  petal: '#F2A0AE',
  spark: '#E2B86A',
  pink: '#DC5A74',
  pinkInk: '#C04E68',
  pinkSoft: '#FFF0F2',
  pinkBorder: '#F2D0D8',
  green: '#4E9E78',
  greenInk: '#2F7454',
  greenSoft: '#E7F2EB',
  greenBorder: '#B7DFC8',
  gold: '#D6A24E',
  goldBar: '#E2B86A',
  goldSoft: '#FBF1E0',
  goldInk: '#A9663D',
  peachSoft: '#FDEBE2',
  peachInk: '#A9663D',
  orange: '#E07A4F',
  orangeSoft: '#FDEBE2',
  red: '#C9604F',
  redSoft: '#FDECEA',
  track: '#F2E6E1',
  starOff: '#EADBD6',
  overlay: 'rgba(46,36,41,0.45)',
  cardShadow: 'rgba(192,78,104,0.06)',
  disabledBg: '#F2E6E1',
  disabledFg: '#9A8B90',
  cardGlow: 'rgba(242,160,174,0.30)',
  dash: '#EBCFD6',
  heroBg: ['#FFFFFF', '#FFF3EE', '#FFE9E4'],
  levelColors: ['#4E9E78', '#F0A868', '#D6A24E', '#DC5A74', '#C04E68'],
};

export function spotTokens(isDark) {
  return isDark ? DARK : LIGHT;
}

export function levelColor(t, n) {
  const list = t.levelColors;
  return list[(Math.max(1, n || 1) - 1) % list.length];
}

export function toneOf(t, name) {
  const m = {
    pink: [t.pinkSoft, t.pinkInk],
    gold: [t.goldSoft, t.goldInk],
    peach: [t.peachSoft, t.peachInk],
    green: [t.greenSoft, t.greenInk],
  };
  return m[name] || m.pink;
}

export const STAR_PATH = 'M12 2.5l2.8 6 6.5.7-4.8 4.4 1.3 6.4L12 16.8l-5.8 3.2 1.3-6.4-4.8-4.4 6.5-.7z';
export const HEART_PATH = 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z';
export const SPARK_PATH = 'M12 3l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2z';
