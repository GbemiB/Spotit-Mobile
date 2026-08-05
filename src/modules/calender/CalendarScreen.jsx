import { View, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { useMemo, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { cycleDayOf, phaseFor, formatDisplayDate, toISO } from '../../shared/utils/cycle.js';
import { MONTHS, PHASE_NOTES, PHASE_LABELS } from '../../shared/constants/cycle.js';
import { SYMPTOMS } from '../../shared/constants/options.js';
import { useTheme, phases, Text, FONT } from '../../shared/styles/index.js';
import CalendarGrid from '../../components/calendar/CalendarGrid.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import * as logsApi from '../../shared/api/logs.js';
import * as cycleApi from '../../shared/api/cycle.js';

const SYMPTOM_LABELS = Object.fromEntries(SYMPTOMS.map(s => [s.id, s.label]));

function symptomSummary(symptoms) {
  return symptoms.map(id => SYMPTOM_LABELS[id] || id).join(', ');
}

const PHASE_KEYS = [
  { color: phases.period, label: PHASE_LABELS.period },
  { color: phases.fertile, label: PHASE_LABELS.fertile },
  { color: phases.ovulation, label: PHASE_LABELS.ovulation },
  { color: phases.luteal, label: PHASE_LABELS.luteal },
  { color: phases.follicular, label: PHASE_LABELS.follicular },
];

export default function CalendarScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { viewYear, viewMonth, selDate, logs, cycleLength, periodLength, lastPeriodDate, accessToken, calendarPhases } = state;
  const insets = useSafeAreaInsets();
  const [deleting, setDeleting] = useState(false);

  const cycleState = { lastPeriodDate, cycleLength, periodLength };
  const selLog = logs[selDate];
  const selCycleDay = cycleDayOf(selDate, lastPeriodDate, cycleLength);
  // Prefer the server-computed phase for the selected day when we've already fetched its
  // month; falls back to the local calculation otherwise (same formula either way).
  const selPhaseKey = calendarPhases[selDate] ?? phaseFor(selCycleDay, periodLength, cycleLength).key;
  const selPhase = { key: selPhaseKey, label: PHASE_LABELS[selPhaseKey] || 'No data yet', color: phases[selPhaseKey] };

  // Pull this month's saved entries and phases from the server whenever the visible month
  // changes, so the grid and day card reflect real data instead of only local computation.
  useEffect(() => {
    const from = toISO(new Date(viewYear, viewMonth, 1));
    const to = toISO(new Date(viewYear, viewMonth + 1, 0));
    logsApi
      .getLogsInRange({ from, to }, accessToken)
      .then(data => dispatch({ type: A.LOGS_HYDRATED, logs: data.logs || {} }))
      .catch(() => {});
    cycleApi
      .getCalendar({ year: viewYear, month: viewMonth + 1 }, accessToken)
      .then(data => {
        const phasesByDate = {};
        (data.days || []).forEach(d => {
          phasesByDate[d.date] = d.phase;
        });
        dispatch({ type: A.CALENDAR_PHASES_HYDRATED, phases: phasesByDate });
      })
      .catch(() => {});
  }, [viewYear, viewMonth, lastPeriodDate]);

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await logsApi.deleteLog(selDate, accessToken);
      dispatch({ type: A.DELETE_LOG, date: selDate });
    } catch (e) {
      Alert.alert('Could not delete entry', e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.headerRow}>
          <Text style={s.screenTitle}>Calendar</Text>
          <View style={s.monthNav}>
            <Pressable onPress={() => dispatch({ type: A.PREV_MONTH })} style={s.navBtn}>
              <Text style={s.navArrow}>‹</Text>
            </Pressable>
            <Pressable onPress={() => dispatch({ type: A.NEXT_MONTH })} style={s.navBtn}>
              <Text style={s.navArrow}>›</Text>
            </Pressable>
            <Text style={s.monthTitle}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
          </View>
        </View>
        <Text style={s.screenSub}>Tap any day to see what you logged.</Text>

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
          <Card style={s.gridCard}>
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              selDate={selDate}
              logs={logs}
              cycleState={cycleState}
              phaseByDate={calendarPhases}
              onSelect={d => dispatch({ type: A.SEL_DATE, date: d })}
            />
          </Card>
        </View>

        {/* Selected day */}
        <View style={{ paddingHorizontal: 24 }}>
          <Card style={{ padding: 18, marginBottom: 14, borderRadius: 22 }}>
            <Text style={s.selDateLabel}>{formatDisplayDate(selDate).toUpperCase()}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8 }}>
              <View style={[s.phaseDot, { backgroundColor: selPhase.color }]} />
              <Text style={s.selPhaseName}>{selPhase.label}</Text>
              {selCycleDay != null && <Text style={s.cdTx}>Cycle day {selCycleDay}</Text>}
            </View>
            <Text style={s.phaseNote}>{selPhase.key ? PHASE_NOTES[selPhase.key] : 'Log your last period to see cycle phases here.'}</Text>
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
                  <Text style={[s.logVal, { flex: 1, textAlign: 'right' }]}>{symptomSummary(selLog.symptoms)}</Text>
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
                  <Button variant="secondary" onPress={() => dispatch({ type: A.OPEN_LOG, date: selDate })}>
                    Edit
                  </Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Button variant="danger" onPress={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting…' : 'Delete'}
                  </Button>
                </View>
              </View>
            </Card>
          ) : (
            <Button onPress={() => dispatch({ type: A.OPEN_LOG, date: selDate })}>+ Log this day</Button>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 20,
      marginBottom: 8,
    },
    screenTitle: { fontSize: 24, fontWeight: '700', color: c.textPrimary, letterSpacing: -0.4 },
    monthNav: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    navBtn: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
    navArrow: { fontSize: 14, color: c.primaryDark, fontWeight: '500', lineHeight: 20 },
    monthTitle: { fontSize: 12, fontWeight: '500', color: c.primaryDark },
    screenSub: { fontSize: 11.5, color: c.textMuted, paddingHorizontal: 24, marginBottom: 18 },
    gridCard: {
      padding: 14,
      borderRadius: 28,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 20,
      elevation: 2,
    },
    phaseKeyWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 24, marginTop: 18, marginBottom: 16 },
    phaseKeyItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    phaseKeyDot: { width: 12, height: 12, borderRadius: 6 },
    phaseKeyLabel: { fontSize: 10.5, color: c.textSecondary },
    selDateLabel: { fontSize: 10, color: c.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
    phaseDot: { width: 11, height: 11, borderRadius: 6 },
    selPhaseName: { fontFamily: FONT.serif, fontSize: 19, color: c.textPrimary },
    cdTx: { fontSize: 11, color: c.textMuted, marginLeft: 'auto' },
    phaseNote: { fontSize: 11, color: c.textSecondary, lineHeight: 20, marginTop: 8 },
    logHeading: { fontSize: 10, fontWeight: '600', color: c.textSecondary, marginBottom: 12 },
    logRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    logKey: { fontSize: 10, color: c.textMuted, fontWeight: '600' },
    logVal: { fontSize: 10, color: c.textPrimary, fontWeight: '600', textTransform: 'capitalize' },
  });
}
