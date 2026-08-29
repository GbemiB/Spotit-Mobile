import { View, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { useMemo, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { cycleDayOf, phaseFor, formatDisplayDate, toISO } from '../../shared/utils/cycle.js';
import { MONTHS, PHASE_NOTES, PHASE_LABELS } from '../../shared/constants/cycle.js';
import { MOODS, SYMPTOMS, SYMPTOM_CATEGORIES } from '../../shared/constants/options.js';
import { useTheme, phases, Text, TextInput, FONT } from '../../shared/styles/index.js';
import CalendarGrid from '../../components/calendar/CalendarGrid.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import * as logsApi from '../../shared/api/logs.js';
import * as cycleApi from '../../shared/api/cycle.js';
const MOOD_EMOJI = Object.fromEntries(MOODS.map(m => [m.id, m.emoji]));
const SYMPTOM_CATEGORY_BY_ID = Object.fromEntries(SYMPTOMS.map(s => [s.id, s.category]));
function toOptions(list, iconMap, key = 'icon') {
  return list.map(o => ({ id: o.id, label: o.label, [key]: iconMap[o.id] }));
}
function withCategory(list) {
  return list.map(o => ({ ...o, category: SYMPTOM_CATEGORY_BY_ID[o.id] || 'Other' }));
}
function groupByCategory(options) {
  const byCategory = {};
  options.forEach(o => {
    const cat = o.category || 'Other';
    (byCategory[cat] ||= []).push(o);
  });
  const known = SYMPTOM_CATEGORIES.filter(cat => byCategory[cat]?.length).map(cat => ({ category: cat, items: byCategory[cat] }));
  return byCategory.Other ? [...known, { category: 'Other', items: byCategory.Other }] : known;
}
const PHASE_KEYS = [
  { color: phases.period, label: PHASE_LABELS.period },
  { color: phases.fertile, label: PHASE_LABELS.fertile },
  { color: phases.ovulation, label: PHASE_LABELS.ovulation },
];
function SectionLabel({ children, s }) {
  return <Text style={s.secLabel}>{children}</Text>;
}
function ChipGroup({ label, items, selected, onSelect, multiSelect = false, shape = 'pill', s }) {
  return (
    <View style={s.section}>
      <SectionLabel s={s}>{label}</SectionLabel>
      <View style={s.chipRow}>
        {items.map(item => {
          const sel = multiSelect ? selected?.includes(item.id) : selected === item.id;
          const icon = item.emoji || item.icon;
          return (
            <Pressable key={item.id} onPress={() => onSelect(item.id)} style={[shape === 'rect' ? s.chipRect : s.chip, sel && s.chipSel]}>
              {icon ? <Text style={shape === 'rect' ? s.chipRectEmoji : s.chipEmoji}>{icon}</Text> : null}
              <Text
                style={[shape === 'rect' ? s.chipRectTx : s.chipTx, sel && s.chipTxSel]}
                numberOfLines={1}
                adjustsFontSizeToFit={shape === 'rect'}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
function SymptomPicker({ options, selected, onToggle, s }) {
  const groups = useMemo(() => groupByCategory(options), [options]);
  return (
    <View style={s.section}>
      <SectionLabel s={s}>Symptoms</SectionLabel>
      <View style={{ gap: 14 }}>
        {groups.map(g => (
          <View key={g.category}>
            <Text style={s.categoryLabel}>{g.category}</Text>
            <View style={s.chipRow}>
              {g.items.map(item => {
                const sel = selected.includes(item.id);
                return (
                  <Pressable key={item.id} onPress={() => onToggle(item.id)} style={[s.chip, sel && s.chipSel]}>
                    <Text style={[s.chipTx, sel && s.chipTxSel]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
function blankDraft(date) {
  return { date, mood: null, symptoms: [], notes: '', intimate: false };
}
function draftFrom(date, log) {
  return log
    ? {
        date,
        mood: log.mood || null,
        symptoms: log.symptoms ? [...log.symptoms] : [],
        notes: log.notes || '',
        intimate: log.intimate || false,
      }
    : blankDraft(date);
}
export default function CalendarScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { viewYear, viewMonth, selDate, logs, cycleLength, periodLength, lastPeriodDate, accessToken, calendarPhases } = state;
  const insets = useSafeAreaInsets();
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [moodOptions, setMoodOptions] = useState(() => toOptions(MOODS, MOOD_EMOJI, 'emoji'));
  const [symptomOptions, setSymptomOptions] = useState(SYMPTOMS);
  const cycleState = { lastPeriodDate, cycleLength, periodLength };
  const selLog = logs[selDate];
  const selCycleDay = cycleDayOf(selDate, lastPeriodDate, cycleLength);
  const selPhaseKey = calendarPhases[selDate] ?? phaseFor(selCycleDay, periodLength, cycleLength).key;
  const selPhase = {
    key: selPhaseKey,
    label: selPhaseKey ? PHASE_LABELS[selPhaseKey] : lastPeriodDate ? 'Not tracked' : 'No data yet',
    color: selPhaseKey ? phases[selPhaseKey] : null,
  };
  const isPeriodDay = selPhaseKey === 'period';
  const [formDraft, setFormDraft] = useState(() => draftFrom(selDate, logs[selDate]));
  const activeDraft = formDraft.date === selDate ? formDraft : draftFrom(selDate, selLog);
  function updateDraft(patch) {
    setFormDraft({ ...activeDraft, ...patch });
  }
  useEffect(() => {
    logsApi
      .getTemplate(accessToken)
      .then(data => {
        if (data?.mood?.length) setMoodOptions(toOptions(data.mood, MOOD_EMOJI, 'emoji'));
        if (data?.symptoms?.length) setSymptomOptions(withCategory(data.symptoms));
      })
      .catch(() => {});
  }, []);
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
  async function handleSaveLog() {
    if (saving) return;
    setError('');
    setSaving(true);
    try {
      const data = await logsApi.saveLog(selDate, activeDraft, accessToken);
      dispatch({
        type: A.SAVE_LOG,
        date: selDate,
        entry: { flow: data.flow, mood: data.mood, symptoms: data.symptoms, notes: data.notes, intimate: data.intimate },
        pointsAwarded: data.pointsAwarded,
        newBalance: data.newBalance,
        streak: data.streak,
        isNewEntry: data.isNewEntry,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
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
        <Text style={s.screenSub}>Tap any day to see it, or log symptoms for a period day.</Text>

        <View style={s.phaseKeyWrap}>
          {PHASE_KEYS.map(p => (
            <View key={p.label} style={s.phaseKeyItem}>
              <View style={[s.phaseKeyDot, { backgroundColor: p.color }]} />
              <Text style={s.phaseKeyLabel}>{p.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Card style={s.gridCard}>
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              selDate={selDate}
              logs={logs}
              cycleState={cycleState}
              phaseByDate={calendarPhases}
              onSelect={d => {
                setFormDraft(draftFrom(d, logs[d]));
                dispatch({ type: A.SEL_DATE, date: d });
              }}
            />
          </Card>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          <Card style={{ padding: 18, marginBottom: 14, borderRadius: 22 }}>
            <Text style={s.selDateLabel}>{formatDisplayDate(selDate).toUpperCase()}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8 }}>
              <View style={[s.phaseDot, { backgroundColor: selPhase.color }]} />
              <Text style={s.selPhaseName}>{selPhase.label}</Text>
              {selCycleDay != null && <Text style={s.cdTx}>Cycle day {selCycleDay}</Text>}
            </View>
            <Text style={s.phaseNote}>
              {selPhase.key
                ? PHASE_NOTES[selPhase.key]
                : lastPeriodDate
                  ? 'This day falls outside the period, fertile, and ovulation windows we track.'
                  : 'Log your last period to see cycle phases here.'}
            </Text>
          </Card>

          {isPeriodDay ? (
            <Card style={{ padding: 18, marginBottom: 14 }}>
              <Text style={s.logHeading}>{selLog ? 'Your log' : 'Log this day'}</Text>
              {selLog?.flow && (
                <View style={[s.logRow, { marginBottom: 16 }]}>
                  <Text style={s.logKey}>Flow</Text>
                  <Text style={s.logVal}>{selLog.flow}</Text>
                </View>
              )}

              <ChipGroup
                label="Mood"
                items={moodOptions}
                selected={activeDraft.mood}
                onSelect={id => updateDraft({ mood: id })}
                shape="rect"
                s={s}
              />
              <SymptomPicker
                options={symptomOptions}
                selected={activeDraft.symptoms}
                onToggle={id =>
                  updateDraft({
                    symptoms: activeDraft.symptoms.includes(id)
                      ? activeDraft.symptoms.filter(x => x !== id)
                      : [...activeDraft.symptoms, id],
                  })
                }
                s={s}
              />

              <View style={[s.section, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                <SectionLabel s={s}>Intimate activity</SectionLabel>
                <Toggle value={activeDraft.intimate} onChange={v => updateDraft({ intimate: v })} />
              </View>

              <View style={s.section}>
                <SectionLabel s={s}>Notes</SectionLabel>
                <TextInput
                  value={activeDraft.notes}
                  onChangeText={v => updateDraft({ notes: v })}
                  placeholder="How are you feeling today?"
                  placeholderTextColor={colors.textFaint}
                  multiline
                  numberOfLines={3}
                  style={s.notesInput}
                  textAlignVertical="top"
                />
              </View>

              {error ? <Text style={s.errorTx}>{error}</Text> : null}

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                {selLog && (
                  <View style={{ flex: 1 }}>
                    <Button variant="danger" onPress={handleDelete} disabled={deleting}>
                      {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                  </View>
                )}
                <View style={{ flex: selLog ? 2 : 1 }}>
                  <Button onPress={handleSaveLog} disabled={saving}>
                    {saving ? 'Saving…' : 'Save entry →'}
                  </Button>
                </View>
              </View>
            </Card>
          ) : null}
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
    section: { marginBottom: 20 },
    secLabel: { fontSize: 11, fontWeight: '700', color: c.textSecondary, marginBottom: 10 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 13,
      paddingVertical: 9,
      borderRadius: 99,
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
    },
    chipRect: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      paddingVertical: 9,
      borderRadius: 16,
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
      flexBasis: '22%',
      flexGrow: 1,
    },
    chipSel: { backgroundColor: c.primarySoft, borderColor: c.primary },
    chipEmoji: { fontSize: 12 },
    chipRectEmoji: { fontSize: 20 },
    chipTx: { fontSize: 11, fontWeight: '600', color: c.textSecondary },
    chipRectTx: { fontSize: 8, fontWeight: '600', color: c.textSecondary, marginTop: 3, textAlign: 'center' },
    chipTxSel: { color: c.primaryDark },
    notesInput: {
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: 16,
      padding: 14,
      fontSize: 12,
      color: c.textPrimary,
      minHeight: 80,
    },
    errorTx: { fontSize: 11, color: c.error, fontWeight: '600', marginTop: 4, marginBottom: 12, textAlign: 'center' },
    categoryLabel: {
      fontSize: 9.5,
      fontWeight: '700',
      color: c.textFaint,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 8,
    },
  });
}
