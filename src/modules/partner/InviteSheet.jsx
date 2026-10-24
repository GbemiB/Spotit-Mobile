import { View, StyleSheet } from 'react-native';
import { useMemo, useState } from 'react';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import Button from '../../components/ui/Button.jsx';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
import { isValidEmail } from '../../shared/utils/validation.js';
export default function InviteSheet({ open, onClose, onSend, busy }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  function close() {
    setEmail('');
    setEmailError('');
    onClose();
  }
  async function send() {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (await onSend(trimmed)) close();
  }
  return (
    <BottomSheet open={open} onClose={close} title="Invite your partner" avoidKeyboard>
      <View style={s.sheetBody}>
        <Text style={s.label}>{"Partner's email"}</Text>
        <TextInput
          value={email}
          onChangeText={text => {
            setEmail(text);
            if (emailError) setEmailError('');
          }}
          placeholder="name@email.com"
          placeholderTextColor={colors.textFaint}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          returnKeyType="send"
          onSubmitEditing={send}
          style={[s.input, emailError ? { borderColor: colors.error } : null]}
        />
        {emailError ? <Text style={s.errorTx}>{emailError}</Text> : null}
        <View style={s.hint}>
          <Text style={s.body}>
            We&apos;ll email them a 6-character code. It only works for this email address and expires in 48 hours. Once they join, they see
            everything you track, read-only.
          </Text>
        </View>
        <Button onPress={send} disabled={busy}>
          {busy ? 'Sending…' : 'Send invite'}
        </Button>
      </View>
    </BottomSheet>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    sheetBody: { gap: 12 },
    label: { fontSize: 11, fontWeight: '600', color: c.textSecondary },
    input: {
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      fontSize: 12.5,
      color: c.textPrimary,
      backgroundColor: c.surface,
    },
    errorTx: { fontSize: 10, color: c.error, fontWeight: '600' },
    hint: { backgroundColor: c.surface, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 14 },
    body: { fontSize: 10.5, color: c.textSecondary, lineHeight: 17, marginTop: 4 },
  });
}
