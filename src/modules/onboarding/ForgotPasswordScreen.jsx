import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme } from '../../shared/styles/index.js';
import Button from '../../components/ui/Button.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const { dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  const canSubmit = EMAIL_RE.test(email.trim());

  function handleSend() {
    dispatch({ type: A.UPDATE_SETTINGS, patch: { resetEmail: email.trim() } });
    dispatch({ type: A.SET_AUTH_SCREEN, screen: 'otp-verify' });
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={s.screen}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'login' })} style={s.back}>
          <Text style={s.backTx}>← Back</Text>
        </Pressable>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headline}>Forgot password?</Text>
          <Text style={s.sub}>Enter the email linked to your account and we'll send you a reset code.</Text>
        </View>

        {/* Form */}
        <View style={s.form}>
          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textFaint}
              keyboardType="email-address"
              autoCapitalize="none"
              style={s.input}
            />
          </View>

          <View style={s.ctaWrap}>
            <Button onPress={handleSend} disabled={!canSubmit}>Send reset code</Button>
          </View>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerTx}>Remembered your password? </Text>
          <Pressable onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'login' })}>
            <Text style={s.footerLink}>Log in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    back: { paddingHorizontal: 24, marginBottom: 4 },
    backTx: { fontSize: 12, color: c.textMuted, fontWeight: '500' },
    header: { paddingHorizontal: 24, paddingTop: 8, marginBottom: 28 },
    headline: { fontSize: 18, fontWeight: '800', color: c.textPrimary, letterSpacing: -0.5, lineHeight: 24, marginBottom: 8 },
    sub: { fontSize: 14, color: c.textMuted, lineHeight: 21 },
    form: { paddingHorizontal: 24, gap: 16 },
    field: { gap: 8 },
    label: { fontSize: 12, fontWeight: '700', color: c.textSecondary },
    input: { borderWidth: 1.5, borderColor: c.border, borderRadius: 16, padding: 14, fontSize: 15, color: c.textPrimary, backgroundColor: c.surface },
    ctaWrap: { marginTop: 8 },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
    footerTx: { fontSize: 12, color: c.textMuted },
    footerLink: { fontSize: 12, color: c.primary, fontWeight: '700' },
  });
}
