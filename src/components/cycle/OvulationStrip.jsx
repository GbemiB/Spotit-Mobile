import { View, Animated, StyleSheet } from 'react-native';
import { useMemo, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { cycleDayOf, phaseFor, toISO } from '../../shared/utils/cycle.js';
import { DAYS_SHORT } from '../../shared/constants/cycle.js';
import { useTheme, Text } from '../../shared/styles/index.js';
function PulseRing({ color }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(anim, { toValue: 1, duration: 2200, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: color,
        opacity: anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.5, 0.15, 0] }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }],
      }}
    />
  );
}
export default function OvulationStrip({ lastPeriodDate, cycleLength, periodLength }) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const cells = useMemo(() => {
    const today = new Date();
    const out = [];
    for (let off = -3; off <= 3; off++) {
      const d = new Date(today);
      d.setDate(d.getDate() + off);
      const iso = toISO(d);
      const cd = cycleDayOf(iso, lastPeriodDate, cycleLength);
      const ph = phaseFor(cd, periodLength, cycleLength);
      out.push({
        key: off,
        label: off === 0 ? 'Today' : DAYS_SHORT[d.getDay()],
        mark: d.getDate(),
        isOvulation: ph.key === 'ovulation',
        isFertile: ph.key === 'fertile',
      });
    }
    return out;
  }, [lastPeriodDate, cycleLength, periodLength]);
  return (
    <View style={s.row}>
      {cells.map(c => (
        <View key={c.key} style={s.col}>
          <Text style={s.dow} numberOfLines={1} adjustsFontSizeToFit>
            {c.label}
          </Text>
          {c.isOvulation ? (
            <View style={s.cellWrap}>
              <PulseRing color={colors.primary} />
              <LinearGradient colors={colors.gradient.primaryAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cell}>
                <Text style={[s.mark, { color: colors.white }]}>●</Text>
              </LinearGradient>
            </View>
          ) : c.isFertile ? (
            <View style={[s.cell, { backgroundColor: isDark ? 'rgba(95,169,140,0.22)' : 'rgba(95,169,140,0.18)' }]}>
              <Text style={[s.mark, { color: '#5FA98C' }]}>{c.mark}</Text>
            </View>
          ) : (
            <View style={[s.cell, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F4E7E2' }]}>
              <Text style={[s.mark, { color: isDark ? 'rgba(255,255,255,0.4)' : '#B9A9A2' }]}>{c.mark}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    row: { flexDirection: 'row', gap: 7 },
    col: { flex: 1, alignItems: 'center', gap: 5 },
    dow: { fontSize: 7, fontWeight: '700', color: c.textFaint },
    cellWrap: { width: '100%' },
    cell: { width: '100%', height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    mark: { fontSize: 9, fontWeight: '700' },
  });
}
