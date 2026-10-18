import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
import Button from '../../components/ui/Button.jsx';
import { useTheme, calendarPalette, Text } from '../../shared/styles/index.js';

export default function CalendarGuideSheet({ open, onClose }) {
  const { colors, isDark } = useTheme();
  const cal = calendarPalette[isDark ? 'dark' : 'light'];
  const s = useMemo(() => createStyles(colors), [colors]);
  const rows = [
    { title: 'Period', body: 'A period you logged, or the one you told us about when you joined.', n: '5', fill: cal.tint.period },
    { title: 'Predicted period', body: 'When we expect your next period. It turns solid once you log it.', n: '30', dashed: cal.period },
    { title: 'Fertile window', body: 'The five days before your predicted ovulation.', n: '12', fill: cal.tint.fertile },
    { title: 'Ovulation', body: 'Your predicted ovulation day.', n: '15', fill: cal.tint.ovulation },
    { title: 'Today', body: 'Today’s date is shown in bold with “Today” underneath.', n: '18', today: true },
    { title: 'Logged', body: 'You saved a mood, symptoms or notes for that day.', n: '16', dot: true },
    { title: 'Period expected', body: 'Your period was due here and hasn’t been logged yet.', n: '30', marker: cal.period },
    { title: 'No period logged', body: 'A predicted period that passed a full cycle without a log.', n: '2', marker: cal.missed },
  ];
  return (
    <BottomSheet open={open} onClose={onClose} title="How to read your calendar" closeLabel="Close">
      <View style={s.list}>
        {rows.map(r => (
          <View key={r.title} style={s.row}>
            <View style={s.markWrap}>
              <View
                style={[
                  s.mark,
                  r.fill && { backgroundColor: r.fill },
                  r.dashed && { borderWidth: 1.5, borderStyle: 'dashed', borderColor: r.dashed },
                ]}
              >
                <Text
                  style={[
                    s.markText,
                    r.fill && { color: colors.textPrimary, fontWeight: '600' },
                    r.today && { color: cal.today, fontWeight: '800' },
                  ]}
                >
                  {r.n}
                </Text>
                {r.dot && <View style={[s.dot, { backgroundColor: cal.dot }]} />}
              </View>
              {r.marker && <View style={[s.marker, { borderColor: r.marker }]} />}
            </View>
            <View style={s.copy}>
              <Text style={s.rowTitle}>{r.title}</Text>
              <Text style={s.rowBody}>{r.body}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={s.note}>Predictions are estimates from your cycle length, not medical advice.</Text>
      <View style={s.action}>
        <Button onPress={onClose}>Got it</Button>
      </View>
    </BottomSheet>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    list: { gap: 14, marginTop: 4 },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
    markWrap: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    mark: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    markText: { fontSize: 12, color: c.textSecondary },
    dot: { position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: 2 },
    marker: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 1.5,
      backgroundColor: c.surface,
    },
    copy: { flex: 1, gap: 2, paddingTop: 1 },
    rowTitle: { fontSize: 13, fontWeight: '700', color: c.textPrimary },
    rowBody: { fontSize: 12, lineHeight: 17, color: c.textSecondary },
    note: { fontSize: 11, lineHeight: 16, color: c.textMuted, marginTop: 18 },
    action: { marginTop: 14, marginBottom: 8 },
  });
}
