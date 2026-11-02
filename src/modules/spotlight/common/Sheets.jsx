import { View, StyleSheet } from 'react-native';
import BottomSheet from '../../../components/ui/BottomSheet.jsx';
import { useTheme, Text, FONT } from '../../../shared/styles/index.js';
import { LockIcon } from '../../../components/ui/icons.jsx';
import { PressScale, Icon, Pop, SPARKLE } from './SpotlightFx.jsx';

export function Ghost({ label, onPress }) {
  const { colors: c } = useTheme();
  return (
    <PressScale onPress={onPress} accessibilityLabel={label}>
      <View style={{ height: 46, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: c.textMuted }}>{label}</Text>
      </View>
    </PressScale>
  );
}

export function PointsSheet({ open, balance, onClose }) {
  const { colors: c } = useTheme();
  return (
    <BottomSheet open={open} onClose={onClose}>
      <Text style={[styles.title, { color: c.textPrimary, marginTop: 0 }]}>Your SpotPoints</Text>
      <Text style={[styles.big, { color: c.textPrimary }]}>{balance.toLocaleString()} SP</Text>
      <Text style={[styles.body, { color: c.textSecondary }]}>
        Earn SP by logging, checking in and tracking your mood. Spend it on challenges, higher levels and hints.
      </Text>
      <Text style={[styles.fine, { color: c.textMuted }]}>Points packs are coming soon.</Text>
      <Ghost label="Close" onPress={onClose} />
    </BottomSheet>
  );
}

export function MessageSheet({ open, icon, title, body, reduceMotion, onClose }) {
  const { colors: c } = useTheme();
  return (
    <BottomSheet open={open} onClose={onClose}>
      <Pop reduceMotion={reduceMotion} trigger={open} style={{ alignItems: 'center' }}>
        <View style={[styles.badge, { backgroundColor: c.primarySoft }]}>
          {icon === 'lock' ? <LockIcon size={24} color={c.primaryDark} /> : <Icon d={SPARKLE} size={26} color={c.primary} fill />}
        </View>
      </Pop>
      <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
      <Text style={[styles.body, { color: c.textSecondary }]}>{body}</Text>
      <View style={{ height: 16 }} />
      <Ghost label="Got it" onPress={onClose} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  badge: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: FONT.serif, fontSize: 26, lineHeight: 32, textAlign: 'center', marginTop: 6 },
  body: { fontSize: 11.5, lineHeight: 18, textAlign: 'center', marginTop: 8 },
  big: { fontSize: 34, fontWeight: '800', textAlign: 'center', marginTop: 6 },
  fine: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 10, marginBottom: 14 },
});
