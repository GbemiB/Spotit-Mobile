import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useState, useRef, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import LogoMark from '../../components/ui/LogoMark.jsx';
import { EnvelopeIcon } from '../../components/ui/icons.jsx';
import StatusModal from '../../components/ui/StatusModal.jsx';
import * as authApi from '../../shared/api/auth.js';

const CODE_LENGTH = 6;

export default function OtpVerifyScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const isReset = state.otpPurpose === 'password_reset';
  const email = isReset ? state.resetEmail : state.pendingEmail;

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetDone, setResetDone] = useState(false);
  const inputRefs = useRef([]);

  const code = digits.join('');
  const passwordsMismatch = isReset && confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canVerify = code.length === CODE_LENGTH && (!isReset || (newPassword.length >= 8 && !passwordsMismatch));

  function setDigitAt(i, value) {
    const clean = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < CODE_LENGTH - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  }

  function onKeyPress(i, e) {
    if (e.nativeEvent.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  }

  async function handleVerify() {
    if (!canVerify || loading) return;
    setError('');
    setLoading(true);
    try {
      if (isReset) {
        await authApi.resetPassword({ email, code, newPassword });
        setResetDone(true);
      } else {
        const data = await authApi.verifyOtp({ otpId: state.pendingOtpId, code });
        dispatch({
          type: A.AUTH_SUCCESS,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.user.userId,
          onboarded: data.user.onboarded,
        });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!isReset || loading) return;
    try {
      await authApi.forgotPassword({ email });
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch (e) {
      setError(e.message);
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
              <EnvelopeIcon size={20} />
            </View>
            <Text style={s.title}>{isReset ? 'Reset your password' : 'Enter the code'}</Text>
            <Text style={s.sub}>We sent a {CODE_LENGTH}-digit code to{'\n'}<Text style={s.subEmail}>{email || 'your email'}</Text></Text>

            <View style={s.otpRow}>
              {digits.map((d, i) => (
                <TextInput
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  value={d}
                  onChangeText={(v) => setDigitAt(i, v)}
                  onKeyPress={(e) => onKeyPress(i, e)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={[s.otpBox, d && s.otpBoxFilled]}
                />
              ))}
            </View>

            {isReset && (
              <View style={s.passwordForm}>
                <View style={s.field}>
                  <Text style={s.label}>New password</Text>
                  <View style={s.passRow}>
                    <TextInput value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showPass} style={[s.input, { flex: 1, borderBottomWidth: 0 }]} />
                    <Pressable onPress={() => setShowPass(v => !v)} hitSlop={8}>
                      <Text style={s.showTx}>{showPass ? 'Hide' : 'Show'}</Text>
                    </Pressable>
                  </View>
                  <Text style={s.hint}>Min. 8 characters</Text>
                </View>
                <View style={s.field}>
                  <Text style={s.label}>Confirm password</Text>
                  <View style={[s.passRow, passwordsMismatch && { borderBottomColor: colors.error }]}>
                    <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPass} style={[s.input, { flex: 1, borderBottomWidth: 0 }]} />
                    <Pressable onPress={() => setShowConfirmPass(v => !v)} hitSlop={8}>
                      <Text style={s.showTx}>{showConfirmPass ? 'Hide' : 'Show'}</Text>
                    </Pressable>
                  </View>
                  {passwordsMismatch && <Text style={s.errorTx}>Passwords don't match</Text>}
                </View>
              </View>
            )}

            {error ? <Text style={s.errorTx}>{error}</Text> : null}

            <Pressable disabled={!canVerify || loading} onPress={handleVerify} style={{ marginTop: 24, opacity: canVerify && !loading ? 1 : 0.5, alignSelf: 'stretch' }}>
              <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.ctaTx}>{isReset ? 'Reset Password' : 'Verify'}</Text>}
              </LinearGradient>
            </Pressable>

            {isReset && (
              <Pressable style={s.resendBtn} onPress={handleResend}>
                <Text style={s.resendTx}>{resent ? 'Code resent ✓' : "Didn't get it? Resend Code"}</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <StatusModal
        visible={resetDone}
        variant="success"
        title="Password updated"
        subtitle="You can now log in with your new password."
        ctaLabel="Back to Login"
        onCta={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'login' })}
      />
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
    subEmail: { color: c.authHeading, fontWeight: '700' },
    otpRow: { flexDirection: 'row', gap: 8, marginTop: 26 },
    otpBox: {
      width: 40, height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: c.authBorder,
      backgroundColor: c.authInputBg, textAlign: 'center', fontSize: 20, fontWeight: '700', color: c.authHeading,
    },
    otpBoxFilled: { borderColor: c.authHeading },
    passwordForm: { alignSelf: 'stretch', marginTop: 22 },
    field: { marginBottom: 8 },
    label: { fontSize: 10, letterSpacing: 1, color: c.authLabel, textTransform: 'uppercase', fontWeight: '600' },
    input: { fontSize: 12, fontWeight: '400', color: c.authHeading, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.authBorderStrong },
    passRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: c.authBorderStrong },
    showTx: { fontSize: 11.5, color: c.authAccent, fontWeight: '700' },
    hint: { fontSize: 10.5, color: c.authLabel, marginTop: 7, lineHeight: 14 },
    errorTx: { fontSize: 11, color: c.error, fontWeight: '600', marginTop: 10, textAlign: 'center' },
    cta: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    ctaTx: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, color: '#fff' },
    resendBtn: { alignItems: 'center', marginTop: 24 },
    resendTx: { fontSize: 12, color: c.authAccent, fontWeight: '700' },
  });
}
