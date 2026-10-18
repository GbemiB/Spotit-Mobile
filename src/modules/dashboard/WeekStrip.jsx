import { View, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { useMemo, useEffect, useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { addDays, cycleDayOf, calendarDay, todayISO } from '../../shared/utils/cycle.js';
import { useTheme, phases, Text } from '../../shared/styles/index.js';
import * as logsApi from '../../shared/api/logs.js';
import { useAnimatedValue, useReduceMotion } from './HeroCardFx.jsx';

function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function hasContent(entry) {
  return !!entry && (!!entry.flow || !!entry.mood || entry.symptoms?.length > 0 || !!entry.notes?.trim() || !!entry.intimate);
}

function DayCell({ day, index, selected, onPress, colors, s, reduceMotion }) {
  const enter = useAnimatedValue(reduceMotion ? 1 : 0);
  const ring = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) {
      enter.setValue(1);
      return undefined;
    }
    const anim = Animated.timing(enter, {
      toValue: 1,
      duration: 600,
      delay: 600 + index * 70,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, index, enter]);
  useEffect(() => {
    if (reduceMotion || !day.isToday) return undefined;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(ring, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(ring, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, day.isToday, ring]);

  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1 }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${day.dow} ${day.date.getDate()}${day.logged ? ', logged' : ''}${day.isToday ? ', today' : ''}`}
    >
      <Animated.View
        style={[
          s.cell,
          day.isToday && { backgroundColor: colors.primarySoft, borderColor: colors.primarySoftBorder },
          selected && !day.isToday && { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          {
            opacity: enter,
            transform: [
              { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
              { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
            ],
          },
        ]}
      >
        {day.isToday && !reduceMotion && (
          <Animated.View
            pointerEvents="none"
            style={[
              s.todayRing,
              {
                borderColor: colors.primary,
                opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0.3] }),
                transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
              },
            ]}
          />
        )}
        <Text style={s.dow}>{day.dow}</Text>
        {day.logged ? (
          <View style={[s.circle, { backgroundColor: colors.primary }]}>
            <Svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Path d="M5 12.5l4.5 4.5L19 7.5" />
            </Svg>
          </View>
        ) : (
          <View style={[s.circle, { backgroundColor: day.isToday ? colors.surface : colors.surfaceAlt }]}>
            <Text style={s.num}>{day.date.getDate()}</Text>
          </View>
        )}
        <View style={[s.dot, { backgroundColor: day.phaseColor || colors.border }]} />
      </Animated.View>
    </Pressable>
  );
}

export default function WeekStrip() {
  const { state, dispatch } = useApp();
  const { logs, lastPeriodDate, trackingStartDate, cycleLength, periodLength, calendarPhases, accessToken, viewMonth, viewYear } = state;
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const reduceMotion = useReduceMotion();
  const today = todayISO();
  const [selIndex, setSelIndex] = useState(3);
  const detail = useAnimatedValue(1);

  useEffect(() => {
    const from = addDays(today, -3);
    const to = addDays(today, 3);
    logsApi
      .getLogsInRange({ from, to }, accessToken)
      .then(data => dispatch({ type: A.LOGS_HYDRATED, from, to, logs: data.logs || {} }))
      .catch(() => {});
  }, [today, accessToken, dispatch]);

  const days = useMemo(
    () =>
      [-3, -2, -1, 0, 1, 2, 3].map(offset => {
        const iso = addDays(today, offset);
        const date = parseISO(iso);
        const cycleDay = cycleDayOf(iso, lastPeriodDate, cycleLength);
        const phaseKey = (
          calendarPhases?.[iso] ??
          calendarDay(iso, { lastPeriodDate, cycleLength, periodLength, trackingStart: trackingStartDate, logs, todayIso: today })
        ).phase;
        return {
          iso,
          date,
          offset,
          isToday: offset === 0,
          dow: date.toLocaleDateString('en-GB', { weekday: 'short' }),
          cycleDay,
          phaseKey,
          phaseColor: phaseKey ? phases[phaseKey] : null,
          logged: hasContent(logs?.[iso]),
        };
      }),
    [today, logs, lastPeriodDate, trackingStartDate, cycleLength, periodLength, calendarPhases],
  );
  const loggedCount = days.filter(d => d.logged).length;
  const sel = days[selIndex];
  const canLog = !sel.logged && sel.offset <= 0 && sel.phaseKey === 'period';
  const detailText = sel.logged
    ? `Logged${sel.cycleDay ? ` · cycle day ${sel.cycleDay}` : ''}`
    : sel.offset > 0
      ? `Coming up${sel.cycleDay ? ` · cycle day ${sel.cycleDay}` : ''}`
      : 'Nothing logged yet';

  function pick(i) {
    setSelIndex(i);
    if (reduceMotion) return;
    detail.setValue(0);
    Animated.timing(detail, { toValue: 1, duration: 350, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }).start();
  }

  function openInCalendar() {
    const target = sel.date;
    let months = (target.getFullYear() - viewYear) * 12 + (target.getMonth() - viewMonth);
    while (months < 0) {
      dispatch({ type: A.PREV_MONTH });
      months += 1;
    }
    while (months > 0) {
      dispatch({ type: A.NEXT_MONTH });
      months -= 1;
    }
    dispatch({ type: A.SEL_DATE, date: sel.iso });
    dispatch({ type: A.GO, screen: 'cal' });
  }

  return (
    <View style={s.card}>
      <View style={s.headRow}>
        <Text style={s.title}>This week</Text>
        <Text style={s.count}>{loggedCount} of 7 days logged</Text>
      </View>
      <View style={s.grid}>
        {days.map((d, i) => (
          <DayCell
            key={d.iso}
            day={d}
            index={i}
            selected={i === selIndex}
            onPress={() => pick(i)}
            colors={colors}
            s={s}
            reduceMotion={reduceMotion}
          />
        ))}
      </View>
      <Animated.View
        style={[
          s.detail,
          { opacity: detail, transform: [{ translateY: detail.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }] },
        ]}
      >
        <View style={s.detailLeft}>
          <View style={[s.detailDot, { backgroundColor: sel.phaseColor || colors.border }]} />
          <Text style={s.detailDay}>
            {sel.dow} {sel.date.getDate()} {sel.date.toLocaleDateString('en-GB', { month: 'short' })}
          </Text>
          <Text style={s.detailText}>· {detailText}</Text>
        </View>
        {canLog && (
          <Pressable onPress={openInCalendar} hitSlop={10} accessibilityRole="button" accessibilityLabel="Log this day in the calendar">
            <Text style={s.logLink}>Log</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    card: { borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, padding: 16 },
    headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
    title: { fontSize: 12.5, fontWeight: '700', color: c.textPrimary },
    count: { fontSize: 11, fontWeight: '600', color: c.textSecondary },
    grid: { flexDirection: 'row', gap: 6, marginTop: 12 },
    cell: { alignItems: 'center', gap: 6, paddingVertical: 8, borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent' },
    todayRing: { position: 'absolute', top: -1.5, left: -1.5, right: -1.5, bottom: -1.5, borderRadius: 14, borderWidth: 2 },
    dow: { fontSize: 10.5, fontWeight: '600', color: c.textSecondary },
    circle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    num: { fontSize: 10.5, fontWeight: '700', color: c.textSecondary },
    dot: { width: 6, height: 6, borderRadius: 3 },
    detail: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginTop: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: c.surfaceAlt,
    },
    detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
    detailDot: { width: 8, height: 8, borderRadius: 4 },
    detailDay: { fontSize: 10, fontWeight: '700', color: c.textPrimary },
    detailText: { fontSize: 10, color: c.textSecondary, flexShrink: 1 },
    logLink: { fontSize: 10, fontWeight: '700', color: c.primaryDark },
  });
}
