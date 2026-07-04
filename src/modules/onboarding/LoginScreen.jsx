import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, brandFixed } from '../../shared/styles/index.js';
import Button from '../../components/ui/Button.jsx';

export default function LoginScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  function handleLogin() {
    dispatch({ type: A.SET_AUTH_SCREEN, screen: null });
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
        <Pressable onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'welcome' })} style={s.back}>
          <Text style={s.backTx}>← Back</Text>
        </Pressable>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headline}>Welcome back.</Text>
          <Text style={s.sub}>Log in to pick up your cycle where you left off.</Text>
        </View>

        {/* Form */}
        <View style={s.form}>
          <View style={s.field}>
            <Text style={s.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.textFaint}
              keyboardType="email-address"
              autoCapitalize="none"
              style={s.input}
            />
          </View>
          <View style={s.field}>
            <Text style={s.label}>Password</Text>
            <View style={s.passWrap}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor={colors.textFaint}
                secureTextEntry={!showPass}
                style={[s.input, { flex: 1, borderWidth: 0, padding: 0 }]}
              />
              <Pressable onPress={() => setShowPass(v => !v)}>
                <Text style={s.showTx}>{showPass ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ marginTop: 8 }}>
            <Button onPress={handleLogin}>Log in </Button>
          </View>

          <Pressable style={s.forgotBtn} onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'forgot-password' })}>
            <Text style={s.forgotTx}>Forgot password?</Text>
          </Pressable>
        </View>

        {/* Divider */}
        <View style={s.dividerRow}>
          <View style={s.dividerLine} />
          <Text style={s.dividerTx}>or</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Social */}
        <View style={s.social}>
          <Pressable style={s.socialBtn} onPress={handleLogin}>
            <Text style={s.socialIcon}>G</Text>
            <Text style={s.socialTx}>Continue with Google</Text>
          </Pressable>
          <Pressable style={[s.socialBtn, s.appleBtn]} onPress={handleLogin}>
            <Text style={[s.socialIcon, { color: colors.white }]}></Text>
            <Text style={[s.socialTx, { color: colors.white }]}>Continue with Apple</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerTx}>New here? </Text>
          <Pressable onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'signup' })}>
            <Text style={[s.footerTx, { color: colors.primary, fontWeight: '700' }]}>Sign up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    back: { paddingHorizontal: 24, marginBottom: 8 },
    backTx: { fontSize: 12, color: c.textMuted, fontWeight: '500' },
    header: { paddingHorizontal: 24, marginBottom: 32 },
    logoMark: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    logoDrop: { width: 16, height: 22, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, backgroundColor: c.white, transform: [{ rotate: '180deg' }] },
    headline: { fontSize: 32, fontWeight: '800', color: c.textPrimary, letterSpacing: -0.5, marginBottom: 8 },
    sub: { fontSize: 12, color: c.textMuted, lineHeight: 22 },
    form: { paddingHorizontal: 24, gap: 16 },
    field: { gap: 8 },
    label: { fontSize: 12, fontWeight: '700', color: c.textSecondary },
    input: { borderWidth: 1.5, borderColor: c.border, borderRadius: 16, padding: 14, fontSize: 12, color: c.textPrimary, backgroundColor: c.surface },
    passWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: c.border, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14, backgroundColor: c.surface, gap: 8 },
    showTx: { fontSize: 12, color: c.primary, fontWeight: '700' },
    forgotBtn: { alignItems: 'center', paddingVertical: 4 },
    forgotTx: { fontSize: 12, color: c.textMuted },
    dividerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginVertical: 24, gap: 12 },
    dividerLine: { flex: 1, height: 1, backgroundColor: c.border },
    dividerTx: { fontSize: 12, color: c.textFaint, fontWeight: '600' },
    social: { paddingHorizontal: 24, gap: 12 },
    socialBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: c.border, borderRadius: 16, padding: 14, backgroundColor: c.surface },
    appleBtn: { backgroundColor: brandFixed.apple, borderColor: brandFixed.apple },
    socialIcon: { fontSize: 12, fontWeight: '800', color: c.textPrimary, width: 22, textAlign: 'center' },
    socialTx: { fontSize: 12, fontWeight: '600', color: c.textPrimary },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 32 },
    footerTx: { fontSize: 12, color: c.textMuted },
  });
}
