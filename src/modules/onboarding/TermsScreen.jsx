import { View, Pressable, ScrollView, Modal, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Text } from '../../shared/styles/index.js';
import { DocumentIcon } from '../../components/ui/icons.jsx';

const SECTIONS = [
  {
    title: '1. Acceptance of terms',
    body: 'By creating an account or using Spot it, you agree to these Terms & Conditions and our Privacy Policy. If you do not agree, please do not use the app.',
  },
  {
    title: '2. What Spot it is (and isn’t)',
    body: 'Spot it helps you log and understand your menstrual cycle based on the information you enter. Predictions are estimates, not medical advice. Always consult a qualified healthcare provider for medical concerns.',
  },
  {
    title: '3. Your data',
    body: 'Your logs, cycle history, and account details are stored to provide the app’s features. We do not sell your personal health data. You can request deletion of your data at any time from Settings.',
  },
  {
    title: '4. Your responsibilities',
    body: 'You’re responsible for keeping your login credentials secure and for the accuracy of the information you log. You must be old enough to consent to use health-tracking apps in your jurisdiction.',
  },
  {
    title: '5. Changes to these terms',
    body: 'We may update these terms occasionally. Continuing to use Spot it after changes take effect means you accept the revised terms.',
  },
  {
    title: '6. Contact',
    body: 'Questions about these terms? Reach out to us from the Settings screen and we’ll get back to you.',
  },
];

export default function TermsScreen({ visible, onAgree, onClose }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[s.screen, { paddingTop: insets.top }]}>
        <Pressable onPress={onClose} style={s.back}>
          <Text style={s.backTx}>← Back</Text>
        </Pressable>
        <View style={s.headerRow}>
          <DocumentIcon size={18} color={colors.authHeading} />
          <Text style={s.headerTitle}>Terms & Conditions</Text>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 20, gap: 14 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.updated}>Last updated June 2026</Text>

          {SECTIONS.map((sec) => (
            <View key={sec.title}>
              <Text style={s.sectionTitle}>{sec.title}</Text>
              <Text style={s.sectionBody}>{sec.body}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[s.footer, { paddingBottom: insets.bottom + 22 }]}>
          <Pressable onPress={onAgree}>
            <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
              <Text style={s.ctaTx}>I Agree</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    back: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 4 },
    backTx: { fontSize: 12, color: c.textMuted, fontWeight: '500' },
    headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: c.border },
    headerTitle: { fontSize: 16, fontWeight: '600', color: c.textPrimary },
    updated: { fontSize: 10.5, color: c.textFaint },
    sectionTitle: { fontSize: 12.5, fontWeight: '700', color: c.textPrimary, marginBottom: 4 },
    sectionBody: { fontSize: 11.5, color: c.textSecondary, lineHeight: 17 },
    footer: { paddingHorizontal: 22, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border },
    cta: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    ctaTx: { fontSize: 13, fontWeight: '600', color: '#fff' },
  });
}
