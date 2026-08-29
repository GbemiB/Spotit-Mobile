import { View, Pressable, StyleSheet } from 'react-native';
import { useMemo, useState } from 'react';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { MONTHS } from '../../shared/constants/cycle.js';
import { addDays, cycleDayOf, datesBetween, formatDisplayDate, phaseFor, todayISO } from '../../shared/utils/cycle.js';
import { useTheme, Text } from '../../shared/styles/index.js';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
import Button from '../../components/ui/Button.jsx';
import CalendarGrid from '../../components/calendar/CalendarGrid.jsx';
import * as logsApi from '../../shared/api/logs.js';
const DEFAULT_FLOW = 'medium';
export default function PeriodPickerSheet() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { lastPeriodDate, cycleLength, periodLength, cycleStatus, logs, accessToken } = state;
  const today = todayISO();
  const phaseKey = cycleStatus?.phase ?? phaseFor(cycleDayOf(today, lastPeriodDate, cycleLength), periodLength, cycleLength).key;
  const ongoing = phaseKey === 'period';
  const defaultStart = lastPeriodDate || today;
  const defaultEnd = lastPeriodDate ? addDays(lastPeriodDate, periodLength - 1) : addDays(today, periodLength - 1);
  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);
  const [activeField, setActiveField] = useState('start');
  const initialAnchor = new Date(ongoing ? lastPeriodDate : today);
  const [viewYear, setViewYear] = useState(initialAnchor.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialAnchor.getMonth());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  function navigateMonth(delta) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }
  function jumpViewToDate(iso) {
    const d = new Date(iso);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }
  function handleDayTap(iso) {
    if (activeField === 'start') {
      setStart(iso);
      setEnd(addDays(iso, periodLength - 1));
      setActiveField('end');
      return;
    }
    if (iso < start) {
      setStart(iso);
      setEnd(addDays(iso, periodLength - 1));
    } else {
      setEnd(iso);
    }
  }
  function focusField(field) {
    setActiveField(field);
    jumpViewToDate(field === 'start' ? start : end);
  }
  function close() {
    dispatch({ type: A.CLOSE_PERIOD_PICKER });
  }
  async function handleSave() {
    if (!start || !end || saving) return;
    setError('');
    setSaving(true);
    try {
      const data = await logsApi.saveLogPeriod(
        { startDate: start, endDate: end, flow: DEFAULT_FLOW, mood: null, symptoms: [], notes: null, intimate: false },
        accessToken,
      );
      dispatch({
        type: A.SAVE_LOG_PERIOD,
        dates: datesBetween(start, end),
        date: start,
        flow: data.flow,
        entry: {
          flow: data.startDayEntry.flow,
          mood: data.startDayEntry.mood,
          symptoms: data.startDayEntry.symptoms,
          notes: data.startDayEntry.notes,
          intimate: data.startDayEntry.intimate,
        },
        lastPeriodDate: data.lastPeriodDate,
        pointsAwarded: data.pointsAwarded,
        newBalance: data.newBalance,
        streak: data.streak,
        clearedEntries: data.clearedEntries,
      });
      dispatch({ type: A.CLOSE_PERIOD_PICKER });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <BottomSheet open onClose={close} title="Log a period">
      <View>
        <Text style={s.subtitle}>
          {activeField === 'start'
            ? 'Tap the day your period starts.'
            : `Tap the day it ends — we've estimated ${formatDisplayDate(end)} from your usual length, but you can pick a different day, or tap Start to change it.`}
        </Text>

        <View style={s.datesRow}>
          <Pressable style={[s.dateBox, activeField === 'start' && s.dateBoxActive]} onPress={() => focusField('start')}>
            <Text style={[s.dateLabel, activeField === 'start' && s.dateLabelActive]}>Start</Text>
            <Text style={s.dateValue}>{formatDisplayDate(start)}</Text>
          </Pressable>
          <Text style={s.dateArrow}>→</Text>
          <Pressable style={[s.dateBox, activeField === 'end' && s.dateBoxActive]} onPress={() => focusField('end')}>
            <Text style={[s.dateLabel, activeField === 'end' && s.dateLabelActive]}>End</Text>
            <Text style={s.dateValue}>{formatDisplayDate(end)}</Text>
          </Pressable>
        </View>

        <View style={s.calNav}>
          <Pressable onPress={() => navigateMonth(-1)} hitSlop={8} style={s.calNavBtn}>
            <Text style={s.calNavArrow}>‹</Text>
          </Pressable>
          <Text style={s.calMonthLabel}>
            {MONTHS[viewMonth]} {viewYear}
          </Text>
          <Pressable onPress={() => navigateMonth(1)} hitSlop={8} style={s.calNavBtn}>
            <Text style={s.calNavArrow}>›</Text>
          </Pressable>
        </View>

        <CalendarGrid
          year={viewYear}
          month={viewMonth}
          logs={logs}
          cycleState={{ lastPeriodDate, cycleLength, periodLength }}
          rangeStart={start}
          rangeEnd={end}
          onSelect={handleDayTap}
        />

        {error ? <Text style={s.errorTx}>{error}</Text> : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 10, paddingTop: 16 }}>
        <View style={{ flex: 1 }}>
          <Button variant="secondary" onPress={close} disabled={saving}>
            Cancel
          </Button>
        </View>
        <View style={{ flex: 2 }}>
          <Button onPress={handleSave} disabled={saving || !start || !end}>
            {saving ? 'Saving…' : 'Save period →'}
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    subtitle: { fontSize: 11.5, color: c.textMuted, marginBottom: 16, lineHeight: 17 },
    datesRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
    dateBox: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
    },
    dateBoxActive: { borderColor: c.primary, backgroundColor: c.primarySoft },
    dateLabel: { fontSize: 9.5, fontWeight: '700', color: c.textFaint, textTransform: 'uppercase', letterSpacing: 0.5 },
    dateLabelActive: { color: c.primaryDark },
    dateValue: { fontSize: 12.5, fontWeight: '700', color: c.textPrimary, marginTop: 3 },
    dateArrow: { fontSize: 14, color: c.textFaint, fontWeight: '700' },
    calNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 10 },
    calNavBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface },
    calNavArrow: { fontSize: 14, fontWeight: '700', color: c.primaryDark },
    calMonthLabel: { fontSize: 11.5, fontWeight: '700', color: c.textPrimary, minWidth: 110, textAlign: 'center' },
    errorTx: { fontSize: 11, color: c.error, fontWeight: '600', marginTop: 12, textAlign: 'center' },
  });
}
