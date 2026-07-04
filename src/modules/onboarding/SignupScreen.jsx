import { View, Text, Image, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, brandFixed } from '../../shared/styles/index.js';

export default function SignupScreen() {
  const { dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  function handleSocialSignup() {
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
          <Image source={require('../../../assets/splash.png')} style={s.logoImg} resizeMode="contain" />
          <Text style={s.headline}>Create your account</Text>
          <Text style={s.sub}>Your cycle journey starts here.</Text>
        </View>

        {/* Social */}
        <View style={s.social}>
          <Pressable style={s.socialBtn} onPress={handleSocialSignup}>
            <Text style={s.socialIcon}>G</Text>
            <Text style={s.socialTx}>Continue with Google</Text>
          </Pressable>
          <Pressable style={[s.socialBtn, s.appleBtn]} onPress={handleSocialSignup}>
            <Text style={[s.socialIcon, { color: colors.white }]}></Text>
            <Text style={[s.socialTx, { color: colors.white }]}>Continue with Apple</Text>
          </Pressable>
        </View>

        {/* Sign up with email */}
        <Pressable
          style={s.dividerRow}
          onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'signup-email' })}
        >
          <View style={s.dividerLine} />
          <Text style={s.dividerTxActive}>or sign up with email</Text>
          <View style={s.dividerLine} />
        </Pressable>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerTx}>Already have an account? </Text>
          <Pressable onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'login' })}>
            <Text style={s.footerLink}>Log in</Text>
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
    header: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, marginBottom: 32 },
    logoImg: { width: 48, height: 48, marginBottom: 18 },
    headline: { fontSize: 18, fontWeight: '600', color: c.textPrimary, letterSpacing: -0.5, lineHeight: 24, textAlign: 'center', marginBottom: 8 },
    sub: { fontSize: 14, fontWeight: '400', color: c.textMuted, lineHeight: 24, textAlign: 'center' },
    social: { paddingHorizontal: 24, gap: 12 },
    socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1.5, borderColor: c.border, borderRadius: 16, paddingVertical: 15, backgroundColor: c.surface },
    appleBtn: { backgroundColor: brandFixed.apple, borderColor: brandFixed.apple },
    socialIcon: { fontSize: 12, fontWeight: '800', color: c.textPrimary, width: 22, textAlign: 'center' },
    socialTx: { fontSize: 12, fontWeight: '600', color: c.textPrimary },
    dividerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, marginVertical: 22, gap: 12 },
    dividerLine: { flex: 1, height: 1, backgroundColor: c.border },
    dividerTxActive: { fontSize: 12, color: c.primary, fontWeight: '700' },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
    footerTx: { fontSize: 12, color: c.textMuted },
    footerLink: { fontSize: 12, color: c.primary, fontWeight: '700' },
  });
}
