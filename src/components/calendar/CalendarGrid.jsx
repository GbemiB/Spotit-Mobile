import { View, Pressable, Animated, PanResponder, Easing, StyleSheet } from 'react-native';
import { useMemo, useRef, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { DAYS_SHORT } from '../../shared/constants/cycle.js';
import { calendarDay, toISO, daysInMonth } from '../../shared/utils/cycle.js';
import { useTheme, calendarPalette, Text } from '../../shared/styles/index.js';
import { useAnimatedValue, useReduceMotion } from '../../modules/dashboard/HeroCardFx.jsx';

const SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY = 0.5;
const SLIDE = 28;

function useMonthSwipe({ year, month, onPrevMonth, onNextMonth }) {
  const enabled = !!(onPrevMonth || onNextMonth);
  const reduceMotion = useReduceMotion();
  const shift = useAnimatedValue(0);
  const fade = useAnimatedValue(1);
  const lastKey = useRef(year * 12 + month);

  useEffect(() => {
    const key = year * 12 + month;
    const dir = Math.sign(key - lastKey.current);
    lastKey.current = key;
    if (!enabled || !dir) return;
    if (reduceMotion) {
      shift.setValue(0);
      fade.setValue(1);
      return;
    }
    shift.setValue(dir * SLIDE);
    fade.setValue(0.3);
    Animated.parallel([
      Animated.timing(shift, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [year, month, enabled, reduceMotion, shift, fade]);

  const responder = useMemo(() => {
    const isHorizontal = (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5;
    const settle = () => Animated.spring(shift, { toValue: 0, speed: 30, bounciness: 6, useNativeDriver: true }).start();
    return PanResponder.create({
      onMoveShouldSetPanResponder: isHorizontal,
      onMoveShouldSetPanResponderCapture: isHorizontal,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        if (!reduceMotion) shift.setValue(g.dx * 0.25);
      },
      onPanResponderRelease: (_, g) => {
        const goNext = g.dx < -SWIPE_DISTANCE || (g.vx < -SWIPE_VELOCITY && g.dx < -20);
        const goPrev = g.dx > SWIPE_DISTANCE || (g.vx > SWIPE_VELOCITY && g.dx > 20);
        const action = goNext ? onNextMonth : goPrev ? onPrevMonth : null;
        if (action) {
          Haptics.selectionAsync().catch(() => {});
          action();
        } else {
          settle();
        }
      },
      onPanResponderTerminate: settle,
    });
  }, [onPrevMonth, onNextMonth, reduceMotion, shift]);

  return { handlers: enabled ? responder.panHandlers : {}, style: { opacity: fade, transform: [{ translateX: shift }] } };
}
export default function CalendarGrid({
  year,
  month,
  selDate,
  logs = {},
  cycleState,
  phaseByDate = {},
  rangeStart,
  rangeEnd,
  onSelect,
  onPrevMonth,
  onNextMonth,
  disabledAfter,
}) {
  const { colors, isDark } = useTheme();
  const cal = calendarPalette[isDark ? 'dark' : 'light'];
  const swipe = useMonthSwipe({ year, month, onPrevMonth, onNextMonth });
  const s = useMemo(() => createStyles(colors), [colors]);
  const { lastPeriodDate, cycleLength, periodLength, trackingStart } = cycleState;
  const first = new Date(year, month, 1).getDay();
  const count = daysInMonth(year, month);
  const todayISO = toISO(new Date());
  const isRangeMode = rangeStart != null && rangeEnd != null;
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);
  return (
    <View {...swipe.handlers}>
      <View style={s.header}>
        {DAYS_SHORT.map((x, i) => (
          <Text key={i} style={s.dow}>
            {x}
          </Text>
        ))}
      </View>
      <Animated.View style={[s.grid, swipe.style]}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={s.cell} />;
          const iso = toISO(new Date(year, month, d));
          const info =
            phaseByDate[iso] ?? calendarDay(iso, { lastPeriodDate, cycleLength, periodLength, trackingStart, logs, todayIso: todayISO });
          const tint = info.phase ? cal.tint[info.phase] : null;
          const predictedPeriod = info.predicted && info.phase === 'period';
          const isToday = !isRangeMode && iso === todayISO;
          const isSel = !isRangeMode && iso === selDate;
          const hasLog = !!logs[iso];
          const inRange = rangeStart && rangeEnd && iso >= rangeStart && iso <= rangeEnd;
          const isRangeEdge = iso === rangeStart || iso === rangeEnd;
          const isSingleDayRange = rangeStart === rangeEnd;
          const disabled = !!disabledAfter && iso > disabledAfter;
          return (
            <Pressable
              key={i}
              onPress={() => onSelect(iso)}
              disabled={disabled}
              style={[s.cell, disabled && s.disabled]}
              accessibilityRole="button"
              accessibilityLabel={`${iso}${isToday ? ', today' : ''}${info.phase ? `, ${info.predicted ? 'predicted ' : ''}${info.phase}` : ''}${hasLog ? ', logged' : ''}`}
            >
              {inRange && !isSingleDayRange && (
                <View style={[s.rangeFill, iso === rangeStart && s.rangeFillStart, iso === rangeEnd && s.rangeFillEnd]} />
              )}
              <View style={[s.ring, isSel && { borderColor: cal.ring }]}>
                <View
                  style={[
                    s.dayCircle,
                    tint && !predictedPeriod && { backgroundColor: tint },
                    predictedPeriod && { borderWidth: 1.5, borderStyle: 'dashed', borderColor: cal.period },
                    isRangeEdge && { backgroundColor: colors.primary, borderWidth: 0 },
                  ]}
                >
                  <Text
                    style={[
                      s.dayText,
                      info.phase && { color: colors.textPrimary, fontWeight: '600' },
                      isToday && { color: cal.today, fontWeight: '800' },
                      isRangeEdge && { color: colors.white, fontWeight: '700' },
                    ]}
                  >
                    {d}
                  </Text>
                  {hasLog && !isRangeEdge && <View style={[s.dot, { backgroundColor: cal.dot }]} />}
                </View>
              </View>
              {isToday && <Text style={[s.todayLabel, { color: cal.today }]}>Today</Text>}
              {info.marker && !isRangeMode && (
                <View style={[s.marker, { borderColor: info.marker === 'missed' ? cal.missed : cal.period }]} />
              )}
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    header: { flexDirection: 'row', marginBottom: 8 },
    dow: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '400', color: c.textFaint },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: { width: '14.28%', height: 52, alignItems: 'center' },
    disabled: { opacity: 0.35 },
    ring: {
      width: 42,
      height: 42,
      borderRadius: 21,
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCircle: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    dayText: { fontSize: 12, fontWeight: '400', color: c.textSecondary },
    dot: { position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: 2 },
    todayLabel: { position: 'absolute', bottom: 0, fontSize: 8.5, fontWeight: '700', letterSpacing: 0.3 },
    marker: {
      position: 'absolute',
      top: 2,
      right: '14%',
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 1.5,
      backgroundColor: c.surface,
    },
    rangeFill: { position: 'absolute', top: 0, height: 42, left: 0, right: 0, backgroundColor: c.primarySoft },
    rangeFillStart: { left: '50%', borderTopLeftRadius: 21, borderBottomLeftRadius: 21 },
    rangeFillEnd: { right: '50%', borderTopRightRadius: 21, borderBottomRightRadius: 21 },
  });
}
