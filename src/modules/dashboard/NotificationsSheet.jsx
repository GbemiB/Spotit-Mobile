import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useTheme, Text } from '../../shared/styles/index.js';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
const DAY_MS = 24 * 60 * 60 * 1000;
export function sentLabel(sentAt, now = new Date()) {
  const sent = new Date(sentAt);
  if (Number.isNaN(sent.getTime())) return '';
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const time = sent.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (sent.getTime() >= startOfToday) return `Today, ${time}`;
  if (sent.getTime() >= startOfToday - DAY_MS) return `Yesterday, ${time}`;
  return sent.toLocaleDateString([], { day: 'numeric', month: 'short' });
}
export default function NotificationsSheet({ open, onClose, items }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <BottomSheet open={open} onClose={onClose} title="Notifications" closeLabel="Close">
      {items.length === 0 ? (
        <Text style={s.empty}>{"No reminders yet. When one is sent, you'll find it here."}</Text>
      ) : (
        items.map((item, i) => (
          <View key={item.id} style={[s.item, i === items.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={[s.dot, item.read && { backgroundColor: 'transparent' }]} />
            <View style={{ flex: 1 }}>
              <View style={s.itemHead}>
                <Text style={s.itemTitle}>{item.title}</Text>
                <Text style={s.itemTime}>{sentLabel(item.sentAt)}</Text>
              </View>
              <Text style={s.itemBody}>{item.body}</Text>
            </View>
          </View>
        ))
      )}
    </BottomSheet>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    empty: { fontSize: 11.5, color: c.textMuted, lineHeight: 18, paddingVertical: 24, textAlign: 'center' },
    item: { flexDirection: 'row', gap: 10, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.primary, marginTop: 5 },
    itemHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    itemTitle: { fontSize: 11.5, fontWeight: '700', color: c.textPrimary },
    itemTime: { fontSize: 10, color: c.textFaint },
    itemBody: { fontSize: 11.5, color: c.textSecondary, lineHeight: 17, marginTop: 3 },
  });
}
