import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useState, useRef, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import LogoMark from '../../components/ui/LogoMark.jsx';
import { EnvelopeIcon } from '../../components/ui/icons.jsx';

const CODE_LENGTH = 4;

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
            <Text style={s.title}>Enter the code</Text>
            <Text style={s.sub}>We sent a {CODE_LENGTH}-digit code to{'\n'}<Text style={s.subEmail}>{state.resetEmail || 'your email'}</Text></Text>

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

            <Pressable disabled={!canVerify} onPress={handleVerify} style={{ marginTop: 24, opacity: canVerify ? 1 : 0.5, alignSelf: 'stretch' }}>
              <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
                <Text style={s.ctaTx}>Verify</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={s.resendBtn} onPress={handleResend}>
              <Text style={s.resendTx}>{resent ? 'Code resent ✓' : "Didn't get it? Resend Code"}</Text>
            </Pressable>
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
    body: { paddingHorizontal: 26, paddingTop: 24, alignItems: 'center' },
    iconBadge: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(220,90,116,0.14)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    title: { fontSize: 23, fontWeight: '600', letterSpacing: -0.2, lineHeight: 27, color: c.authHeading, textAlign: 'center' },
    sub: { fontSize: 12, color: c.authBody, marginTop: 8, lineHeight: 18, textAlign: 'center' },
    subEmail: { color: c.authHeading, fontWeight: '700' },
    otpRow: { flexDirection: 'row', gap: 10, marginTop: 26 },
    otpBox: {
      width: 44, height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: c.authBorder,
      backgroundColor: '#fff', textAlign: 'center', fontSize: 20, fontWeight: '700', color: c.authHeading,
    },
    otpBoxFilled: { borderColor: c.authHeading },
    cta: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    ctaTx: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, color: '#fff' },
    resendBtn: { alignItems: 'center', marginTop: 24 },
    resendTx: { fontSize: 12, color: c.primaryDark, fontWeight: '700' },
  });
}
