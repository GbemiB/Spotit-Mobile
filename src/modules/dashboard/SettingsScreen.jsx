import { View, ScrollView, Pressable, StyleSheet, Linking, AppState } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { levelInfo } from '../../shared/utils/levels.js';
import { NOTIF_ROWS } from '../../shared/constants/rewards.js';
import { PRIVACY_POLICY_URL, TERMS_URL } from '../../shared/constants/legal.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import Avatar from '../../components/ui/Avatar.jsx';
import Card from '../../components/ui/Card.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import Button from '../../components/ui/Button.jsx';
import SectionHeader from '../../components/ui/SectionHeader.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import appConfig from '../../../app.json';
import * as authApi from '../../shared/api/auth.js';
import * as usersApi from '../../shared/api/users.js';
import { getPermissionState, requestPermission, syncPushRegistration, unlinkPush, markPromptSeen } from '../../shared/utils/push.js';
import { DAY_OPTIONS, toggleDay, shiftTime, timeLabel } from '../../shared/utils/reminders.js';
function splitName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
}
// The installed build's version; app.json covers the web preview, where there is no native binary.
const APP_VERSION = Application.nativeApplicationVersion || appConfig.expo.version;
// The countdown setting that belongs to each reminder switch.
// Only the period reminder has a countdown; ovulation is announced on the day.
const REMINDER_DAYS_KEY = { period: 'periodDaysBefore' };
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
// Which days of a countdown are sent: any of "3 days before" ... "On the day".
function DayChips({ selected, max, onToggle, colors, s }) {
  return (
    <View style={s.chipRow}>
      {DAY_OPTIONS.filter(o => o.days <= max).map(o => {
        const active = selected.includes(o.days);
        return (
          <Pressable
            key={o.days}
            onPress={() => onToggle(o.days)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: active }}
            style={[s.chip, active && { backgroundColor: colors.primary, borderColor: colors.primary }]}
          >
            <Text style={[s.chipTx, { color: active ? colors.white : colors.textSecondary }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
function TimeStepper({ label, value, onChange, s }) {
  return (
    <View style={s.timeRow}>
      <Text style={[s.notifSub, { flex: 1, marginTop: 0 }]}>{label}</Text>
      <View style={s.stepper}>
        <Pressable onPress={() => onChange(shiftTime(value, -30))} style={s.stepBtnSm} accessibilityLabel={`${label}: earlier`}>
          <Text style={s.stepTx}>−</Text>
        </Pressable>
        <Text style={s.stepVal}>{timeLabel(value)}</Text>
        <Pressable onPress={() => onChange(shiftTime(value, 30))} style={s.stepBtnSm} accessibilityLabel={`${label}: later`}>
          <Text style={s.stepTx}>+</Text>
        </Pressable>
      </View>
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
  // 'granted' | 'undetermined' | 'denied' | 'unsupported'. Re-read when she comes back from the phone's settings.
  const [permission, setPermission] = useState('granted');
  useEffect(() => {
    getPermissionState().then(setPermission);
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') getPermissionState().then(setPermission);
    });
    return () => sub.remove();
  }, []);
  // Sends only what changed. The screen updates at once and is put back if the server refuses.
  async function saveNotifs(changes) {
    const before = notifs;
    dispatch({ type: A.SET_NOTIF_PREFS, prefs: changes });
    try {
      const data = await usersApi.updateNotifications(changes, accessToken);
      dispatch({ type: A.NOTIFICATIONS_UPDATED, ...data });
    } catch (e) {
      dispatch({ type: A.SET_NOTIF_PREFS, prefs: before });
      toast('🌸', e.message);
    }
  }
  async function allowNotifications() {
    await markPromptSeen();
    const result = await requestPermission();
    setPermission(result);
    if (result === 'granted') await syncPushRegistration(accessToken);
  }
  function handleToggleNotif(key) {
    const turningOn = !notifs[key];
    saveNotifs({ [key]: turningOn });
    // Switching a reminder on is a clear yes, so the system prompt can follow straight away.
    if (turningOn && permission === 'undetermined') allowNotifications();
  }
  // Unticking the last day would leave a reminder that is on but never sent, so that turns the switch off instead.
  function handleToggleDay(key, daysKey, day) {
    const next = toggleDay(notifs[daysKey], day);
    saveNotifs(next.length === 0 ? { [key]: false } : { [daysKey]: next });
  }
  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      await usersApi.requestExport(accessToken);
      toast('📬', 'Your data export is on its way to your email.');
    } catch (e) {
      toast('🌸', e.message);
    } finally {
      setExporting(false);
    }
  }
  async function confirmLogout() {
    setConfirming(null);
    await unlinkPush(accessToken);
    await authApi.logout(accessToken).catch(() => {});
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
      await unlinkPush(accessToken);
      await authApi.deleteAccount(accessToken);
      setConfirming(null);
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
          <SectionHeader title="Reminders" />
          <Text style={s.notifNote}>{"Choose each reminder separately. Times are in your phone's time zone."}</Text>
          {permission === 'denied' && (
            <Card style={s.permCard}>
              <Text style={s.permTx}>{"Notifications are turned off for Spot it, so reminders can't reach this phone."}</Text>
              <Button variant="secondary" onPress={() => Linking.openSettings()}>
                Open settings
              </Button>
            </Card>
          )}
          {permission === 'undetermined' && (
            <Card style={s.permCard}>
              <Text style={s.permTx}>Allow notifications so your reminders can reach this phone.</Text>
              <Button onPress={allowNotifications}>Allow notifications</Button>
            </Card>
          )}
          <Card style={{ marginTop: 10, padding: 0, overflow: 'hidden' }}>
            {NOTIF_ROWS.map((n, i) => {
              const on = notifs[n.key];
              const last = i === NOTIF_ROWS.length - 1;
              const daysKey = REMINDER_DAYS_KEY[n.key];
              const hasDetail = on && (daysKey || n.key === 'dailyLog');
              return (
                <View key={n.key} style={!last && s.notifGroup}>
                  <Row
                    icon={n.icon}
                    iconBg={colors[`${n.colorKey}Soft`]}
                    label={n.label}
                    sub={n.sub}
                    right={<Toggle value={on} onChange={() => handleToggleNotif(n.key)} />}
                    last
                    compact
                    s={s}
                  />
                  {hasDetail && (
                    <View style={s.notifDetail}>
                      {daysKey && (
                        <DayChips
                          selected={notifs[daysKey]}
                          max={notifs.maxDaysBefore}
                          onToggle={day => handleToggleDay(n.key, daysKey, day)}
                          colors={colors}
                          s={s}
                        />
                      )}
                      {n.key === 'dailyLog' && (
                        <TimeStepper label="Evening time" value={notifs.eveningTime} onChange={v => saveNotifs({ eveningTime: v })} s={s} />
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </Card>
          {(notifs.period || notifs.ovulation) && (
            <Card style={{ marginTop: 10, paddingVertical: 4, paddingHorizontal: 14 }}>
              <TimeStepper
                label="Morning time for period and ovulation reminders"
                value={notifs.morningTime}
                onChange={v => saveNotifs({ morningTime: v })}
                s={s}
              />
            </Card>
          )}
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
            <Row label="Version" right={<Text style={s.metaTx}>{APP_VERSION}</Text>} s={s} />
            <Pressable style={s.row} onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
              <Text style={[s.rowLabel, { color: colors.primary }]}>Privacy Policy</Text>
              <Text style={s.chevron}>›</Text>
            </Pressable>
            <Pressable style={[s.row, { borderBottomWidth: 0 }]} onPress={() => Linking.openURL(TERMS_URL)}>
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
    notifNote: { fontSize: 10.5, color: c.textMuted, marginTop: 6, lineHeight: 15 },
    notifGroup: { borderBottomWidth: 1, borderBottomColor: c.border },
    notifDetail: { paddingHorizontal: 14, paddingBottom: 12, gap: 8 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 99,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background,
    },
    chipTx: { fontSize: 10, fontWeight: '700' },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
    stepBtnSm: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background },
    permCard: { marginTop: 10, padding: 16, gap: 12 },
    permTx: { fontSize: 11, color: c.textSecondary, lineHeight: 17 },
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
