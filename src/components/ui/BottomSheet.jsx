import { Modal, View, Pressable, ScrollView, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useMemo } from 'react';
import { useTheme, Text } from '../../shared/styles/index.js';

export default function BottomSheet({ open, onClose, title, children }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.container}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={s.overlay} />
        </TouchableWithoutFeedback>
        <View style={s.sheet}>
          <View style={s.handle} />
          {title && (
            <View style={s.titleRow}>
              <Text style={s.title}>{title}</Text>
              <Pressable onPress={onClose}>
                <Text style={s.cancel}>Cancel</Text>
              </Pressable>
            </View>
          )}
          <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: 'flex-end' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: c.overlay },
    sheet: {
      backgroundColor: c.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight: '90%',
      paddingHorizontal: 22,
      paddingBottom: 40,
    },
    handle: { width: 40, height: 5, borderRadius: 99, backgroundColor: c.border, alignSelf: 'center', marginTop: 10, marginBottom: 16 },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 },
    title: { flex: 1, fontSize: 21, lineHeight: 26, fontWeight: '700', color: c.textPrimary },
    cancel: { fontSize: 13.5, fontWeight: '600', color: c.textMuted, marginTop: 4 },
  });
}
