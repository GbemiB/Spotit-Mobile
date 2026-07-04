import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme } from '../../shared/styles/index.js';
import Button from '../../components/ui/Button.jsx';

export default function SignupEmailScreen() {
  const { dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = firstName.trim() && email.trim() && password && !passwordsMismatch;

  function handleSignup() {
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (fullName) {
      dispatch({ type: A.ONBOARD_FIELD, field: 'name', value: fullName });
    }
    dispatch({ type: A.SET_AUTH_SCREEN, screen: null });
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
        <Pressable onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'signup' })} style={s.back}>
          <Text style={s.backTx}>← Back</Text>
        </Pressable>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headline}>Sign up with email</Text>
          <Text style={s.sub}>Fill in your details to get started.</Text>
        </View>

        {/* Form */}
        <View style={s.form}>
          <View style={s.nameRow}>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>First name</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={colors.textFaint}
                style={s.input}
              />
            </View>
            <View style={[s.field, { flex: 1 }]}>
              <Text style={s.label}>Last name</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor={colors.textFaint}
                style={s.input}
              />
            </View>
          </View>
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
          <View style={s.field}>
            <Text style={s.label}>Create password</Text>
            <View style={s.passWrap}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor={colors.textFaint}
                secureTextEntry={!showPass}
                style={[s.input, s.passInput]}
              />
              <Pressable onPress={() => setShowPass(v => !v)} hitSlop={8}>
                <Text style={s.showTx}>{showPass ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
          </View>
          <View style={s.field}>
            <Text style={s.label}>Confirm password</Text>
            <View style={[s.passWrap, passwordsMismatch && s.passWrapError]}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                placeholderTextColor={colors.textFaint}
                secureTextEntry={!showConfirmPass}
                style={[s.input, s.passInput]}
              />
              <Pressable onPress={() => setShowConfirmPass(v => !v)} hitSlop={8}>
                <Text style={s.showTx}>{showConfirmPass ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
            {passwordsMismatch && <Text style={s.errorTx}>Passwords don't match</Text>}
          </View>

          <View style={s.ctaWrap}>
            <Button onPress={handleSignup} disabled={!canSubmit}>Create account</Button>
          </View>

          <Text style={s.terms}>
            By continuing, you agree to our{' '}
            <Text style={s.termsLink}>Terms</Text> and{' '}
            <Text style={s.termsLink}>Privacy Policy</Text>.
          </Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerTx}>Already have an account? </Text>
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
    headline: { fontSize: 18, fontWeight: '600', color: c.textPrimary, letterSpacing: -0.5, lineHeight: 24, marginBottom: 8 },
    sub: { fontSize: 14, fontWeight: '400', color: c.textMuted, lineHeight: 24 },
    form: { paddingHorizontal: 24, gap: 16 },
    nameRow: { flexDirection: 'row', gap: 12 },
    field: { gap: 8 },
    label: { fontSize: 12, fontWeight: '700', color: c.textSecondary },
    input: { borderWidth: 1.5, borderColor: c.border, borderRadius: 16, padding: 14, fontSize: 12, color: c.textPrimary, backgroundColor: c.surface },
    passWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: c.border, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: c.surface, gap: 8 },
    passWrapError: { borderColor: c.error },
    passInput: { flex: 1, borderWidth: 0, padding: 0 },
    showTx: { fontSize: 12, color: c.primary, fontWeight: '700' },
    errorTx: { fontSize: 12, color: c.error, fontWeight: '600' },
    ctaWrap: { marginTop: 8 },
    terms: { fontSize: 12, color: c.textDisabled, textAlign: 'center', lineHeight: 18, marginTop: 4 },
    termsLink: { color: c.primary, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
    footerTx: { fontSize: 12, color: c.textMuted },
    footerLink: { fontSize: 12, color: c.primary, fontWeight: '700' },
  });
}
