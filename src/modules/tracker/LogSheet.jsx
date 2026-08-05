import { View, Pressable, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { FLOW, MOODS, SYMPTOMS, SYMPTOM_CATEGORIES } from '../../shared/constants/options.js';
import { addDays, datesBetween, formatDisplayDate, todayISO } from '../../shared/utils/cycle.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
import Button from '../../components/ui/Button.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import * as logsApi from '../../shared/api/logs.js';

// Icons/emoji aren't part of the backend's log template (that's presentation, not data) —
// map the returned ids back to the icon/emoji FLOW/MOODS already define locally.
const FLOW_ICONS = Object.fromEntries(FLOW.map(f => [f.id, f.icon]));
const MOOD_EMOJI = Object.fromEntries(MOODS.map(m => [m.id, m.emoji]));
// `category` is presentation-only (the backend's symptom list is just id+label) — tag the
// server-returned options using the same grouping SYMPTOMS defines locally.
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

// Grouped by body area (Head, Body, Pelvis, Fluid, Skin, Mood) so a long symptom list stays
// scannable — plain multi-select chips, same interaction as Mood, just sectioned.
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

function FlowPicker({ value, onChange, options, s }) {
  return (
    <View style={s.section}>
      <SectionLabel s={s}>Flow</SectionLabel>
      <View style={s.flowRow}>
        {options.map(f => {
          const sel = value === f.id;
          return (
            <Pressable key={f.id} onPress={() => onChange(f.id)} style={[s.flowChip, sel && s.chipSel]}>
              <Text style={s.flowIcon}>{f.icon}</Text>
              <Text style={[s.chipRectTx, sel && s.chipTxSel]} numberOfLines={1} adjustsFontSizeToFit>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const MIN_PERIOD_DAYS = 1;
const MAX_PERIOD_DAYS = 14;

// Shown once the "start of my period" toggle is on — lets the auto-suggested end date
// (from the user's periodLength default) be nudged without opening a full date picker.
function PeriodLengthStepper({ days, endDate, onChange, s }) {
  return (
    <View style={s.periodStepperRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.stepperLabel}>Period length</Text>
        <Text style={s.stepperHint}>Ends {formatDisplayDate(endDate)} · editable</Text>
      </View>
      <View style={s.stepperControls}>
        <Pressable onPress={() => onChange(Math.max(MIN_PERIOD_DAYS, days - 1))} style={s.stepperBtn} hitSlop={8}>
          <Text style={s.stepperBtnTx}>–</Text>
        </Pressable>
        <Text style={s.stepperValue}>{days}d</Text>
        <Pressable onPress={() => onChange(Math.min(MAX_PERIOD_DAYS, days + 1))} style={s.stepperBtn} hitSlop={8}>
          <Text style={s.stepperBtnTx}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function LogSheet() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { logOpen, logEditDate, draftLog, logs, periodLength, accessToken } = state;
  const date = logEditDate || todayISO();
  const dateLabel = logEditDate ? formatDisplayDate(logEditDate) : 'Today';

  const [flowOptions, setFlowOptions] = useState(() => toOptions(FLOW, FLOW_ICONS));
  const [moodOptions, setMoodOptions] = useState(() => toOptions(MOODS, MOOD_EMOJI, 'emoji'));
  const [symptomOptions, setSymptomOptions] = useState(SYMPTOMS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Pre-checked from a heuristic (flow set, not spotting, previous day unlogged) but always
  // user-overridable — a silent inference alone would mis-set lastPeriodDate off mid-cycle
  // spotting or out-of-order retroactive logging, so this toggle is the actual trigger.
  const prevDayLogged = !!logs[addDays(date, -1)]?.flow;
  const heuristicPeriodStart = !!draftLog.flow && draftLog.flow !== 'spotting' && !prevDayLogged;

  // Keyed by `date` and derived during render (rather than reset via an effect) — a stale
  // draft (left over from a previously-open date) is discarded the moment `date` changes.
  const [periodDraft, setPeriodDraft] = useState({ date, override: null, days: periodLength || 5 });
  const activePeriodDraft = periodDraft.date === date ? periodDraft : { date, override: null, days: periodLength || 5 };
  const periodStart = !!draftLog.flow && (activePeriodDraft.override ?? heuristicPeriodStart);
  const periodDays = activePeriodDraft.days;
  const periodEndDate = addDays(date, periodDays - 1);

  function setPeriodStartOverride(override) {
    setPeriodDraft({ ...activePeriodDraft, override });
  }
  function setPeriodDays(days) {
    setPeriodDraft({ ...activePeriodDraft, days });
  }

  // The log template is what this sheet calls first to render flow/mood/symptom options —
  // falls back to the local constants on failure so logging never blocks.
  useEffect(() => {
    logsApi
      .getTemplate(accessToken)
      .then(data => {
        if (data?.flow?.length) setFlowOptions(toOptions(data.flow, FLOW_ICONS));
        if (data?.mood?.length) setMoodOptions(toOptions(data.mood, MOOD_EMOJI, 'emoji'));
        if (data?.symptoms?.length) setSymptomOptions(withCategory(data.symptoms));
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    if (saving) return;
    setError('');
    setSaving(true);
    try {
      if (periodStart) {
        const data = await logsApi.saveLogPeriod({ startDate: date, endDate: periodEndDate, ...draftLog }, accessToken);
        dispatch({
          type: A.SAVE_LOG_PERIOD,
          dates: datesBetween(date, periodEndDate),
          date,
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
        });
      } else {
        const data = await logsApi.saveLog(date, draftLog, accessToken);
        dispatch({
          type: A.SAVE_LOG,
          date,
          entry: { flow: data.flow, mood: data.mood, symptoms: data.symptoms, notes: data.notes, intimate: data.intimate },
          pointsAwarded: data.pointsAwarded,
          newBalance: data.newBalance,
          streak: data.streak,
          isNewEntry: data.isNewEntry,
        });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet open={logOpen} onClose={() => dispatch({ type: A.CLOSE_LOG })} title={`Log for ${dateLabel}`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View>
          <FlowPicker value={draftLog.flow} onChange={id => dispatch({ type: A.SET_DRAFT_FLOW, id })} options={flowOptions} s={s} />

          {!!draftLog.flow && (
            <View style={s.section}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <SectionLabel s={s}>This is the start of my period</SectionLabel>
                <Toggle value={periodStart} onChange={setPeriodStartOverride} />
              </View>
              {periodStart && <PeriodLengthStepper days={periodDays} endDate={periodEndDate} onChange={setPeriodDays} s={s} />}
            </View>
          )}

          <ChipGroup
            label="Mood"
            items={moodOptions}
            selected={draftLog.mood}
            onSelect={id => dispatch({ type: A.SET_DRAFT_MOOD, id })}
            shape="rect"
            s={s}
          />
          <SymptomPicker
            options={symptomOptions}
            selected={draftLog.symptoms}
            onToggle={id => dispatch({ type: A.TOGGLE_DRAFT_SYM, id })}
            s={s}
          />

          {/* Intimate */}
          <View style={[s.section, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
            <SectionLabel s={s}>Intimate activity</SectionLabel>
            <Toggle value={draftLog.intimate} onChange={v => dispatch({ type: A.SET_DRAFT_INTIMATE, value: v })} />
          </View>

          {/* Notes */}
          <View style={s.section}>
            <SectionLabel s={s}>Notes</SectionLabel>
            <TextInput
              value={draftLog.notes}
              onChangeText={v => dispatch({ type: A.SET_DRAFT_NOTES, value: v })}
              placeholder="How are you feeling today?"
              placeholderTextColor={colors.textFaint}
              multiline
              numberOfLines={3}
              style={s.notesInput}
              textAlignVertical="top"
            />
          </View>

          {error ? <Text style={s.errorTx}>{error}</Text> : null}
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 10, paddingTop: 12 }}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" onPress={() => dispatch({ type: A.CLOSE_LOG })} disabled={saving}>
              Cancel
            </Button>
          </View>
          <View style={{ flex: 2 }}>
            <Button onPress={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save entry →'}
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

function createStyles(c) {
  return StyleSheet.create({
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
    flowRow: { flexDirection: 'row', gap: 8 },
    flowChip: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 2,
      paddingVertical: 9,
      borderRadius: 16,
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
    },
    flowIcon: { fontSize: 14 },
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
    errorTx: { fontSize: 11, color: c.error, fontWeight: '600', marginTop: 4, textAlign: 'center' },
    periodStepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 12,
      padding: 12,
      borderRadius: 16,
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
    },
    stepperLabel: { fontSize: 11, fontWeight: '600', color: c.textPrimary },
    stepperHint: { fontSize: 10, color: c.textMuted, marginTop: 2 },
    stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    stepperBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.primarySoft,
    },
    stepperBtnTx: { fontSize: 16, fontWeight: '700', color: c.primaryDark },
    stepperValue: { fontSize: 12, fontWeight: '700', color: c.textPrimary, minWidth: 26, textAlign: 'center' },
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
