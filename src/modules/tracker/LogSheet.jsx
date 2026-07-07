import { View, Pressable, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { FLOW, MOODS, SYMPTOMS } from '../../shared/constants/options.js';
import { formatDisplayDate } from '../../shared/utils/cycle.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
import Button from '../../components/ui/Button.jsx';
import Toggle from '../../components/ui/Toggle.jsx';

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

function FlowPicker({ value, onChange, s }) {
  return (
    <View style={s.section}>
      <SectionLabel s={s}>Flow</SectionLabel>
      <View style={s.flowRow}>
        {FLOW.map(f => {
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
  const { logOpen, logEditDate, draftLog } = state;
  const dateLabel = logEditDate ? formatDisplayDate(logEditDate) : 'Today';

  return (
    <BottomSheet open={logOpen} onClose={() => dispatch({ type: A.CLOSE_LOG })} title={`Log for ${dateLabel}`}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View>
          <FlowPicker
            value={draftLog.flow}
            onChange={id => dispatch({ type: A.SET_DRAFT_FLOW, id })}
            s={s}
          />
          <ChipGroup
            label="Mood"
            items={MOODS}
            selected={draftLog.mood}
            onSelect={id => dispatch({ type: A.SET_DRAFT_MOOD, id })}
            shape="rect"
            s={s}
          />
          <ChipGroup
            label="Symptoms"
            items={SYMPTOMS}
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
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 10, paddingTop: 12 }}>
          <View style={{ flex: 1 }}>
            <Button variant="secondary" onPress={() => dispatch({ type: A.CLOSE_LOG })}>Cancel</Button>
          </View>
          <View style={{ flex: 2 }}>
            <Button onPress={() => dispatch({ type: A.SAVE_LOG })}>Save entry →</Button>
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
  });
}
