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
