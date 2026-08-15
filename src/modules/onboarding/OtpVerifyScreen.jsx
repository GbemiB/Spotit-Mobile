import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useState, useRef, useMemo, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import LogoMark from '../../components/ui/LogoMark.jsx';
import { EnvelopeIcon, ChevronLeftIcon } from '../../components/ui/icons.jsx';
import StatusModal from '../../components/ui/StatusModal.jsx';
import * as authApi from '../../shared/api/auth.js';

const CODE_LENGTH = 6;

function remainingSeconds(expiresAt) {
  if (!expiresAt) return 0;
  return Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
}

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

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
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resetDone, setResetDone] = useState(false);
  // Reset-password is two steps: the code must check out before we ever ask for a new
  // password. otpConfirmed flips true once /reset-password/verify-otp succeeds.
  const [otpConfirmed, setOtpConfirmed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => remainingSeconds(state.otpExpiresAt));
  const inputRefs = useRef([]);

  const code = digits.join('');
  const codeComplete = code.length === CODE_LENGTH;
  const passwordsMismatch = isReset && confirmPassword.length > 0 && newPassword !== confirmPassword;
  const awaitingPassword = isReset && otpConfirmed;
  const canVerify = awaitingPassword ? newPassword.length >= 8 && !passwordsMismatch : codeComplete;
  const expired = secondsLeft <= 0;

  useEffect(() => {
    setSecondsLeft(remainingSeconds(state.otpExpiresAt));
    const id = setInterval(() => setSecondsLeft(remainingSeconds(state.otpExpiresAt)), 1000);
    return () => clearInterval(id);
  }, [state.otpExpiresAt]);

  function setDigitAt(i, value) {
    const clean = value.replace(/[^0-9]/g, '');
    if (clean.length > 1) {
      // A full code landed in one box — either OS one-time-code autofill (iOS QuickType
      // suggests codes it finds in Mail) or the user pasting a code copied from the email.
      // Spread it across the remaining boxes from the one that received it.
      const next = [...digits];
      let idx = i;
      for (const ch of clean) {
        if (idx >= CODE_LENGTH) break;
        next[idx] = ch;
        idx += 1;
      }
      setDigits(next);
      inputRefs.current[Math.min(idx, CODE_LENGTH - 1)]?.focus();
      return;
    }
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

  function handleBack() {
    if (isReset) {
      dispatch({ type: A.UPDATE_SETTINGS, patch: { resetEmail: null, otpPurpose: null, otpExpiresAt: null } });
      dispatch({ type: A.SET_AUTH_SCREEN, screen: 'forgot-password' });
    } else {
      dispatch({
        type: A.UPDATE_SETTINGS,
        patch: { pendingOtpId: null, pendingEmail: null, otpPurpose: null, otpExpiresAt: null },
      });
      dispatch({ type: A.SET_AUTH_SCREEN, screen: 'signup' });
    }
  }

  async function handleVerify() {
    if (!canVerify || loading) return;
    setError('');
    setLoading(true);
    try {
      if (awaitingPassword) {
        await authApi.resetPassword({ email, code, newPassword });
        setResetDone(true);
      } else if (isReset) {
        await authApi.verifyResetOtp({ email, code });
        setOtpConfirmed(true);
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
      if (e.errorCode === 'otp_expired') {
        setSecondsLeft(0);
      }
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!expired || loading || resending) return;
    setError('');
    setResending(true);
    try {
      const data = isReset ? await authApi.forgotPassword({ email }) : await authApi.resendOtp({ otpId: state.pendingOtpId });
      dispatch({
        type: A.UPDATE_SETTINGS,
        patch: {
          otpExpiresAt: Date.now() + data.expiresInSeconds * 1000,
          ...(isReset ? {} : { pendingOtpId: data.otpId }),
        },
      });
      setDigits(Array(CODE_LENGTH).fill(''));
      setOtpConfirmed(false);
      inputRefs.current[0]?.focus();
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setResending(false);
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
          <View style={s.topBar}>
            <Pressable onPress={handleBack} hitSlop={12} style={s.backBtn}>
              <ChevronLeftIcon size={16} color={colors.authHeading} />
            </Pressable>
          </View>

          <View style={s.header}>
            <LogoMark size={76} />
            <Text style={s.wordmark}>
              Spot<Text style={{ color: colors.primary }}> it</Text>
            </Text>
          </View>

          <View style={s.body}>
            <View style={s.iconBadge}>
              <EnvelopeIcon size={20} />
            </View>
            <Text style={s.title}>{awaitingPassword ? 'Create new password' : isReset ? 'Reset your password' : 'Enter the code'}</Text>
            {awaitingPassword ? (
              <Text style={s.sub}>
                Code verified ✓ Choose a new password for{'\n'}
                <Text style={s.subEmail}>{email || 'your email'}</Text>
              </Text>
            ) : (
              <Text style={s.sub}>
                We sent a {CODE_LENGTH}-digit code to{'\n'}
                <Text style={s.subEmail}>{email || 'your email'}</Text>
              </Text>
            )}

            {!awaitingPassword && (
              <View style={s.otpRow}>
                {digits.map((d, i) => (
                  <TextInput
                    key={i}
                    ref={el => {
                      inputRefs.current[i] = el;
                    }}
                    value={d}
                    onChangeText={v => setDigitAt(i, v)}
                    onKeyPress={e => onKeyPress(i, e)}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                    style={[s.otpBox, d && s.otpBoxFilled]}
                  />
                ))}
              </View>
            )}

            {awaitingPassword && (
              <View style={s.passwordForm}>
                <View style={s.field}>
                  <Text style={s.label}>New password</Text>
                  <View style={s.passRow}>
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPass}
                      style={[s.input, { flex: 1, borderBottomWidth: 0 }]}
                    />
                    <Pressable onPress={() => setShowPass(v => !v)} hitSlop={8}>
                      <Text style={s.showTx}>{showPass ? 'Hide' : 'Show'}</Text>
                    </Pressable>
                  </View>
                  <Text style={s.hint}>Min. 8 characters</Text>
                </View>
                <View style={s.field}>
                  <Text style={s.label}>Confirm password</Text>
                  <View style={[s.passRow, passwordsMismatch && { borderBottomColor: colors.error }]}>
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPass}
                      style={[s.input, { flex: 1, borderBottomWidth: 0 }]}
                    />
                    <Pressable onPress={() => setShowConfirmPass(v => !v)} hitSlop={8}>
                      <Text style={s.showTx}>{showConfirmPass ? 'Hide' : 'Show'}</Text>
                    </Pressable>
                  </View>
                  {passwordsMismatch && <Text style={s.errorTx}>Passwords don&apos;t match</Text>}
                </View>
              </View>
            )}

            {error ? <Text style={s.errorTx}>{error}</Text> : null}

            <Pressable
              disabled={!canVerify || loading}
              onPress={handleVerify}
              style={{ marginTop: 24, opacity: canVerify && !loading ? 1 : 0.5, alignSelf: 'stretch' }}
            >
              <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.ctaTx}>{awaitingPassword ? 'Reset Password' : isReset ? 'Verify Code' : 'Verify'}</Text>
                )}
              </LinearGradient>
            </Pressable>

            {!awaitingPassword && (
              <Pressable style={s.resendBtn} onPress={handleResend} disabled={!expired || resending}>
                <Text style={[s.resendTx, !expired && s.resendTxDisabled]}>
                  {resent
                    ? 'Code resent ✓'
                    : resending
                      ? 'Sending…'
                      : expired
                        ? "Didn't get it? Resend Code"
                        : `Resend code in ${formatCountdown(secondsLeft)}`}
                </Text>
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
    topBar: { paddingHorizontal: 18 },
    backBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.05)',
      alignSelf: 'flex-start',
    },
    header: { alignItems: 'center' },
    wordmark: { marginTop: 8, fontSize: 15, fontWeight: '600', color: c.authHeading },
    body: { paddingHorizontal: 26, paddingTop: 50, alignItems: 'center' },
    iconBadge: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(220,90,116,0.14)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    title: { fontSize: 23, fontWeight: '600', letterSpacing: -0.2, lineHeight: 27, color: c.authHeading, textAlign: 'center' },
    sub: { fontSize: 12, color: c.authBody, marginTop: 8, lineHeight: 18, textAlign: 'center' },
    subEmail: { color: c.authHeading, fontWeight: '700' },
    otpRow: { flexDirection: 'row', gap: 8, marginTop: 26 },
    otpBox: {
      width: 40,
      height: 52,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.authBorder,
      backgroundColor: c.authInputBg,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '300',
      color: c.authHeading,
    },
    otpBoxFilled: { borderColor: c.authHeading },
    passwordForm: { alignSelf: 'stretch', marginTop: 22 },
    field: { marginBottom: 8 },
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
    hint: { fontSize: 10.5, color: c.authLabel, marginTop: 7, lineHeight: 14 },
    errorTx: { fontSize: 11, color: c.error, fontWeight: '600', marginTop: 10, textAlign: 'center' },
    cta: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    ctaTx: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, color: '#fff' },
    resendBtn: { alignItems: 'center', marginTop: 24 },
    resendTx: { fontSize: 12, color: c.authAccent, fontWeight: '700' },
    resendTxDisabled: { color: c.authLabel, fontWeight: '600' },
  });
}
