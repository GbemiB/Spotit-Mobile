import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useState, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import LogoMark from '../../components/ui/LogoMark.jsx';
import { GoogleIcon, AppleIcon } from '../../components/ui/icons.jsx';

export default function LoginScreen() {
  const { dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  function handleLogin() {
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
            <Text style={s.title}>Welcome back.</Text>

            <View style={s.form}>
              <View style={s.field}>
                <Text style={s.label}>Email</Text>
                <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={s.input} />
              </View>
              <View style={s.field}>
                <Text style={s.label}>Password</Text>
                <View style={s.passRow}>
                  <TextInput value={password} onChangeText={setPassword} secureTextEntry={!showPass} style={[s.input, { flex: 1, borderBottomWidth: 0, paddingVertical: 0 }]} />
                  <Pressable onPress={() => setShowPass(v => !v)} hitSlop={8}>
                    <Text style={s.showTx}>{showPass ? 'Hide' : 'Show'}</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <Pressable style={s.forgotBtn} onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'forgot-password' })}>
              <Text style={s.forgotTx}>Forgot password?</Text>
            </Pressable>

            <Pressable onPress={handleLogin} style={{ marginTop: 16 }}>
              <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
                <Text style={s.ctaTx}>Login</Text>
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
    wordmark: { marginTop: 8, fontSize: 15, fontWeight: '600', color: c.authHeading },
    body: { paddingHorizontal: 26, paddingTop: 20 },
    title: { fontSize: 25, fontWeight: '600', letterSpacing: -0.2, lineHeight: 29, color: c.authHeading, textAlign: 'center' },
    form: { marginTop: 24 },
    field: { marginBottom: 18 },
    label: { fontSize: 10, letterSpacing: 1, color: c.authLabel, textTransform: 'uppercase', fontWeight: '700' },
    input: { fontSize: 15, fontWeight: '600', color: c.authHeading, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.authBorder },
    passRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: c.authBorder },
    showTx: { fontSize: 11.5, color: c.primaryDark, fontWeight: '700' },
    forgotBtn: { alignItems: 'flex-end', marginTop: 10 },
    forgotTx: { fontSize: 11.5, fontWeight: '700', color: c.primaryDark },
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
