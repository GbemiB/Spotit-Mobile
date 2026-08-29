import { View, Pressable, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useTheme, Text } from '../../shared/styles/index.js';
export default function SectionHeader({ title, action, onAction, style }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[s.row, style]}>
      <Text style={s.title}>{title}</Text>
      {action && (
        <Pressable onPress={onAction}>
          <Text style={s.action}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 13, fontWeight: '700', color: c.textSecondary, letterSpacing: 0.1 },
    action: { fontSize: 12, fontWeight: '700', color: c.primaryDark },
  });
}
