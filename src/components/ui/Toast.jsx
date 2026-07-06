import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Text } from '../../shared/styles/index.js';

export default function Toast({ icon, text }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.toast, { top: insets.top + 12 }]}>
      <Text style={s.icon}>{icon}</Text>
      <Text style={s.text}>{text}</Text>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    toast: {
      position: 'absolute', left: 16, right: 16, zIndex: 999,
      backgroundColor: c.inverseSurface, borderRadius: 16, padding: 14,
      flexDirection: 'row', alignItems: 'center', gap: 10,
      shadowColor: c.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
    },
    icon: { fontSize: 18 },
    text: { fontSize: 13.5, fontWeight: '600', color: c.white, flex: 1 },
  });
}
