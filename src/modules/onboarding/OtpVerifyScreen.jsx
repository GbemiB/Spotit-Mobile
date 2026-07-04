import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useRef, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme } from '../../shared/styles/index.js';
import Button from '../../components/ui/Button.jsx';

const CODE_LENGTH = 6;

export default function OtpVerifyScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [resent, setResent] = useState(false);
  const inputRefs = useRef([]);

  const code = digits.join('');
  const canVerify = code.length === CODE_LENGTH;

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

  function handleVerify() {
    dispatch({ type: A.SET_AUTH_SCREEN, screen: 'login' });
  }

  function handleResend() {
    setDigits(Array(CODE_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    setResent(true);
    setTimeout(() => setResent(false), 3000);
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
        <Pressable onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'forgot-password' })} style={s.back}>
          <Text style={s.backTx}>← Back</Text>
        </Pressable>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headline}>Enter verification code</Text>
          <Text style={s.sub}>
            We sent a {CODE_LENGTH}-digit code to{'\n'}
            <Text style={s.subEmail}>{state.resetEmail || 'your email'}</Text>
          </Text>
        </View>

        {/* OTP boxes */}
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

        <View style={s.form}>
          <View style={s.ctaWrap}>
            <Button onPress={handleVerify} disabled={!canVerify}>Verify code</Button>
          </View>

          <Pressable style={s.resendBtn} onPress={handleResend}>
            <Text style={s.resendTx}>{resent ? 'Code resent ✓' : "Didn't get a code? Resend"}</Text>
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
    subEmail: { color: c.textPrimary, fontWeight: '700' },
    otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingHorizontal: 24, marginBottom: 28 },
    otpBox: {
      width: 46, height: 54, borderRadius: 14, borderWidth: 1.5, borderColor: c.border,
      backgroundColor: c.surface, textAlign: 'center', fontSize: 20, fontWeight: '700', color: c.textPrimary,
    },
    otpBoxFilled: { borderColor: c.primary },
    form: { paddingHorizontal: 24, gap: 16 },
    ctaWrap: { marginTop: 0 },
    resendBtn: { alignItems: 'center', paddingVertical: 4 },
    resendTx: { fontSize: 12, color: c.primary, fontWeight: '700' },
  });
}
