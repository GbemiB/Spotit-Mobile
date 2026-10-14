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
const CODE_LENGTH = 4;
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
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resetDone, setResetDone] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const [otpConfirmed, setOtpConfirmed] = useState(false);
  const [signupVerified, setSignupVerified] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(() => remainingSeconds(state.otpExpiresAt));
  const codeInputRef = useRef(null);
  const scrollRef = useRef(null);
  function scrollPasswordIntoView() {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
  }
  const codeComplete = code.length === CODE_LENGTH;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword.trim() !== confirmPassword.trim();
  const awaitingPassword = (isReset && otpConfirmed) || (!isReset && signupVerified);
  const canVerify = awaitingPassword ? newPassword.length >= 8 && !passwordsMismatch : codeComplete;
  const expired = secondsLeft <= 0;
  useEffect(() => {
    setSecondsLeft(remainingSeconds(state.otpExpiresAt));
    const id = setInterval(() => setSecondsLeft(remainingSeconds(state.otpExpiresAt)), 1000);
    return () => clearInterval(id);
  }, [state.otpExpiresAt]);
  function onCodeChange(value) {
    const next = value.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH);
    setCode(next);
    if (next.length === CODE_LENGTH && next !== code && !awaitingPassword) handleVerify(next);
  }
  function handleBack() {
    if (isReset) {
      dispatch({ type: A.UPDATE_SETTINGS, patch: { resetEmail: null, otpPurpose: null, otpExpiresAt: null } });
      dispatch({ type: A.SET_AUTH_SCREEN, screen: 'forgot-password' });
    } else {
      dispatch({ type: A.UPDATE_SETTINGS, patch: { pendingOtpId: null, pendingEmail: null, otpPurpose: null, otpExpiresAt: null } });
      dispatch({ type: A.SET_AUTH_SCREEN, screen: state.otpPurpose === 'login_verify' ? 'login' : 'signup' });
    }
  }
  async function handleVerify(enteredCode = code) {
    const ready = awaitingPassword ? canVerify : enteredCode.length === CODE_LENGTH;
    if (!ready || loading) return;
    setError('');
    setLoading(true);
    try {
      if (awaitingPassword) {
        if (isReset) {
          await authApi.resetPassword({ email, code: enteredCode, newPassword: newPassword.trim() });
          setResetDone(true);
        } else {
          await authApi.completeSignup({ leadId: state.pendingOtpId, password: newPassword.trim() });
          setSignupDone(true);
        }
      } else if (isReset) {
        await authApi.verifyResetOtp({ email, code: enteredCode });
        setOtpConfirmed(true);
      } else if (state.otpPurpose === 'login_verify') {
        const data = await authApi.verifyLoginOtp({ otpId: state.pendingOtpId, code: enteredCode });
        dispatch({
          type: A.AUTH_SUCCESS,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          userId: data.user.userId,
          onboarded: data.user.onboarded,
        });
      } else {
        await authApi.verifyOtp({ otpId: state.pendingOtpId, code: enteredCode });
        setSignupVerified(true);
      }
    } catch (e) {
      if (e.errorCode === 'otp_expired') {
        setSecondsLeft(0);
      }
      if (e.errorCode === 'invalid_code') {
        setCode('');
        codeInputRef.current?.focus();
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
        patch: { otpExpiresAt: Date.now() + data.expiresInSeconds * 1000, ...(isReset ? {} : { pendingOtpId: data.otpId }) },
      });
      setCode('');
      setOtpConfirmed(false);
      setSignupVerified(false);
      codeInputRef.current?.focus();
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
          ref={scrollRef}
          contentContainerStyle={{
            paddingTop: insets.top + 30,
            paddingBottom: insets.bottom + (awaitingPassword ? 160 : 30),
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.topBar}>
            <Pressable onPress={handleBack} hitSlop={12} style={s.backBtn}>
              <ChevronLeftIcon size={16} color={colors.authHeading} />
            </Pressable>
          </View>

          <View style={s.header}>
            <LogoMark size={60} />
            <Text style={s.wordmark}>
              Spot
              <Text style={{ color: colors.primary }}> it</Text>
            </Text>
          </View>

          <View style={s.body}>
            <Text style={s.title}>
              {awaitingPassword
                ? isReset
                  ? 'Create new password'
                  : 'Create your password'
                : isReset
                  ? 'Reset your password'
                  : 'Enter the code'}
            </Text>
            {awaitingPassword ? (
              <Text style={s.sub}>
                {isReset ? 'Choose a new password for' : 'Choose a password to finish creating your account for'}
                {'\n'}
                <Text style={s.subEmail}>{email || 'your email'}</Text>
              </Text>
            ) : (
              <Text style={s.sub}>
                We sent a {CODE_LENGTH}-digit code to{'\n'}
                <Text style={s.subEmail}>{email || 'your email'}</Text>
              </Text>
            )}

            {!awaitingPassword && (
              <Pressable style={s.otpRow} onPress={() => codeInputRef.current?.focus()}>
                {Array.from({ length: CODE_LENGTH }, (_, i) => (
                  <View key={i} style={[s.otpBox, code[i] && s.otpBoxFilled]}>
                    <Text style={s.otpDigit}>{code[i] || ''}</Text>
                  </View>
                ))}
                <TextInput
                  ref={codeInputRef}
                  value={code}
                  onChangeText={onCodeChange}
                  maxLength={CODE_LENGTH}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                  autoFocus
                  caretHidden
                  style={s.otpHiddenInput}
                />
              </Pressable>
            )}

            {awaitingPassword && (
              <View style={s.passwordForm}>
                <View style={s.field}>
                  <Text style={s.label}>New password</Text>
                  <View style={s.passRow}>
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      onFocus={scrollPasswordIntoView}
                      secureTextEntry={!showPass}
                      autoCorrect={false}
                      autoCapitalize="none"
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
                      onFocus={scrollPasswordIntoView}
                      secureTextEntry={!showConfirmPass}
                      autoCorrect={false}
                      autoCapitalize="none"
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
              onPress={() => handleVerify()}
              style={{ marginTop: 24, opacity: canVerify && !loading ? 1 : 0.5, alignSelf: 'stretch' }}
            >
              <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.ctaTx}>
                    {awaitingPassword ? (isReset ? 'Reset Password' : 'Create Account') : isReset ? 'Verify Code' : 'Verify'}
                  </Text>
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

      <StatusModal
        visible={signupDone}
        variant="success"
        title="Account created"
        subtitle="Please log in with your new credentials to continue."
        ctaLabel="Go to Login"
        onCta={() => {
          dispatch({ type: A.UPDATE_SETTINGS, patch: { pendingOtpId: null, pendingEmail: null, otpPurpose: null, otpExpiresAt: null } });
          dispatch({ type: A.SET_AUTH_SCREEN, screen: 'login' });
        }}
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
    wordmark: { marginTop: 8, fontSize: 20, fontWeight: '600', color: c.authHeading },
    body: { paddingHorizontal: 26, paddingTop: 25, alignItems: 'center' },
    iconBadge: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(220,90,116,0.14)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    title: { fontSize: 23, fontWeight: '600', letterSpacing: -0.2, lineHeight: 27, color: c.authHeading, textAlign: 'center' },
    sub: { fontSize: 12, color: c.authBody, marginTop: 10, marginBottom: 10, lineHeight: 18, textAlign: 'center' },
    subEmail: { color: c.authHeading, fontWeight: '700' },
    otpRow: { flexDirection: 'row', gap: 12, marginTop: 26 },
    otpBox: {
      width: 56,
      height: 62,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.authBorder,
      backgroundColor: c.authInputBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    otpDigit: { fontSize: 24, fontWeight: '300', color: c.authHeading },
    otpBoxFilled: { borderColor: c.authHeading },
    otpHiddenInput: { ...StyleSheet.absoluteFillObject, opacity: 0, color: 'transparent' },
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
