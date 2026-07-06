import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { cycleDayOf, phaseFor, formatDisplayDate } from '../../shared/utils/cycle.js';
import { MONTHS, PHASE_NOTES } from '../../shared/constants/cycle.js';
import { useTheme, phases, Text } from '../../shared/styles/index.js';
import CalendarGrid from '../../components/calendar/CalendarGrid.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';

const PHASE_KEYS = [
  { color: phases.period, label: 'Period' },
  { color: phases.fertile, label: 'Fertile' },
  { color: phases.ovulation, label: 'Ovulation' },
  { color: phases.luteal, label: 'Luteal' },
  { color: phases.follicular, label: 'Follicular' },
];

export default function CalendarScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { viewYear, viewMonth, selDate, logs, cycleLength, periodLength, lastPeriodDate } = state;
  const insets = useSafeAreaInsets();

  const cycleState = { lastPeriodDate, cycleLength, periodLength };
  const selLog = logs[selDate];
  const selCycleDay = cycleDayOf(selDate, lastPeriodDate, cycleLength);
  const selPhase = phaseFor(selCycleDay, periodLength, cycleLength);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.headerRow}>
          <Pressable onPress={() => dispatch({ type: A.PREV_MONTH })} style={s.navBtn}>
            <Text style={s.navArrow}>‹</Text>
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={s.monthTitle}>{MONTHS[viewMonth]}</Text>
            <Text style={s.yearSub}>{viewYear}</Text>
          </View>
          <Pressable onPress={() => dispatch({ type: A.NEXT_MONTH })} style={s.navBtn}>
            <Text style={s.navArrow}>›</Text>
          </Pressable>
        </View>

        {/* Phase key */}
        <View style={s.phaseKeyWrap}>
          {PHASE_KEYS.map(p => (
            <View key={p.label} style={s.phaseKeyItem}>
              <View style={[s.phaseKeyDot, { backgroundColor: p.color }]} />
              <Text style={s.phaseKeyLabel}>{p.label}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Card style={{ padding: 14 }}>
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              selDate={selDate}
              logs={logs}
              cycleState={cycleState}
              onSelect={d => dispatch({ type: A.SEL_DATE, date: d })}
            />
          </Card>
        </View>

        {/* Selected day */}
        <View style={{ paddingHorizontal: 24 }}>
          <Text style={s.dateHeading}>{formatDisplayDate(selDate)}</Text>

          <Card style={{ padding: 18, marginTop: 10, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <View style={[s.phaseChip, { backgroundColor: selPhase.color + '18' }]}>
                <Text style={[s.phaseChipTx, { color: selPhase.color }]}>{selPhase.label}</Text>
              </View>
              <Text style={s.cdTx}>Day {selCycleDay}</Text>
            </View>
            <Text style={s.phaseNote}>{PHASE_NOTES[selPhase.key]}</Text>
          </Card>

          {selLog ? (
            <Card style={{ padding: 18, marginBottom: 14 }}>
              <Text style={s.logHeading}>Your log</Text>
              {selLog.flow && (
                <View style={s.logRow}>
                  <Text style={s.logKey}>Flow</Text>
                  <Text style={s.logVal}>{selLog.flow}</Text>
                </View>
              )}
              {selLog.mood && (
                <View style={s.logRow}>
                  <Text style={s.logKey}>Mood</Text>
                  <Text style={s.logVal}>{selLog.mood}</Text>
                </View>
              )}
              {selLog.symptoms?.length > 0 && (
                <View style={s.logRow}>
                  <Text style={s.logKey}>Symptoms</Text>
                  <Text style={[s.logVal, { flex: 1, textAlign: 'right' }]}>{selLog.symptoms.join(', ')}</Text>
                </View>
              )}
              {selLog.notes ? (
                <View style={[s.logRow, { borderBottomWidth: 0 }]}>
                  <Text style={s.logKey}>Notes</Text>
                  <Text style={[s.logVal, { flex: 1, textAlign: 'right' }]}>{selLog.notes}</Text>
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <View style={{ flex: 1 }}>
                  <Button variant="secondary" onPress={() => dispatch({ type: A.OPEN_LOG, date: selDate })}>Edit</Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Button variant="danger" onPress={() => dispatch({ type: A.DELETE_LOG, date: selDate })}>Delete</Button>
                </View>
              </View>
            </Card>
          ) : (
            <Button onPress={() => dispatch({ type: A.OPEN_LOG, date: selDate })}>
              + Log this day
            </Button>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 },
    navBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border, borderRadius: 14 },
    navArrow: { fontSize: 12, color: c.primary, fontWeight: '400', lineHeight: 28 },
    monthTitle: { fontSize: 18, fontWeight: '800', color: c.textPrimary, letterSpacing: -0.5 },
    yearSub: { fontSize: 12, color: c.textMuted, fontWeight: '600', marginTop: 1 },
    phaseKeyWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 24, marginBottom: 16 },
    phaseKeyItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    phaseKeyDot: { width: 8, height: 8, borderRadius: 4 },
    phaseKeyLabel: { fontSize: 10, color: c.textMuted, fontWeight: '600' },
    dateHeading: { fontSize: 12, fontWeight: '700', color: c.textPrimary, letterSpacing: -0.3 },
    phaseChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 },
    phaseChipTx: { fontSize: 12, fontWeight: '700' },
    cdTx: { fontSize: 10, color: c.textMuted, fontWeight: '600' },
    phaseNote: { fontSize: 14, color: c.textSecondary, lineHeight: 21 },
    logHeading: { fontSize: 12, fontWeight: '700', color: c.textSecondary, marginBottom: 12 },
    logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border },
    logKey: { fontSize: 12, color: c.textMuted, fontWeight: '600' },
    logVal: { fontSize: 12, color: c.textPrimary, fontWeight: '600', textTransform: 'capitalize' },
  });
}
