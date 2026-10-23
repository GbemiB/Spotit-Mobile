import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useTheme, Text } from '../../shared/styles/index.js';
import Card from '../../components/ui/Card.jsx';
import { dayLogRows } from '../../shared/utils/partner.js';
export default function PartnerDayLog({ log, name }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const rows = dayLogRows(log);
  if (!rows) return null;
  return (
    <Card style={s.card}>
      <Text style={s.heading}>{`${name}’s log`}</Text>
      {rows.flow ? <Row label="Flow" value={rows.flow} s={s} /> : null}
      {rows.mood ? <Row label="Mood" value={rows.mood} s={s} /> : null}
      {rows.symptoms.length > 0 ? (
        <View style={s.block}>
          <Text style={s.key}>Symptoms</Text>
          <View style={s.chips}>
            {rows.symptoms.map(label => (
              <View key={label} style={[s.chip, { backgroundColor: colors.primarySoft }]}>
                <Text style={[s.chipTx, { color: colors.primaryDark }]}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
      {rows.intimate ? <Row label="Intimate activity" value="Yes" s={s} /> : null}
      {rows.notes ? (
        <View style={s.block}>
          <Text style={s.key}>Notes</Text>
          <Text style={s.notes}>{rows.notes}</Text>
        </View>
      ) : null}
    </Card>
  );
}
function Row({ label, value, s }) {
  return (
    <View style={s.row}>
      <Text style={s.key}>{label}</Text>
      <Text style={s.val}>{value}</Text>
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    card: { padding: 18, marginBottom: 14, gap: 12 },
    heading: { fontSize: 12.5, fontWeight: '700', color: c.textPrimary },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    block: { gap: 8 },
    key: { fontSize: 10.5, fontWeight: '600', color: c.textMuted },
    val: { fontSize: 11, fontWeight: '700', color: c.textPrimary },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: { borderRadius: 99, paddingVertical: 5, paddingHorizontal: 10 },
    chipTx: { fontSize: 10, fontWeight: '600' },
    notes: { fontSize: 11, color: c.textSecondary, lineHeight: 18 },
  });
}
