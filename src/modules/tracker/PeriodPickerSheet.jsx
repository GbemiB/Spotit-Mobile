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

// Every day marked here gets a flow default — this sheet only declares a period's date
// range, it never shows a per-day form. Actual flow/mood/symptom detail for a given day
// is edited afterward inline on the Calendar screen itself, restricted to days that fall
// inside a marked period.
const DEFAULT_FLOW = 'medium';

export default function PeriodPickerSheet() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { lastPeriodDate, cycleLength, periodLength, cycleStatus, logs, accessToken } = state;

  const today = todayISO();
  const phaseKey = cycleStatus?.phase ?? phaseFor(cycleDayOf(today, lastPeriodDate, cycleLength), periodLength, cycleLength).key;
  const ongoing = phaseKey === 'period';

  // Start/end are freely editable in either direction, any date — not locked to
  // lastPeriodDate. Seeded from the current period if one exists (so there's something to
  // correct rather than starting from scratch), otherwise from today.
  const defaultStart = lastPeriodDate || today;
  const defaultEnd = lastPeriodDate ? addDays(lastPeriodDate, periodLength - 1) : addDays(today, periodLength - 1);

  const [start, setStart] = useState(defaultStart);
  const [end, setEnd] = useState(defaultEnd);

  // The viewed month is its own independent state — changed only by the nav arrows or by
  // tapping the Start/End box to jump there, never recomputed from start/end on every render.
  // (Deriving it from start/end directly was an earlier bug: tapping a date changes start/end,
  // which would silently recompute the anchor month and jump the calendar away from the date
  // you just tapped.)
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

  // Every tap moves whichever boundary it's closer to — no separate "which one am I setting"
  // mode to discover first, so every tap visibly does something immediately. Tapping before the
  // current start extends it backward; tapping after the current end extends it forward; a tap
  // inside the range nudges whichever edge is nearer.
  function handleTap(iso) {
    const tapped = new Date(iso).getTime();
    const distToStart = Math.abs(tapped - new Date(start).getTime());
    const distToEnd = Math.abs(tapped - new Date(end).getTime());
    if (distToStart <= distToEnd) {
      setStart(iso);
      if (iso > end) setEnd(iso);
    } else {
      setEnd(iso);
      if (iso < start) setStart(iso);
    }
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
        accessToken
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
        <Text style={s.subtitle}>Tap any day to set the nearer boundary — before Start moves it back, after End moves it forward.</Text>

        <View style={s.datesRow}>
          <Pressable style={s.dateBox} onPress={() => jumpViewToDate(start)}>
            <Text style={s.dateLabel}>Start</Text>
            <Text style={s.dateValue}>{formatDisplayDate(start)}</Text>
          </Pressable>
          <Text style={s.dateArrow}>→</Text>
          <Pressable style={s.dateBox} onPress={() => jumpViewToDate(end)}>
            <Text style={s.dateLabel}>End</Text>
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
          onSelect={handleTap}
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
    dateLabel: { fontSize: 9.5, fontWeight: '700', color: c.textFaint, textTransform: 'uppercase', letterSpacing: 0.5 },
    dateValue: { fontSize: 12.5, fontWeight: '700', color: c.textPrimary, marginTop: 3 },
    dateArrow: { fontSize: 14, color: c.textFaint, fontWeight: '700' },
    calNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 10 },
    calNavBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface },
    calNavArrow: { fontSize: 14, fontWeight: '700', color: c.primaryDark },
    calMonthLabel: { fontSize: 11.5, fontWeight: '700', color: c.textPrimary, minWidth: 110, textAlign: 'center' },
    errorTx: { fontSize: 11, color: c.error, fontWeight: '600', marginTop: 12, textAlign: 'center' },
  });
}
