import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useState, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import LogoMark from '../../components/ui/LogoMark.jsx';
import StatusModal from '../../components/ui/StatusModal.jsx';
import { CheckIcon, GoogleIcon, AppleIcon } from '../../components/ui/icons.jsx';

export default function SignupScreen() {
  const { dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const canSubmit = name.trim() && email.trim() && password && agreed && !passwordsMismatch;

  function handleCreate() {
    if (name.trim()) dispatch({ type: A.ONBOARD_FIELD, field: 'name', value: name.trim() });
    setShowSuccess(true);
  }

  function handleContinue() {
    setShowSuccess(false);
    dispatch({ type: A.SET_AUTH_SCREEN, screen: null });
  }

  function handleSocial() {
    dispatch({ type: A.SET_AUTH_SCREEN, screen: null });
  }

  return (
    <LinearGradient colors={colors.authGradient} start={{ x: 0, y: 0 }} end={{ x: 0.35, y: 1 }} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ paddingTop: insets.top + 30, paddingBottom: insets.bottom + 30 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <LogoMark size={76} />
            <Text style={s.wordmark}>Spot<Text style={{ color: colors.primary }}> it</Text></Text>
          </View>

          <View style={s.body}>
            <Text style={s.title}>Create your account</Text>

            <View style={s.form}>
              <View style={s.field}>
                <Text style={s.label}>Name</Text>
                <TextInput value={name} onChangeText={setName} placeholder="" style={s.input} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Email</Text>
                <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="" style={s.input} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Password</Text>
                <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="" style={s.input} />
                <Text style={s.hint}>Min. 8 characters, 1 number, 1 symbol</Text>
              </View>
              <View style={s.field}>
                <Text style={s.label}>Confirm password</Text>
                <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="" style={[s.input, passwordsMismatch && { borderBottomColor: colors.error }]} />
                {passwordsMismatch && <Text style={s.errorTx}>Passwords don't match</Text>}
              </View>
            </View>

            <Pressable style={s.agreeRow} onPress={() => setAgreed(v => !v)}>
              <View style={[s.checkbox, agreed && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                {agreed && <CheckIcon size={11} color="#fff" />}
              </View>
              <Text style={s.agreeTx}>
                I agree to the{' '}
                <Text style={s.agreeLink} onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'terms' })}>Terms of Service</Text>
                {' '}and <Text style={s.agreeLink}>Privacy Policy</Text>
              </Text>
            </Pressable>

            <Pressable disabled={!canSubmit} onPress={handleCreate} style={{ marginTop: 16, opacity: canSubmit ? 1 : 0.5 }}>
              <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
                <Text style={s.ctaTx}>Create Account</Text>
              </LinearGradient>
            </Pressable>

            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerTx}>OR</Text>
              <View style={s.dividerLine} />
            </View>

            <View style={{ gap: 10 }}>
              <Pressable style={s.socialBtn} onPress={handleSocial}>
                <GoogleIcon size={16} />
                <Text style={s.socialTx}>Continue With Google</Text>
              </Pressable>
              <Pressable style={s.socialBtn} onPress={handleSocial}>
                <AppleIcon size={14} color={colors.authHeading} />
                <Text style={s.socialTx}>Continue With Apple</Text>
              </Pressable>
            </View>

            <View style={s.footer}>
              <Text style={s.footerTx}>Already have an account? </Text>
              <Pressable onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'login' })}>
                <Text style={s.footerLink}>Login</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <StatusModal
        visible={showSuccess}
        variant="success"
        title="Account created"
        subtitle="Welcome to Spot it — let's get your cycle set up."
        ctaLabel="Continue"
        onCta={handleContinue}
      />
    </LinearGradient>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    header: { alignItems: 'center' },
    wordmark: { marginTop: 8, fontSize: 15, fontWeight: '600', color: c.authHeading },
    body: { paddingHorizontal: 26, paddingTop: 20 },
    title: { fontSize: 25, fontWeight: '600', letterSpacing: -0.2, lineHeight: 29, color: c.authHeading, textAlign: 'center' },
    form: { marginTop: 24 },
    field: { marginBottom: 16 },
    label: { fontSize: 10, letterSpacing: 1, color: c.authLabel, textTransform: 'uppercase', fontWeight: '700' },
    input: { fontSize: 15, fontWeight: '600', color: c.authHeading, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.authBorder },
    hint: { fontSize: 10.5, color: c.authLabel, marginTop: 7, lineHeight: 14 },
    errorTx: { fontSize: 11, color: c.error, fontWeight: '600', marginTop: 6 },
    agreeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 4 },
    checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: c.primary, marginTop: 1, alignItems: 'center', justifyContent: 'center' },
    agreeTx: { flex: 1, fontSize: 11.5, color: c.textSecondary, lineHeight: 17 },
    agreeLink: { color: c.primaryDark, fontWeight: '700' },
    cta: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    ctaTx: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, color: '#fff' },
    dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, marginBottom: 16 },
    dividerLine: { flex: 1, height: 1, backgroundColor: c.authBorder },
    dividerTx: { fontSize: 10.5, color: c.authLabel },
    socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, height: 46, borderRadius: 10, borderWidth: 1.5, borderColor: c.authHeading },
    socialTx: { fontSize: 13, fontWeight: '600', color: c.authHeading },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, paddingTop: 14 },
    footerTx: { fontSize: 12, color: c.authBody },
    footerLink: { fontSize: 12, color: c.primaryDark, fontWeight: '700' },
  });
}
