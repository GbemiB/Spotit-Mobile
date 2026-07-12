import { View, Pressable, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { FLOW, MOODS, SYMPTOMS } from '../../shared/constants/options.js';
import { formatDisplayDate, todayISO } from '../../shared/utils/cycle.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
import Button from '../../components/ui/Button.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import * as logsApi from '../../shared/api/logs.js';

// Icons/emoji aren't part of the backend's log template (that's presentation, not data) —
// map the returned ids back to the icon/emoji FLOW/MOODS already define locally.
const FLOW_ICONS = Object.fromEntries(FLOW.map(f => [f.id, f.icon]));
const MOOD_EMOJI = Object.fromEntries(MOODS.map(m => [m.id, m.emoji]));

function toOptions(list, iconMap, key = 'icon') {
  return list.map(o => ({ id: o.id, label: o.label, [key]: iconMap[o.id] }));
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
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={[shape === 'rect' ? s.chipRect : s.chip, sel && s.chipSel]}
            >
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
              <Text
                style={[s.chipRectTx, sel && s.chipTxSel]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function LogSheet() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { logOpen, logEditDate, draftLog, accessToken } = state;
  const date = logEditDate || todayISO();
  const dateLabel = logEditDate ? formatDisplayDate(logEditDate) : 'Today';

  const [flowOptions, setFlowOptions] = useState(() => toOptions(FLOW, FLOW_ICONS));
  const [moodOptions, setMoodOptions] = useState(() => toOptions(MOODS, MOOD_EMOJI, 'emoji'));
  const [symptomOptions, setSymptomOptions] = useState(SYMPTOMS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // The log template is what this sheet calls first to render flow/mood/symptom options —
  // falls back to the local constants on failure so logging never blocks.
  useEffect(() => {
    logsApi.getTemplate(accessToken)
      .then(data => {
        if (data?.flow?.length) setFlowOptions(toOptions(data.flow, FLOW_ICONS));
        if (data?.mood?.length) setMoodOptions(toOptions(data.mood, MOOD_EMOJI, 'emoji'));
        if (data?.symptoms?.length) setSymptomOptions(data.symptoms);
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    if (saving) return;
    setError('');
    setSaving(true);
    try {
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
          <FlowPicker
            value={draftLog.flow}
            onChange={id => dispatch({ type: A.SET_DRAFT_FLOW, id })}
            options={flowOptions}
            s={s}
          />
          <ChipGroup
            label="Mood"
            items={moodOptions}
            selected={draftLog.mood}
            onSelect={id => dispatch({ type: A.SET_DRAFT_MOOD, id })}
            shape="rect"
            s={s}
          />
          <ChipGroup
            label="Symptoms"
            items={symptomOptions}
            selected={draftLog.symptoms}
            onSelect={id => dispatch({ type: A.TOGGLE_DRAFT_SYM, id })}
            multiSelect
            s={s}
          />

          {/* Intimate */}
          <View style={[s.section, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
            <SectionLabel s={s}>Intimate activity</SectionLabel>
            <Toggle
              value={draftLog.intimate}
              onChange={v => dispatch({ type: A.SET_DRAFT_INTIMATE, value: v })}
            />
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
            <Button variant="secondary" onPress={() => dispatch({ type: A.CLOSE_LOG })} disabled={saving}>Cancel</Button>
          </View>
          <View style={{ flex: 2 }}>
            <Button onPress={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save entry →'}</Button>
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
    chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 99, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border },
    chipRect: {
      alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 4, paddingVertical: 9, borderRadius: 16,
      backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border,
      flexBasis: '22%', flexGrow: 1,
    },
    chipSel: { backgroundColor: c.primarySoft, borderColor: c.primary },
    chipEmoji: { fontSize: 12 },
    chipRectEmoji: { fontSize: 20 },
    chipTx: { fontSize: 11, fontWeight: '600', color: c.textSecondary },
    chipRectTx: { fontSize: 8, fontWeight: '600', color: c.textSecondary, marginTop: 3, textAlign: 'center' },
    chipTxSel: { color: c.primaryDark },
    flowRow: { flexDirection: 'row', gap: 8 },
    flowChip: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2, paddingVertical: 9, borderRadius: 16, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border },
    flowIcon: { fontSize: 14 },
    notesInput: { backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border, borderRadius: 16, padding: 14, fontSize: 12, color: c.textPrimary, minHeight: 80 },
    errorTx: { fontSize: 11, color: c.error, fontWeight: '600', marginTop: 4, textAlign: 'center' },
  });
}
