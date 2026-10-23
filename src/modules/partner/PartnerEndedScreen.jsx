import { View, ScrollView, StyleSheet } from 'react-native';
import { useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, OnboardingFontScope } from '../../shared/styles/index.js';
import { FONT } from '../../shared/styles/typography.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import * as authApi from '../../shared/api/auth.js';
import { unlinkPush } from '../../shared/utils/push.js';
import PartnerJoinScreen from './PartnerJoinScreen.jsx';
export default function PartnerEndedScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { accessToken, userName } = state;
  const [joining, setJoining] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(false);
  async function runConfirmed() {
    if (busy) return;
    setBusy(true);
    try {
      await unlinkPush(accessToken);
      if (confirming === 'delete') await authApi.deleteAccount(accessToken);
      else await authApi.logout(accessToken).catch(() => {});
      setConfirming(null);
      dispatch({ type: A.LOGOUT });
    } catch (e) {
      dispatch({ type: A.SHOW_TOAST, icon: '🌸', text: e.message });
    } finally {
      setBusy(false);
    }
  }
  if (joining) {
    return (
      <OnboardingFontScope>
        <PartnerJoinScreen ownerFirstName={null} onBack={() => setJoining(false)} onJoined={() => setJoining(false)} />
      </OnboardingFontScope>
    );
  }
  const firstName = userName?.trim().split(/\s+/)[0] || '';
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: insets.bottom + 32 }}>
        <View style={s.header}>
          <Avatar name={firstName || 'You'} size={38} />
          <Text style={s.name}>{firstName}</Text>
        </View>
        <Card style={s.card}>
          <Text style={s.title}>Sharing has ended</Text>
          <Text style={s.body}>
            You no longer see a partner&apos;s cycle, and period reminders have stopped. If you get a new invite, enter its code below.
          </Text>
          <Button onPress={() => setJoining(true)}>Enter a new invite code</Button>
        </Card>
        <View style={s.actions}>
          <Button variant="secondary" onPress={() => setConfirming('logout')}>
            Log out
          </Button>
          <Button variant="danger" onPress={() => setConfirming('delete')}>
            Delete account
          </Button>
        </View>
      </ScrollView>
      <ConfirmModal
        visible={confirming === 'logout'}
        title="Log out"
        message="You can log back in anytime."
        confirmLabel="Log out"
        destructive
        onConfirm={runConfirmed}
        onCancel={() => setConfirming(null)}
      />
      <ConfirmModal
        visible={confirming === 'delete'}
        title="Delete account"
        message="This permanently deletes your account and login. This cannot be undone."
        confirmLabel={busy ? 'Deleting…' : 'Delete account'}
        destructive
        onConfirm={runConfirmed}
        onCancel={() => setConfirming(null)}
      />
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 20 },
    name: { fontSize: 11, fontWeight: '600', color: c.textPrimary },
    card: { gap: 12, padding: 22, borderRadius: 32 },
    title: { fontFamily: FONT.serif, fontSize: 26, color: c.textPrimary, lineHeight: 34 },
    body: { fontSize: 10.5, color: c.textSecondary, lineHeight: 17 },
    actions: { marginTop: 'auto', paddingTop: 24, gap: 10 },
  });
}
