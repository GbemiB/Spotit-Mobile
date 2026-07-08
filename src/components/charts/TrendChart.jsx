import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { MONTHS_SHORT } from '../../shared/constants/cycle.js';
import { useTheme, Text } from '../../shared/styles/index.js';

export default function TrendChart({ data, labels }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const values = data || [29, 28, 27, 28, 29, 28];
  const months = labels || MONTHS_SHORT.slice(0, values.length);
  const min = 24, max = 32;

  return (
    <View style={s.wrap}>
      {values.map((v, i) => {
        const h = ((v - min) / (max - min)) * 80 + 14;
        const cur = i === values.length - 1;
        return (
          <View key={i} style={s.col}>
            <Text style={[s.val, { color: cur ? colors.primaryDark : colors.textDisabled }]}>{v}</Text>
            {cur
              ? <LinearGradient colors={colors.gradient.primaryAccent} style={[s.bar, { height: h }]} />
              : <View style={[s.bar, { height: h, backgroundColor: colors.border }]} />
            }
            <Text style={s.mo}>{months[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 110, marginTop: 16 },
    col: { flex: 1, alignItems: 'center', gap: 6 },
    val: { fontSize: 9, fontWeight: '700' },
    bar: { width: '100%', borderRadius: 8 },
    mo: { fontSize: 8, color: c.textDisabled, fontWeight: '600' },
  });
}
