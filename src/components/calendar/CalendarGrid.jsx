import { View, Pressable, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { DAYS_SHORT } from '../../shared/constants/cycle.js';
import { cycleDayOf, phaseFor, toISO, daysInMonth } from '../../shared/utils/cycle.js';
import { useTheme, phases, Text } from '../../shared/styles/index.js';

export default function CalendarGrid({ year, month, selDate, logs = {}, cycleState, phaseByDate = {}, rangeStart, rangeEnd, onSelect }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { lastPeriodDate, cycleLength, periodLength } = cycleState;
  const first = new Date(year, month, 1).getDay();
  const count = daysInMonth(year, month);
  const todayISO = toISO(new Date());
  // Range-picking (the "Log a period" sheet) always passes both boundaries; the plain
  // Calendar tab never does. In range mode "today" must not compete visually with the
  // real Start/End markers, so its special fill/text treatment is fully suppressed —
  // it renders like any other unselected day.
  const isRangeMode = rangeStart != null && rangeEnd != null;
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  return (
    <View>
      <View style={s.header}>
        {DAYS_SHORT.map((x, i) => (
          <Text key={i} style={s.dow}>
            {x}
          </Text>
        ))}
      </View>
      <View style={s.grid}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={s.cell} />;
          const iso = toISO(new Date(year, month, d));
          // Prefer the server-computed phase for this date (from GET /cycle/calendar);
          // fall back to the local calculation for months that haven't been fetched yet.
          const phaseKey = phaseByDate[iso] ?? phaseFor(cycleDayOf(iso, lastPeriodDate, cycleLength), periodLength, cycleLength).key;
          const ph = { color: phaseKey ? phases[phaseKey] : null };
          const isToday = !isRangeMode && iso === todayISO;
          const isSel = iso === selDate;
          const hasLog = !!logs[iso];
          const inRange = rangeStart && rangeEnd && iso >= rangeStart && iso <= rangeEnd;
          const isRangeEdge = iso === rangeStart || iso === rangeEnd;
          const isSingleDayRange = rangeStart === rangeEnd;

          return (
            <Pressable key={i} onPress={() => onSelect(iso)} style={s.cell}>
              {inRange && !isSingleDayRange && (
                <View style={[s.rangeFill, iso === rangeStart && s.rangeFillStart, iso === rangeEnd && s.rangeFillEnd]} />
              )}
              <View
                style={[
                  s.dayCircle,
                  isToday && { backgroundColor: ph.color || colors.primary },
                  !isToday && ph.color && { backgroundColor: ph.color + '26' },
                  isSel && !isToday && { borderWidth: 2, borderColor: ph.color || colors.primary },
                  isRangeEdge && !isToday && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    s.dayText,
                    isToday && { color: colors.white, fontWeight: '600' },
                    !isToday && !ph.color && { color: colors.textMuted },
                    isRangeEdge && !isToday && { color: colors.white, fontWeight: '700' },
                  ]}
                >
                  {d}
                </Text>
                {hasLog && !isToday && !isRangeEdge && <View style={[s.dot, { backgroundColor: ph.color || colors.primary }]} />}
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
    header: { flexDirection: 'row', marginBottom: 8 },
    dow: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '400', color: c.textFaint },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: { width: '14.28%', paddingVertical: 2, alignItems: 'center' },
    dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    dayText: { fontSize: 12, fontWeight: '400', color: c.textPrimary },
    dot: { position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: 2, opacity: 0.7 },
    rangeFill: { position: 'absolute', top: 2, bottom: 2, left: 0, right: 0, backgroundColor: c.primarySoft },
    rangeFillStart: { left: '50%', borderTopLeftRadius: 18, borderBottomLeftRadius: 18 },
    rangeFillEnd: { right: '50%', borderTopRightRadius: 18, borderBottomRightRadius: 18 },
  });
}
