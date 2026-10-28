const TONES = {
  light: {
    pink: { bg: '#FFF0F2', line: '#F2D0D8', ink: '#C04E68' },
    peach: { bg: '#FDEBE2', line: '#F6D3C2', ink: '#B85A33' },
    green: { bg: '#E7F2EB', line: '#B7DFC8', ink: '#3E8A66' },
    gold: { bg: '#FBF1E0', line: '#F1DDB8', ink: '#A9663D' },
    locked: { bg: '#F6F1EF', line: '#EDE3DF', ink: '#9A8B90' },
  },
  dark: {
    pink: { bg: 'rgba(220,90,116,0.14)', line: 'rgba(220,90,116,0.32)', ink: '#F2879B' },
    peach: { bg: 'rgba(240,168,104,0.14)', line: 'rgba(240,168,104,0.32)', ink: '#F0A868' },
    green: { bg: 'rgba(78,158,120,0.16)', line: 'rgba(107,191,155,0.32)', ink: '#6BBF9B' },
    gold: { bg: 'rgba(214,162,78,0.16)', line: 'rgba(214,162,78,0.32)', ink: '#E0B564' },
    locked: { bg: 'rgba(255,255,255,0.04)', line: '#3A2C30', ink: '#96878C' },
  },
};

export const GROUP_ICONS = {
  body: 'M12 4a8 8 0 1 1-8 8M12 4a8 8 0 0 0-8 8M12 8v4l3 2',
  hormones: 'M12 3c.5 4.2 2.2 6.5 7 7.5-4.8 1-6.5 3.3-7 7.5-.5-4.2-2.2-6.5-7-7.5 4.8-1 6.5-3.3 7-7.5z',
  conditions: 'M12 3.5c3 4 6 7.2 6 10.5a6 6 0 0 1-12 0c0-3.3 3-6.5 6-10.5z',
  lifestyle: 'M5 19c0-8 5-13 14-14-1 9-6 14-14 14zM5 19l7-7',
  relationships: 'M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z',
  fertility: 'M12 4c3.6 0 6 4.4 6 9a6 6 0 0 1-12 0c0-4.6 2.4-9 6-9z',
  screening: 'M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z',
};

export function tone(name, isDark) {
  return TONES[isDark ? 'dark' : 'light'][name] || TONES.light.pink;
}

export function quizColors(c, isDark) {
  return {
    gold: isDark ? '#E0B564' : '#B5832F',
    goldSoft: c.tertiarySoft,
    goldDeep: c.tertiaryDeep,
    green: isDark ? '#6BBF9B' : '#3E8A66',
    greenSoft: c.successSoft,
    peach: isDark ? '#F0A868' : '#E07A4F',
    peachSoft: isDark ? 'rgba(240,168,104,0.16)' : '#FDEBE2',
    blobA: isDark ? 'rgba(220,90,116,0.30)' : '#FCE3DC',
    blobB: isDark ? 'rgba(214,162,78,0.24)' : '#F6E6CC',
    button: isDark ? ['#C9536D', '#E2647C'] : ['#C04E68', '#DC5A74'],
    goldButton: isDark ? ['#B8893A', '#E0B564'] : ['#C28A33', '#D6A24E'],
    shadow: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(192,78,104,0.18)',
    eggFill: isDark ? '#3A2E22' : '#FFF6E5',
  };
}
