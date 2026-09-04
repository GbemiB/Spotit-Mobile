import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useState, useMemo, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import LogoMark from '../../components/ui/LogoMark.jsx';
import { FaceIDIcon, FingerprintIcon } from '../../components/ui/icons.jsx';
import * as authApi from '../../shared/api/auth.js';
import * as biometricUtils from '../../shared/utils/biometric.js';
export default function LoginScreen() {
  const { dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometric');
  const canSubmit = email.trim() && password.length > 0;
  useEffect(() => {
    (async () => {
      const available = await biometricUtils.isBiometricAvailable();
      const enabled = await biometricUtils.isBiometricEnabled();
      if (available && enabled) {
        setBiometricEnabled(true);
        setBiometricLabel(await biometricUtils.getBiometricLabel());
      }
    })();
  }, []);
  const isFaceID = biometricLabel === 'Face ID';
  async function handleLogin() {
    if (!canSubmit || loading) return;
    setError('');
    setLoading(true);
    const trimmedEmail = email.trim();

    async function doLogin() {
      const data = await authApi.login({ email: trimmedEmail, password: password.trim() });
      dispatch({
        type: A.AUTH_SUCCESS,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        userId: data.user.userId,
        onboarded: data.user.onboarded,
      });
    }

    try {
      await doLogin();
    } catch (e) {
      let err = e;
      // The server may have been cold — the first request wakes it up.
      // Retry once so the user gets the real error instead of a timeout.
      if (e.errorCode === 'timeout') {
        try {
          await doLogin();
          return;
        } catch (retryErr) {
          err = retryErr;
        }
      }
      if (err.errorCode === 'email_not_verified' && err.otpId) {
        dispatch({
          type: A.UPDATE_SETTINGS,
          patch: {
            pendingOtpId: err.otpId,
            pendingEmail: trimmedEmail,
            otpPurpose: 'login_verify',
            otpExpiresAt: err.expiresInSeconds ? Date.now() + err.expiresInSeconds * 1000 : null,
          },
        });
        dispatch({ type: A.SET_AUTH_SCREEN, screen: 'otp-verify' });
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  async function handleBiometricLogin() {
    setError('');
    setLoading(true);
    try {
      const stored = await biometricUtils.authenticateWithBiometric();
      if (!stored) return; // user cancelled — no error shown
      const data = await authApi.refresh({ refreshToken: stored.refreshToken });
      dispatch({
        type: A.AUTH_SUCCESS,
        accessToken: data.accessToken,
        refreshToken: stored.refreshToken,
        userId: stored.userId,
        onboarded: stored.onboarded,
      });
    } catch (e) {
      if (e.noCredentials) {
        setError('Please log in with your password to re-activate Face ID.');
      } else if (e.errorCode === 'invalid_refresh_token') {
        await biometricUtils.disableBiometric();
        setBiometricEnabled(false);
        setError('Session expired. Please log in with your password.');
      } else {
        setError(e.message || 'Biometric login failed. Please try your password.');
      }
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
            <Text style={s.wordmark}>
              Spot
              <Text style={{ color: colors.primary }}> it</Text>
            </Text>
          </View>

          <View style={s.body}>
            <Text style={s.title}>Welcome back.</Text>

            <View style={s.form}>
              <View style={s.field}>
                <Text style={s.label}>Email</Text>
                <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={s.input} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Password</Text>
                <View style={s.passRow}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    autoCorrect={false}
                    autoCapitalize="none"
                    style={[s.input, { flex: 1, borderBottomWidth: 0 }]}
                  />
                  <Pressable onPress={() => setShowPass(v => !v)} hitSlop={8}>
                    <Text style={s.showTx}>{showPass ? 'Hide' : 'Show'}</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <Pressable style={s.forgotBtn} onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'forgot-password' })}>
              <Text style={s.forgotTx}>Forgot password?</Text>
            </Pressable>

            {error ? <Text style={s.errorTx}>{error}</Text> : null}

            <Pressable
              disabled={!canSubmit || loading}
              onPress={handleLogin}
              style={{ marginTop: 16, opacity: canSubmit && !loading ? 1 : 0.5 }}
            >
              <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.ctaTx}>Login</Text>}
              </LinearGradient>
            </Pressable>

            {biometricEnabled && (
              <Pressable onPress={handleBiometricLogin} disabled={loading} style={s.biometricBtn}>
                {isFaceID ? <FaceIDIcon size={22} color={colors.primary} /> : <FingerprintIcon size={40} color={colors.primary} />}
              </Pressable>
            )}

            <View style={s.footer}>
              <Text style={s.footerTx}>New here? </Text>
              <Pressable onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'signup' })}>
                <Text style={s.footerLink}>Create Account</Text>
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
    wordmark: { marginTop: 8, fontSize: 20, fontWeight: '600', color: c.authHeading },
    body: { paddingHorizontal: 26, paddingTop: 20 },
    title: { fontSize: 25, fontWeight: '600', letterSpacing: -0.2, lineHeight: 29, color: c.authHeading, textAlign: 'center' },
    form: { marginTop: 24 },
    field: { marginBottom: 18 },
    errorTx: { fontSize: 11, color: c.error, fontWeight: '600', marginTop: 10, textAlign: 'center' },
    label: { fontSize: 10, letterSpacing: 1, color: c.authLabel, textTransform: 'uppercase', fontWeight: '600' },
    input: {
      fontSize: 12,
      fontWeight: '400',
      color: c.authHeading,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.authBorderStrong,
    },
    passRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: c.authBorderStrong },
    showTx: { fontSize: 11.5, color: c.authAccent, fontWeight: '700' },
    forgotBtn: { alignItems: 'flex-end', marginTop: 10 },
    forgotTx: { fontSize: 11.5, fontWeight: '700', color: c.authAccent },
    cta: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    ctaTx: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, color: '#fff' },
    biometricBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginTop: 4 },
    biometricTx: { fontSize: 13, fontWeight: '600', color: c.primary },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, paddingTop: 14 },
    footerTx: { fontSize: 12, color: c.authBody },
    footerLink: { fontSize: 12, color: c.authAccent, fontWeight: '700' },
  });
}
