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
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={[s.chip, shape === 'rect' && s.chipRect, sel && s.chipSel]}
            >
              {(item.emoji || item.icon) ? <Text style={s.chipEmoji}>{item.emoji || item.icon}</Text> : null}
              <Text style={[s.chipTx, sel && s.chipTxSel]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function FlowPicker({ value, onChange, colors, s }) {
  const dots = { spotting: 1, light: 2, medium: 3, heavy: 4, vheavy: 5 };
  return (
    <View style={s.section}>
      <SectionLabel s={s}>Flow</SectionLabel>
      <View style={s.chipRow}>
        {FLOW.map(f => {
          const sel = value === f.id;
          const count = dots[f.id] || 1;
          return (
            <Pressable key={f.id} onPress={() => onChange(f.id)} style={[s.flowChip, sel && s.chipSel]}>
              <View style={s.flowDots}>
                {Array.from({ length: count }).map((_, i) => (
                  <View key={i} style={[s.flowDot, { backgroundColor: sel ? colors.primary : colors.border }]} />
                ))}
              </View>
              <Text style={[s.chipTx, { fontSize: 11, marginTop: 5 }, sel && s.chipTxSel]}>{f.label}</Text>
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
            colors={colors}
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
    secLabel: { fontSize: 13, fontWeight: '700', color: c.textSecondary, marginBottom: 10 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 9, borderRadius: 99, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border },
    chipRect: { borderRadius: 16, flexBasis: '22%', flexGrow: 1, justifyContent: 'center' },
    chipSel: { backgroundColor: c.primarySoft, borderColor: c.primary },
    chipEmoji: { fontSize: 14 },
    chipTx: { fontSize: 13, fontWeight: '600', color: c.textSecondary },
    chipTxSel: { color: c.primaryDark },
    flowChip: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 9, borderRadius: 16, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border, minWidth: 56 },
    flowDots: { flexDirection: 'row', gap: 2, flexWrap: 'wrap', justifyContent: 'center', width: 36 },
    flowDot: { width: 7, height: 7, borderRadius: 4 },
    notesInput: { backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border, borderRadius: 16, padding: 14, fontSize: 14, color: c.textPrimary, minHeight: 80 },
  });
}
