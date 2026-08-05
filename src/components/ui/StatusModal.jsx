import { Modal, View, Pressable, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useTheme, Text } from '../../shared/styles/index.js';
import { WarningIcon } from './icons.jsx';
import Button from './Button.jsx';

export default function StatusModal({ visible, variant = 'success', title, subtitle, ctaLabel, onCta, secondaryLabel, onSecondary }) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const isSuccess = variant === 'success';
  const iconBg = isSuccess ? (isDark ? 'rgba(95,169,140,0.18)' : '#E7F2EB') : isDark ? 'rgba(211,59,59,0.18)' : '#FBE7E7';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCta}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={[s.iconCircle, { backgroundColor: iconBg }]}>
            {isSuccess ? <Text style={s.iconEmoji}>👍</Text> : <WarningIcon size={26} />}
          </View>
          <Text style={s.title}>{title}</Text>
          {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
          <View style={{ width: '100%', marginTop: 20 }}>
            <Button onPress={onCta}>{ctaLabel}</Button>
          </View>
          {secondaryLabel ? (
            <Pressable onPress={onSecondary} style={{ marginTop: 14 }}>
              <Text style={s.secondary}>{secondaryLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: c.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 },
    card: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: c.surface,
      borderRadius: 22,
      padding: 28,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.22,
      shadowRadius: 34,
      elevation: 12,
    },
    iconCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
    iconEmoji: { fontSize: 26 },
    title: { fontSize: 19, fontWeight: '600', color: c.textPrimary, letterSpacing: -0.2, marginTop: 16, textAlign: 'center' },
    subtitle: { fontSize: 12, color: c.textSecondary, marginTop: 6, lineHeight: 18, textAlign: 'center' },
    secondary: { fontSize: 12, fontWeight: '700', color: c.authAccent },
  });
}
