import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useState, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import { CheckIcon } from '../../components/ui/icons.jsx';
import LogoMark from '../../components/ui/LogoMark.jsx';
import * as authApi from '../../shared/api/auth.js';
import TermsScreen from './TermsScreen.jsx';
export default function SignupScreen() {
  const { dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const canSubmit = firstName.trim() && lastName.trim() && email.trim() && agreed;
  async function handleCreate() {
    if (!canSubmit || loading) return;
    setError('');
    setLoading(true);
    try {
      const data = await authApi.signup({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      if (fullName) dispatch({ type: A.ONBOARD_FIELD, field: 'name', value: fullName });
      dispatch({
        type: A.UPDATE_SETTINGS,
        patch: {
          pendingOtpId: data.otpId,
          pendingEmail: email.trim(),
          otpPurpose: 'signup',
          otpExpiresAt: Date.now() + data.expiresInSeconds * 1000,
        },
      });
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
            <LogoMark size={85} />
            <Text style={s.wordmark}>
              Spot
              <Text style={{ color: colors.primary }}> it</Text>
            </Text>
          </View>

          <View style={s.body}>
            <Text style={s.title}>Create your account</Text>

            <View style={s.form}>
              <View style={s.field}>
                <Text style={s.label}>First name</Text>
                <TextInput value={firstName} onChangeText={setFirstName} placeholder="" style={s.input} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Last name</Text>
                <TextInput value={lastName} onChangeText={setLastName} placeholder="" style={s.input} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder=""
                  style={s.input}
                />
              </View>
            </View>
            <Text style={s.hint}>We&apos;ll email you a code to verify this address — you&apos;ll set a password after that.</Text>

            <Pressable style={s.agreeRow} onPress={() => setAgreed(v => !v)}>
              <View style={[s.checkbox, agreed && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                {agreed && <CheckIcon size={11} color="#fff" />}
              </View>
              <Text style={s.agreeTx}>
                I agree to the{' '}
                <Text style={s.agreeLink} onPress={() => setShowTerms(true)}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text style={s.agreeLink} onPress={() => setShowTerms(true)}>
                  Privacy Policy
                </Text>
              </Text>
            </Pressable>

            <TermsScreen
              visible={showTerms}
              onAgree={() => {
                setAgreed(true);
                setShowTerms(false);
              }}
              onClose={() => setShowTerms(false)}
            />

            {error ? <Text style={s.errorTx}>{error}</Text> : null}

            <Pressable
              disabled={!canSubmit || loading}
              onPress={handleCreate}
              style={{ marginTop: 16, opacity: canSubmit && !loading ? 1 : 0.5 }}
            >
              <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.ctaTx}>Continue</Text>}
              </LinearGradient>
            </Pressable>

            <View style={s.footer}>
              <Text style={s.footerTx}>Already have an account? </Text>
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
    wordmark: { marginTop: 8, fontSize: 20, fontWeight: '600', color: c.authHeading },
    body: { paddingHorizontal: 26, paddingTop: 8 },
    title: {
      fontSize: 26,
      fontWeight: '600',
      letterSpacing: -0.2,
      lineHeight: 29,
      color: c.authHeading,
      textAlign: 'center',
      marginTop: 20,
    },
    form: { marginTop: 30 },
    field: { marginBottom: 15 },
    label: { fontSize: 10, letterSpacing: 1, color: c.authLabel, textTransform: 'uppercase', fontWeight: '600' },
    input: {
      fontSize: 12,
      fontWeight: '400',
      color: c.authHeading,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.authBorderStrong,
    },
    hint: { fontSize: 10.5, color: c.authLabel, marginTop: 7, lineHeight: 14 },
    errorTx: { fontSize: 11, color: c.error, fontWeight: '600', marginTop: 10, textAlign: 'center' },
    agreeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, marginTop: 10, fontSize: 10 },
    checkbox: {
      width: 15,
      height: 15,
      borderRadius: 2,
      borderWidth: 1.5,
      borderColor: c.primary,
      marginTop: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    agreeTx: { flex: 1, fontSize: 11.5, color: c.textSecondary, lineHeight: 17 },
    agreeLink: { color: c.authAccent, fontWeight: '700' },
    cta: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    ctaTx: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, color: '#fff' },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, paddingTop: 14 },
    footerTx: { fontSize: 12, color: c.authBody },
    footerLink: { fontSize: 12, color: c.authAccent, fontWeight: '700' },
  });
}
