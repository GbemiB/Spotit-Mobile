import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useState, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import LogoMark from '../../components/ui/LogoMark.jsx';
import { LockIcon } from '../../components/ui/icons.jsx';
import * as authApi from '../../shared/api/auth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const { dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = EMAIL_RE.test(email.trim());

  async function handleSend() {
    if (!canSubmit || loading) return;
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      dispatch({ type: A.UPDATE_SETTINGS, patch: { resetEmail: email.trim(), otpPurpose: 'password_reset', pendingOtpId: null } });
      dispatch({ type: A.SET_AUTH_SCREEN, screen: 'otp-verify' });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
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
            <View style={s.iconBadge}>
              <LockIcon size={20} />
            </View>
            <Text style={s.title}>Forgot password?</Text>
            <Text style={s.sub}>Enter the email on your account and we'll send a code to reset it.</Text>

            <View style={s.form}>
              <Text style={s.label}>Email</Text>
              <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={s.input} />
            </View>

            {error ? <Text style={s.errorTx}>{error}</Text> : null}

            <Pressable disabled={!canSubmit || loading} onPress={handleSend} style={{ alignSelf: 'stretch', marginTop: 24, opacity: canSubmit && !loading ? 1 : 0.5 }}>
              <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.ctaTx}>Send Code</Text>}
              </LinearGradient>
            </Pressable>

            <View style={s.footer}>
              <Text style={s.footerTx}>Remembered it? </Text>
              <Pressable onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'login' })}>
                <Text style={s.footerLink}>Login</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    header: { alignItems: 'center' },
    wordmark: { marginTop: 8, fontSize: 15, fontWeight: '600', color: c.authHeading },
    body: { paddingHorizontal: 26, paddingTop: 50, alignItems: 'center' },
    iconBadge: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(220,90,116,0.14)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    title: { fontSize: 23, fontWeight: '600', letterSpacing: -0.2, lineHeight: 27, color: c.authHeading, textAlign: 'center' },
    sub: { fontSize: 12, color: c.authBody, marginTop: 8, lineHeight: 18, textAlign: 'center' },
    form: { alignSelf: 'stretch', marginTop: 26 },
    errorTx: { fontSize: 11, color: c.error, fontWeight: '600', marginTop: 16, textAlign: 'center' },
    label: { fontSize: 10, letterSpacing: 1, color: c.authLabel, textTransform: 'uppercase', fontWeight: '700' },
    input: { fontSize: 15, fontWeight: '400', color: c.authHeading, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.authBorderStrong },
    cta: { alignSelf: 'stretch', paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    ctaTx: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, color: '#fff' },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
    footerTx: { fontSize: 12, color: c.authBody },
    footerLink: { fontSize: 12, color: c.authAccent, fontWeight: '700' },
  });
}
