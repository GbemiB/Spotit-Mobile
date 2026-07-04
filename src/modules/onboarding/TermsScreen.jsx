import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme } from '../../shared/styles/index.js';

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

export default function TermsScreen() {
  const { dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <View style={s.headerRow}>
        <Pressable onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'signup-email' })} style={s.back}>
          <Text style={s.backTx}>← Back</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>Terms & Conditions</Text>
        <Text style={s.updated}>Last updated: January 2026</Text>

        {SECTIONS.map((sec) => (
          <View key={sec.title} style={s.section}>
            <Text style={s.sectionTitle}>{sec.title}</Text>
            <Text style={s.sectionBody}>{sec.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    headerRow: { paddingHorizontal: 24, marginBottom: 4 },
    back: { paddingVertical: 4, alignSelf: 'flex-start' },
    backTx: { fontSize: 12, color: c.textMuted, fontWeight: '500' },
    title: { fontSize: 18, fontWeight: '800', color: c.textPrimary, letterSpacing: -0.5, marginTop: 12, marginBottom: 4 },
    updated: { fontSize: 12, color: c.textFaint, fontWeight: '600', marginBottom: 20 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 14, fontWeight: '700', color: c.textPrimary, marginBottom: 6 },
    sectionBody: { fontSize: 12, color: c.textSecondary, lineHeight: 19 },
  });
}
