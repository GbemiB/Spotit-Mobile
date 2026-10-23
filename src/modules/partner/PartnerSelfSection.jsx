import { View, Pressable, StyleSheet, AppState } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import Card from '../../components/ui/Card.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import SectionHeader from '../../components/ui/SectionHeader.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import * as partnerApi from '../../shared/api/partner.js';
import { getPermissionState, requestPermission, syncPushRegistration } from '../../shared/utils/push.js';
export default function PartnerSelfSection() {
  const { state, dispatch } = useApp();
  const { accessToken } = state;
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const [status, setStatus] = useState(null);
  const [draft, setDraft] = useState('');
  const [confirmStop, setConfirmStop] = useState(false);
  const [busy, setBusy] = useState(false);
  const toast = useCallback((icon, text) => dispatch({ type: A.SHOW_TOAST, icon, text }), [dispatch]);
  const applyStatus = useCallback(
    next => {
      setStatus(next);
      setDraft(next.nickname || '');
      if (next.state === 'ended') dispatch({ type: A.PARTNER_STATE, state: 'ended' });
    },
    [dispatch],
  );
  const load = useCallback(() => {
    partnerApi
      .getPartnerStatus(accessToken)
      .then(applyStatus)
      .catch(() => {});
  }, [accessToken, applyStatus]);
  useEffect(() => {
    load();
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') load();
    });
    return () => sub.remove();
  }, [load]);
  async function save(changes) {
    const before = status;
    setStatus({ ...before, ...changes });
    try {
      const next = await partnerApi.updatePartnerSettings(changes, accessToken);
      applyStatus(next);
      if (changes.nickname) dispatch({ type: A.UPDATE_SETTINGS, patch: { partnerName: next.nickname } });
    } catch (e) {
      applyStatus(before);
      toast('🌸', e.message);
    }
  }
  function saveNickname() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === status?.nickname) {
      setDraft(status?.nickname || '');
      return;
    }
    save({ nickname: trimmed });
  }
  async function toggleReminder() {
    const turningOn = !status?.partnerReminder;
    save({ partnerReminder: turningOn });
    if (turningOn && (await getPermissionState()) === 'undetermined' && (await requestPermission()) === 'granted') {
      await syncPushRegistration(accessToken);
    }
  }
  async function stopSharing() {
    if (busy) return;
    setBusy(true);
    try {
      await partnerApi.stopPartnerSharing(accessToken);
      setConfirmStop(false);
      dispatch({ type: A.PARTNER_STATE, state: 'ended' });
    } catch (e) {
      toast('🌸', e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!status || status.state !== 'active') return null;
  const herName = status.nickname || status.ownerFirstName || 'her';
  return (
    <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
      <SectionHeader title="Partner" />
      <Card style={s.listCard}>
        <View style={s.row}>
          <Text style={[s.rowLabel, { flex: 1 }]}>What you call her</Text>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onBlur={saveNickname}
            onSubmitEditing={saveNickname}
            maxLength={40}
            returnKeyType="done"
            style={s.inlineInput}
            placeholderTextColor={colors.textFaint}
            placeholder="Her name"
          />
        </View>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.rowLabel}>Period reminder</Text>
            <Text style={s.rowSub}>5 days before her period</Text>
          </View>
          <Toggle value={!!status.partnerReminder} onChange={toggleReminder} />
        </View>
        <Pressable style={[s.row, { borderBottomWidth: 0 }]} onPress={() => setConfirmStop(true)}>
          <Text style={[s.rowLabel, { color: colors.error }]}>{`Stop sharing with ${herName}`}</Text>
        </Pressable>
      </Card>
      <Text style={s.footNote}>{`You see ${herName}'s cycle and logs read-only. Only ${herName} can log or change them.`}</Text>
      <ConfirmModal
        visible={confirmStop}
        title={`Stop sharing with ${herName}?`}
        message={`You will no longer see ${herName}'s cycle or logs, and reminders will stop.`}
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
    listCard: { marginTop: 10, padding: 0, overflow: 'hidden' },
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
    rowSub: { fontSize: 9.5, color: c.textMuted, marginTop: 2 },
    inlineInput: { fontSize: 12, fontWeight: '600', color: c.primary, textAlign: 'right', minWidth: 100 },
    footNote: { fontSize: 10.5, color: c.textMuted, marginTop: 10, paddingHorizontal: 4, lineHeight: 15 },
  });
}
