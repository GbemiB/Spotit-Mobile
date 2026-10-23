import { View, Pressable, StyleSheet, AppState } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import SectionHeader from '../../components/ui/SectionHeader.jsx';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import * as partnerApi from '../../shared/api/partner.js';
import { ownerCard, expiryLabel } from '../../shared/utils/partner.js';
import { isValidEmail } from '../../shared/utils/validation.js';
export default function PartnerSection() {
  const { state, dispatch } = useApp();
  const { accessToken } = state;
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [status, setStatus] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmStop, setConfirmStop] = useState(false);
  const toast = useCallback((icon, text) => dispatch({ type: A.SHOW_TOAST, icon, text }), [dispatch]);
  const load = useCallback(() => {
    partnerApi
      .getPartnerStatus(accessToken)
      .then(setStatus)
      .catch(() => {});
  }, [accessToken]);
  useEffect(() => {
    load();
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') load();
    });
    return () => sub.remove();
  }, [load]);
  async function run(task) {
    if (busy) return;
    setBusy(true);
    try {
      await task();
    } catch (e) {
      toast('🌸', e.message);
    } finally {
      setBusy(false);
    }
  }
  function openSheet() {
    setEmail('');
    setEmailError('');
    setSheetOpen(true);
  }
  function sendInvite() {
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    run(async () => {
      const next = await partnerApi.invitePartner(trimmed, accessToken);
      setStatus(next);
      setSheetOpen(false);
      toast('💌', `Invite sent to ${next.inviteEmail}`);
    });
  }
  function resend() {
    run(async () => {
      const next = await partnerApi.resendPartnerInvite(accessToken);
      setStatus(next);
      toast('💌', `A new code is on its way to ${next.inviteEmail}`);
    });
  }
  function cancelInvite() {
    run(async () => {
      await partnerApi.cancelPartnerInvite(accessToken);
      load();
      toast('🌸', 'Invite cancelled.');
    });
  }
  function stopSharing() {
    run(async () => {
      await partnerApi.stopPartnerSharing(accessToken);
      setConfirmStop(false);
      load();
      toast('🌸', 'Sharing stopped.');
    });
  }
  const card = ownerCard(status);
  if (card === 'loading' || card === 'hidden') return null;
  const partnerName = status.partnerFirstName || 'your partner';
  return (
    <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
      <SectionHeader title="Partner" />
      {card === 'none' && (
        <Card style={s.card}>
          <View style={s.intro}>
            <View style={[s.iconTile, { backgroundColor: colors.primarySoft }]}>
              <Text style={s.iconTx}>💞</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Share with your partner</Text>
              <Text style={s.body}>
                {
                  "Your partner will see everything you track: your cycle, predictions and every day you log, including notes and intimacy. They can't change anything, and you can stop sharing at any time."
                }
              </Text>
            </View>
          </View>
          <Button onPress={openSheet}>Invite partner</Button>
        </Card>
      )}
      {(card === 'pending' || card === 'expired') && (
        <Card style={s.card}>
          <View style={s.intro}>
            <View style={[s.iconTile, { backgroundColor: colors.tertiarySoft }]}>
              <Text style={s.iconTx}>✉️</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={s.titleRow}>
                <Text style={s.title}>{card === 'pending' ? 'Invite sent' : 'Invite expired'}</Text>
                <View style={[s.pill, { backgroundColor: card === 'pending' ? colors.tertiarySoft : colors.border }]}>
                  <Text style={[s.pillTx, { color: card === 'pending' ? colors.tertiaryDeep : colors.textSecondary }]}>
                    {card === 'pending' ? 'Pending' : 'Expired'}
                  </Text>
                </View>
              </View>
              <Text style={s.email} numberOfLines={1}>
                {status.inviteEmail}
              </Text>
              <Text style={s.body}>
                {card === 'pending'
                  ? `Code expires ${expiryLabel(status.inviteExpiresAt)}. Ask them to install Spot it and tap “I have a partner invite”.`
                  : 'The code is no longer valid. Send a new one to the same email.'}
              </Text>
            </View>
          </View>
          <View style={s.actions}>
            <View style={{ flex: 1 }}>
              <Button variant="secondary" size="sm" onPress={resend} disabled={busy}>
                {card === 'pending' ? 'Resend' : 'Send again'}
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button variant="ghost" size="sm" onPress={cancelInvite} disabled={busy}>
                Cancel invite
              </Button>
            </View>
          </View>
        </Card>
      )}
      {card === 'active' && (
        <>
          <Card style={s.listCard}>
            <View style={s.row}>
              <Avatar name={partnerName} size={36} />
              <View style={{ flex: 1 }}>
                <Text style={s.rowLabel}>{`Shared with ${partnerName}`}</Text>
                <Text style={s.rowSub}>Sees everything you track, read-only</Text>
              </View>
            </View>
            <Pressable style={[s.row, { borderBottomWidth: 0 }]} onPress={() => setConfirmStop(true)}>
              <Text style={[s.rowLabel, { color: colors.error }]}>Stop sharing</Text>
            </Pressable>
          </Card>
          <Text style={s.footNote}>
            {`${partnerName} can see your cycle, predictions and every day you log, including notes and intimacy. ${partnerName} can't change anything.`}
          </Text>
        </>
      )}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Invite your partner" avoidKeyboard>
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
            onSubmitEditing={sendInvite}
            style={[s.input, emailError ? { borderColor: colors.error } : null]}
          />
          {emailError ? <Text style={s.errorTx}>{emailError}</Text> : null}
          <View style={s.hint}>
            <Text style={s.body}>
              We&apos;ll email them a 6-character code. It only works for this email address and expires in 48 hours. Once they join, they
              see everything you track, read-only.
            </Text>
          </View>
          <Button onPress={sendInvite} disabled={busy}>
            {busy ? 'Sending…' : 'Send invite'}
          </Button>
        </View>
      </BottomSheet>
      <ConfirmModal
        visible={confirmStop}
        title={`Stop sharing with ${partnerName}?`}
        message={`${partnerName} will no longer see your next period, moods or symptoms, and won't get reminders. You can invite someone again anytime.`}
        confirmLabel={busy ? 'Stopping…' : 'Stop sharing'}
        destructive
        onConfirm={stopSharing}
        onCancel={() => setConfirmStop(false)}
      />
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    card: { marginTop: 10, gap: 16 },
    listCard: { marginTop: 10, padding: 0, overflow: 'hidden' },
    intro: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
    iconTile: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    iconTx: { fontSize: 14 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    title: { fontSize: 12, fontWeight: '700', color: c.textPrimary },
    email: { fontSize: 10.5, fontWeight: '600', color: c.textPrimary, marginTop: 4 },
    body: { fontSize: 10.5, color: c.textSecondary, lineHeight: 17, marginTop: 4 },
    pill: { borderRadius: 99, paddingVertical: 3, paddingHorizontal: 9 },
    pillTx: { fontSize: 9.5, fontWeight: '700' },
    actions: { flexDirection: 'row', gap: 10 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    rowLabel: { fontSize: 11, color: c.textPrimary, fontWeight: '600' },
    rowSub: { fontSize: 9.5, color: c.textMuted, marginTop: 2, lineHeight: 14 },
    footNote: { fontSize: 10.5, color: c.textMuted, marginTop: 10, paddingHorizontal: 4, lineHeight: 15 },
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
  });
}
