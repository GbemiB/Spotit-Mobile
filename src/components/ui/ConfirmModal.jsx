import { Modal, View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useTheme, Text } from '../../shared/styles/index.js';
import Button from './Button.jsx';

// Native Alert.alert can't be restyled (no font API on either platform's OS dialog) — this
// is the app-drawn equivalent, used wherever a destructive action needs a yes/no confirm.
export default function ConfirmModal({ visible, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', destructive = false, onConfirm, onCancel }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.title}>{title}</Text>
          {message ? <Text style={s.message}>{message}</Text> : null}
          <View style={s.actions}>
            <View style={{ flex: 1 }}>
              <Button variant="secondary" onPress={onCancel}>{cancelLabel}</Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button variant={destructive ? 'danger' : 'primary'} onPress={onConfirm}>{confirmLabel}</Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: c.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 },
    card: {
      width: '100%', maxWidth: 360, backgroundColor: c.surface, borderRadius: 22, padding: 24,
      alignItems: 'center', borderWidth: 1, borderColor: c.border,
      shadowColor: '#000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.22, shadowRadius: 34, elevation: 12,
    },
    title: { fontSize: 12, fontWeight: '600', color: c.textPrimary, textAlign: 'center' },
    message: { fontSize: 12, fontWeight: '400', color: c.textSecondary, marginTop: 8, lineHeight: 18, textAlign: 'center' },
    actions: { flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' },
  });
}
