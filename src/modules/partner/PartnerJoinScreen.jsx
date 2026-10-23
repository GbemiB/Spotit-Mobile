import { View, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet } from 'react-native';
import { useState, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import LogoMark from '../../components/ui/LogoMark.jsx';
import * as authApi from '../../shared/api/auth.js';
import * as partnerApi from '../../shared/api/partner.js';
import { normalizeInviteCode } from '../../shared/utils/partner.js';
const CODE_LENGTH = 6;
export default function PartnerJoinScreen({ ownerFirstName, onOwnCycle, onBack, onJoined }) {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const herName = ownerFirstName || 'Your partner';
  const [code, setCode] = useState('');
  const [nickname, setNickname] = useState(ownerFirstName || '');
  const [codeError, setCodeError] = useState('');
  const [nameError, setNameError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function join() {
    if (loading) return;
    const cleanCode = normalizeInviteCode(code);
    const name = nickname.trim();
    setError('');
    setCodeError(cleanCode.length === CODE_LENGTH ? '' : 'Enter the 6-character code from your email.');
    setNameError(name ? '' : 'Please enter a name.');
    if (cleanCode.length !== CODE_LENGTH || !name) return;
    setLoading(true);
    try {
      await partnerApi.acceptPartnerInvite({ code: cleanCode, nickname: name }, state.accessToken);
    } catch (e) {
      setLoading(false);
      if (e.errorCode === 'invalid_code') setCodeError(e.message);
      else setError(e.message);
      return;
    }
    let accessToken = state.accessToken;
    try {
      const tokens = await authApi.refresh({ refreshToken: state.refreshToken });
      accessToken = tokens.accessToken;
    } catch {}
    setLoading(false);
    dispatch({ type: A.PARTNER_JOINED, accessToken });
    if (onJoined) onJoined();
  }
  return (
    <LinearGradient colors={colors.authGradient} start={{ x: 0, y: 0 }} end={{ x: 0.35, y: 1 }} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 30, paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.header}>
            <LogoMark size={60} />
            <Text style={s.wordmark}>
              Spot
              <Text style={{ color: colors.primary }}> it</Text>
            </Text>
          </View>
          <View style={s.body}>
            <Text style={s.title}>{`${herName} invited you`}</Text>
            <Text style={s.subtitle}>She wants to share her cycle with you. Enter the code from your email to join.</Text>
            <View style={s.form}>
              <View style={s.field}>
                <Text style={s.label}>Invite code</Text>
                <TextInput
                  value={code}
                  onChangeText={text => {
                    setCode(text.toUpperCase());
                    if (codeError) setCodeError('');
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={12}
                  style={[s.input, s.codeInput, codeError && { borderBottomColor: colors.error }]}
                />
                {codeError ? <Text style={s.fieldErrorTx}>{codeError}</Text> : null}
              </View>
              <View style={s.field}>
                <Text style={s.label}>What do you call her?</Text>
                <TextInput
                  value={nickname}
                  onChangeText={text => {
                    setNickname(text);
                    if (nameError) setNameError('');
                  }}
                  maxLength={40}
                  returnKeyType="done"
                  onSubmitEditing={join}
                  style={[s.input, nameError && { borderBottomColor: colors.error }]}
                />
                {nameError ? (
                  <Text style={s.fieldErrorTx}>{nameError}</Text>
                ) : (
                  <Text
                    style={s.hint}
                  >{`Shown in the app and in your reminders, e.g. “${nickname.trim() || herName}'s period is expected to start in 5 days.”`}</Text>
                )}
              </View>
            </View>
            {error ? <Text style={s.errorTx}>{error}</Text> : null}
            <Pressable disabled={loading} onPress={join} style={{ marginTop: 18, opacity: loading ? 0.6 : 1 }}>
              <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.ctaTx}>{`Join ${nickname.trim() || herName}`}</Text>}
              </LinearGradient>
            </Pressable>
          </View>
          {onOwnCycle ? (
            <View style={s.footer}>
              <Text style={s.footerTx}>Not here as a partner? </Text>
              <Pressable onPress={onOwnCycle} disabled={loading}>
                <Text style={s.footerLink}>Set up my own cycle</Text>
              </Pressable>
            </View>
          ) : null}
          {onBack ? (
            <View style={s.footer}>
              <Pressable onPress={onBack} disabled={loading}>
                <Text style={s.footerLink}>Back</Text>
              </Pressable>
            </View>
          ) : null}
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
      lineHeight: 31,
      color: c.authHeading,
      textAlign: 'center',
      marginTop: 20,
    },
    subtitle: { fontSize: 12, color: c.authBody, textAlign: 'center', lineHeight: 19, marginTop: 10 },
    form: { marginTop: 30 },
    field: { marginBottom: 20 },
    label: { fontSize: 10, letterSpacing: 1, color: c.authLabel, textTransform: 'uppercase', fontWeight: '600' },
    input: {
      fontSize: 12,
      fontWeight: '400',
      color: c.authHeading,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.authBorderStrong,
    },
    codeInput: { fontSize: 20, fontWeight: '700', letterSpacing: 6 },
    hint: { fontSize: 10.5, color: c.authLabel, marginTop: 7, lineHeight: 15 },
    fieldErrorTx: { fontSize: 10.5, color: c.error, fontWeight: '600', marginTop: 5 },
    errorTx: { fontSize: 11, color: c.error, fontWeight: '600', marginTop: 4, textAlign: 'center' },
    cta: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    ctaTx: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, color: '#fff' },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', paddingTop: 24 },
    footerTx: { fontSize: 12, color: c.authBody },
    footerLink: { fontSize: 12, color: c.authAccent, fontWeight: '700' },
  });
}
