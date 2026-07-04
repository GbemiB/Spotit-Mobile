import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { DAYS_SHORT } from '../../shared/constants/cycle.js';
import { cycleDayOf, phaseFor, toISO, daysInMonth } from '../../shared/utils/cycle.js';
import { useTheme } from '../../shared/styles/index.js';

export default function CalendarGrid({ year, month, selDate, logs = {}, cycleState, onSelect }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { lastPeriodDate, cycleLength, periodLength } = cycleState;
  const first   = new Date(year, month, 1).getDay();
  const count   = daysInMonth(year, month);
  const todayISO = toISO(new Date());
  const cells   = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  return (
    <View>
      <View style={s.header}>
        {DAYS_SHORT.map((x, i) => <Text key={i} style={s.dow}>{x}</Text>)}
      </View>
      <View style={s.grid}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={s.cell} />;
          const iso    = toISO(new Date(year, month, d));
          const cd     = cycleDayOf(iso, lastPeriodDate, cycleLength);
          const ph     = phaseFor(cd, periodLength, cycleLength);
          const isToday = iso === todayISO;
          const isSel   = iso === selDate;
          const hasLog  = !!logs[iso];

          return (
            <Pressable key={i} onPress={() => onSelect(iso)} style={s.cell}>
              <View style={[
                s.dayCircle,
                isToday && { backgroundColor: ph.color || colors.primary },
                !isToday && ph.color && { backgroundColor: ph.color + '26' },
                isSel && !isToday && { borderWidth: 2, borderColor: ph.color || colors.primary },
              ]}>
                <Text style={[s.dayText, isToday && { color: colors.white, fontWeight: '700' }, !isToday && !ph.color && { color: colors.textMuted }]}>
                  {d}
                </Text>
                {hasLog && !isToday && <View style={[s.dot, { backgroundColor: ph.color || colors.primary }]} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    header:    { flexDirection: 'row', marginBottom: 8 },
    dow:       { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700', color: c.textFaint },
    grid:      { flexDirection: 'row', flexWrap: 'wrap' },
    cell:      { width: '14.28%', paddingVertical: 2, alignItems: 'center' },
    dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    dayText:   { fontSize: 14, fontWeight: '500', color: c.textPrimary },
    dot:       { position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: 2, opacity: 0.7 },
  });
}
