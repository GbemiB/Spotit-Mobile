import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Text } from '../../shared/styles/index.js';
const MIN_BAR_HEIGHT = 14;
const MAX_BAR_HEIGHT = 94;
const DEFAULT_MIN = 24;
const DEFAULT_MAX = 32;
export default function TrendChart({ data, labels }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const values = data || [29, 28, 27, 28, 29, 28];
  const min = Math.min(DEFAULT_MIN, ...values) - 2;
  const max = Math.max(DEFAULT_MAX, ...values) + 2;
  const span = Math.max(1, max - min);
  return (
    <View style={s.wrap}>
      {values.map((v, i) => {
        const h = Math.min(MAX_BAR_HEIGHT, Math.max(MIN_BAR_HEIGHT, ((v - min) / span) * 80 + 14));
        const cur = i === values.length - 1;
        return (
          <View key={i} style={s.col}>
            <Text style={[s.val, { color: cur ? colors.primaryDark : colors.textDisabled }]}>{v}</Text>
            {cur ? (
              <LinearGradient colors={colors.gradient.primaryAccent} style={[s.bar, { height: h }]} />
            ) : (
              <View style={[s.bar, { height: h, backgroundColor: colors.border }]} />
            )}
            {labels && <Text style={s.mo}>{labels[i]}</Text>}
          </View>
        );
      })}
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, minHeight: 110, marginTop: 16, overflow: 'hidden' },
    col: { flex: 1, alignItems: 'center', gap: 6 },
    val: { fontSize: 9, fontWeight: '700' },
    bar: { width: '100%', borderRadius: 8 },
    mo: { fontSize: 8, color: c.textDisabled, fontWeight: '600' },
  });
}
