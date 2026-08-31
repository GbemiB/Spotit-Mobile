import { View, ScrollView, Pressable, StyleSheet, Share } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { levelInfo } from '../../shared/utils/levels.js';
import { NOTIF_ROWS } from '../../shared/constants/rewards.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Card from '../../components/ui/Card.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import Button from '../../components/ui/Button.jsx';
import SectionHeader from '../../components/ui/SectionHeader.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import TermsScreen from '../onboarding/TermsScreen.jsx';
import * as authApi from '../../shared/api/auth.js';
import * as usersApi from '../../shared/api/users.js';
import * as biometricUtils from '../../shared/utils/biometric.js';
function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
}
const THEME_OPTIONS = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
];
function Row({ icon, iconBg, label, sub, right, last, s, compact }) {
  return (
    <View style={[compact ? s.notifRow : s.row, last && { borderBottomWidth: 0 }]}>
      {icon ? (
        <View style={[compact ? s.notifIconWrap : s.rowIconWrap, { backgroundColor: iconBg }]}>
          <Text style={{ fontSize: compact ? 10 : 12 }}>{icon}</Text>
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={compact ? s.notifLabel : s.rowLabel}>{label}</Text>
        {sub ? <Text style={compact ? s.notifSub : s.rowSub}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}
function Stepper({ label, value, min, max, onChange, last, s }) {
  return (
    <View style={[s.row, last && { borderBottomWidth: 0 }]}>
      <Text style={[s.rowLabel, { flex: 1 }]}>{label}</Text>
      <View style={s.stepper}>
        <Pressable onPress={() => value > min && onChange(value - 1)} style={s.stepBtn}>
          <Text style={s.stepTx}>−</Text>
        </Pressable>
        <Text style={s.stepVal}>{value}</Text>
        <Pressable onPress={() => value < max && onChange(value + 1)} style={s.stepBtn}>
          <Text style={s.stepTx}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
export default function SettingsScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { userName, cycleLength, periodLength, notifs, themePref, femPoints, accessToken, levels } = state;
  const insets = useSafeAreaInsets();
  const level = levelInfo(femPoints, levels);
  const [confirming, setConfirming] = useState(null);
  const [nameDraft, setNameDraft] = useState(userName);
  useEffect(() => {
    setNameDraft(userName);
  }, [userName]);
  const [exporting, setExporting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  function patch(obj) {
    dispatch({ type: A.UPDATE_SETTINGS, patch: obj });
  }
  function toast(icon, text) {
    dispatch({ type: A.SHOW_TOAST, icon, text });
  }
  async function saveProfile(fields) {
    try {
      const data = await usersApi.updateProfile(fields, accessToken);
      dispatch({ type: A.PROFILE_UPDATED, ...data });
    } catch (e) {
      toast('🌸', e.message);
    }
  }
  function handleNameBlur() {
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === userName) {
      setNameDraft(userName);
      return;
    }
    patch({ userName: trimmed });
    saveProfile(splitName(trimmed));
  }
  function handleCycleLengthChange(v) {
    patch({ cycleLength: v });
    saveProfile({ cycleLength: v });
  }
  function handlePeriodLengthChange(v) {
    patch({ periodLength: v });
    saveProfile({ periodLength: v });
  }
  function handleThemeChange(pref) {
    dispatch({ type: A.SET_THEME, pref });
    saveProfile({ themePref: pref });
  }
  async function handleToggleNotif(key) {
    dispatch({ type: A.TOGGLE_NOTIF, key });
    try {
      const data = await usersApi.updateNotifications({ ...notifs, [key]: !notifs[key] }, accessToken);
      dispatch({ type: A.NOTIFICATIONS_UPDATED, ...data });
    } catch (e) {
      dispatch({ type: A.TOGGLE_NOTIF, key });
      toast('🌸', e.message);
    }
  }
  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      const job = await usersApi.requestExport(accessToken);
      const data = await usersApi.downloadExport(job.jobId, accessToken);
      await Share.share({ message: JSON.stringify(data, null, 2), title: 'Spot it data export' });
    } catch (e) {
      toast('🌸', e.message);
    } finally {
      setExporting(false);
    }
  }
  async function confirmLogout() {
    setConfirming(null);
    await authApi.logout(state.accessToken).catch(() => {});
    await biometricUtils.disableBiometric();
    dispatch({ type: A.LOGOUT });
  }
  async function confirmReset() {
    if (resetting) return;
    setResetting(true);
    try {
      await usersApi.resetAllData(accessToken);
      setConfirming(null);
      dispatch({ type: A.RESET_DATA });
    } catch (e) {
      toast('🌸', e.message);
    } finally {
      setResetting(false);
    }
  }
  async function confirmDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await authApi.deleteAccount(accessToken);
      setConfirming(null);
      await biometricUtils.disableBiometric();
      dispatch({ type: A.LOGOUT });
    } catch (e) {
      toast('🌸', e.message);
    } finally {
      setDeleting(false);
    }
  }
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Profile</Text>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Card style={s.profileHero}>
            <Avatar name={userName} size={64} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.profileName}>{userName}</Text>
              <Text style={s.profileMeta}>
                {level.name} · {femPoints.toLocaleString()} SP
              </Text>
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Profile" />
          <Card style={{ marginTop: 10, padding: 0, overflow: 'hidden' }}>
            <View style={s.row}>
              <Text style={[s.rowLabel, { flex: 1 }]}>Name</Text>
              <TextInput
                value={nameDraft}
                onChangeText={setNameDraft}
                onBlur={handleNameBlur}
                style={s.inlineInput}
                placeholderTextColor={colors.textFaint}
                placeholder="Your name"
                returnKeyType="done"
              />
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Cycle" />
          <Card style={{ marginTop: 10, padding: 0, overflow: 'hidden' }}>
            <Stepper label="Cycle length" value={cycleLength} min={21} max={45} onChange={handleCycleLengthChange} s={s} />
            <Stepper label="Period length" value={periodLength} min={2} max={10} onChange={handlePeriodLengthChange} last s={s} />
          </Card>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Notifications" />
          <Card style={{ marginTop: 10, padding: 0, overflow: 'hidden' }}>
            {NOTIF_ROWS.map((n, i) => (
              <Row
                key={n.key}
                icon={n.icon}
                iconBg={colors[`${n.colorKey}Soft`]}
                label={n.label}
                sub={n.sub}
                right={<Toggle value={notifs[n.key]} onChange={() => handleToggleNotif(n.key)} />}
                last={i === NOTIF_ROWS.length - 1}
                compact
                s={s}
              />
            ))}
          </Card>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Appearance" />
          <View style={s.themeRow}>
            {THEME_OPTIONS.map(opt => {
              const active = themePref === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => handleThemeChange(opt.key)}
                  style={[s.themePill, active && { backgroundColor: colors.primary }]}
                >
                  <Text style={[s.themePillTx, { color: active ? colors.white : colors.textSecondary }]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="About" />
          <Card style={{ marginTop: 10, padding: 0, overflow: 'hidden' }}>
            <Row label="App" right={<Text style={s.metaTx}>Spot it</Text>} s={s} />
            <Row label="Version" right={<Text style={s.metaTx}>1.0.0</Text>} s={s} />
            <Pressable style={s.row} onPress={() => setShowTerms(true)}>
              <Text style={[s.rowLabel, { color: colors.primary }]}>Privacy Policy</Text>
              <Text style={s.chevron}>›</Text>
            </Pressable>
            <Pressable style={[s.row, { borderBottomWidth: 0 }]} onPress={() => setShowTerms(true)}>
              <Text style={[s.rowLabel, { color: colors.primary }]}>Terms of Service</Text>
              <Text style={s.chevron}>›</Text>
            </Pressable>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Account" />
          <Card style={{ marginTop: 10, padding: 0, overflow: 'hidden' }}>
            <Pressable style={s.row} onPress={handleExport} disabled={exporting}>
              <Text style={s.rowLabel}>{exporting ? 'Preparing export…' : 'Export my data'}</Text>
            </Pressable>
            <Pressable style={[s.row, { borderBottomWidth: 0 }]} onPress={() => setConfirming('logout')}>
              <Text style={[s.rowLabel, { color: colors.error }]}>Sign out</Text>
            </Pressable>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Data" />
          <Card style={{ padding: 18, marginTop: 10 }}>
            <Text style={s.dangerNote}>Resetting will permanently delete all your logs, SpotPoints, and settings.</Text>
            <Button variant="danger" onPress={() => setConfirming('reset')}>
              Reset all data
            </Button>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Card style={{ padding: 18 }}>
            <Text style={s.dangerNote}>
              Deleting your account removes your login permanently. Your data is purged after a short grace period.
            </Text>
            <Button variant="danger" onPress={() => setConfirming('delete')}>
              Delete account
            </Button>
          </Card>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={confirming === 'logout'}
        title="Log out"
        message="Your cycle data stays saved. You can log back in anytime."
        confirmLabel="Log out"
        destructive
        onConfirm={confirmLogout}
        onCancel={() => setConfirming(null)}
      />
      <ConfirmModal
        visible={confirming === 'reset'}
        title="Reset all data"
        message="This will erase all your logs, SpotPoints, and settings. This cannot be undone."
        confirmLabel={resetting ? 'Resetting…' : 'Reset'}
        destructive
        onConfirm={confirmReset}
        onCancel={() => setConfirming(null)}
      />
      <ConfirmModal
        visible={confirming === 'delete'}
        title="Delete account"
        message="This permanently deletes your account and login. This cannot be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete account'}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(null)}
      />
      <TermsScreen visible={showTerms} onAgree={() => setShowTerms(false)} onClose={() => setShowTerms(false)} />
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: c.textPrimary, letterSpacing: -0.4 },
    profileHero: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 22, borderRadius: 24 },
    profileName: { fontSize: 11, fontWeight: '700', color: c.textPrimary, letterSpacing: -0.3 },
    profileMeta: { fontSize: 10.5, color: c.textMuted, marginTop: 2 },
    themeRow: {
      flexDirection: 'row',
      gap: 6,
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: 16,
      padding: 6,
      marginTop: 10,
    },
    themePill: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
    themePillTx: { fontSize: 10.5, fontWeight: '700' },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    rowIconWrap: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    rowLabel: { fontSize: 11, color: c.textPrimary, fontWeight: '600' },
    rowSub: { fontSize: 9.5, color: c.textMuted, marginTop: 2 },
    notifRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      justifyContent: 'space-between',
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    notifIconWrap: { width: 20, height: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    notifLabel: { fontSize: 11, color: c.textPrimary, fontWeight: '600' },
    notifSub: { fontSize: 9.5, color: c.textMuted, marginTop: 1 },
    metaTx: { fontSize: 12, color: c.textMuted, fontWeight: '500' },
    inlineInput: { fontSize: 12, fontWeight: '600', color: c.primary, textAlign: 'right', minWidth: 80 },
    stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: c.border, borderRadius: 12, overflow: 'hidden' },
    stepBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background },
    stepTx: { fontSize: 18, color: c.primary, fontWeight: '600', lineHeight: 24 },
    stepVal: { fontSize: 12, fontWeight: '700', color: c.textPrimary, paddingHorizontal: 12 },
    chevron: { fontSize: 18, color: c.textFaint },
    dangerNote: { fontSize: 11, color: c.textMuted, lineHeight: 20, marginBottom: 14 },
  });
}
