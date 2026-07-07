import { View, ScrollView, Pressable, Alert, StyleSheet, Platform } from 'react-native';
import { useMemo } from 'react';
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

const THEME_OPTIONS = [
  { key: 'light', label: 'Light' },
  { key: 'dark', label: 'Dark' },
  { key: 'system', label: 'System' },
];

function Row({ label, sub, right, last, s }) {
  return (
    <View style={[s.row, last && { borderBottomWidth: 0 }]}>
      <View style={{ flex: 1 }}>
        <Text style={s.rowLabel}>{label}</Text>
        {sub ? <Text style={s.rowSub}>{sub}</Text> : null}
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
  const { userName, cycleLength, periodLength, notifs, themePref, femPoints } = state;
  const insets = useSafeAreaInsets();
  const level = levelInfo(femPoints);

  function patch(obj) {
    dispatch({ type: A.UPDATE_SETTINGS, patch: obj });
  }

  function handleLogout() {
    Alert.alert(
      'Log out',
      'Your cycle data stays saved. You can log back in anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: () => dispatch({ type: A.LOGOUT }) },
      ]
    );
  }

  function handleReset() {
    Alert.alert(
      'Reset all data',
      'This will erase all your logs, SpotPoints, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => dispatch({ type: A.RESET_DATA }) },
      ]
    );
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerSub}>Preferences</Text>
          <Text style={s.headerTitle}>Profile</Text>
        </View>

        {/* Profile hero */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Card style={s.profileHero}>
            <Avatar name={userName} size={64} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.profileName}>{userName}</Text>
              <Text style={s.profileMeta}>{level.name} · {femPoints.toLocaleString()} SP</Text>
            </View>
            <Text style={s.editLink}>Edit</Text>
          </Card>
        </View>

        {/* Profile */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Profile" />
          <Card style={{ marginTop: 10, padding: 0, overflow: 'hidden' }}>
            <View style={s.row}>
              <Text style={[s.rowLabel, { flex: 1 }]}>Name</Text>
              <TextInput
                value={userName}
                onChangeText={v => patch({ userName: v })}
                style={s.inlineInput}
                placeholderTextColor={colors.textFaint}
                placeholder="Your name"
                returnKeyType="done"
              />
            </View>
          </Card>
        </View>

        {/* Cycle */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Cycle" />
          <Card style={{ marginTop: 10, padding: 0, overflow: 'hidden' }}>
            <Stepper
              label="Cycle length"
              value={cycleLength}
              min={21} max={45}
              onChange={v => patch({ cycleLength: v })}
              s={s}
            />
            <Stepper
              label="Period length"
              value={periodLength}
              min={2} max={10}
              onChange={v => patch({ periodLength: v })}
              last
              s={s}
            />
          </Card>
        </View>

        {/* Notifications */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Notifications" />
          <Card style={{ marginTop: 10, padding: 0, overflow: 'hidden' }}>
            {NOTIF_ROWS.map((n, i) => (
              <Row
                key={n.key}
                label={n.label}
                sub={n.sub}
                right={<Toggle value={notifs[n.key]} onChange={() => dispatch({ type: A.TOGGLE_NOTIF, key: n.key })} />}
                last={i === NOTIF_ROWS.length - 1}
                s={s}
              />
            ))}
          </Card>
        </View>

        {/* Appearance */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Appearance" />
          <View style={s.themeRow}>
            {THEME_OPTIONS.map(opt => {
              const active = themePref === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => dispatch({ type: A.SET_THEME, pref: opt.key })}
                  style={[s.themePill, active && { backgroundColor: colors.primary }]}
                >
                  <Text style={[s.themePillTx, { color: active ? colors.white : colors.textSecondary }]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* About */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="About" />
          <Card style={{ marginTop: 10, padding: 0, overflow: 'hidden' }}>
            <Row label="App" right={<Text style={s.metaTx}>Spot it</Text>} s={s} />
            <Row label="Version" right={<Text style={s.metaTx}>1.0.0</Text>} s={s} />
            <Pressable style={s.row} onPress={() => { }}>
              <Text style={[s.rowLabel, { color: colors.primary }]}>Privacy Policy</Text>
              <Text style={s.chevron}>›</Text>
            </Pressable>
            <Pressable style={[s.row, { borderBottomWidth: 0 }]} onPress={() => { }}>
              <Text style={[s.rowLabel, { color: colors.primary }]}>Terms of Service</Text>
              <Text style={s.chevron}>›</Text>
            </Pressable>
          </Card>
        </View>

        {/* Account */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Account" />
          <Card style={{ marginTop: 10, padding: 0, overflow: 'hidden' }}>
            <Pressable style={s.row} onPress={() => { }}>
              <Text style={s.rowLabel}>Export my data</Text>
            </Pressable>
            <Pressable style={[s.row, { borderBottomWidth: 0 }]} onPress={handleLogout}>
              <Text style={[s.rowLabel, { color: colors.error }]}>Sign out</Text>
            </Pressable>
          </Card>
        </View>

        {/* Data / Reset */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Data" />
          <Card style={{ padding: 18, marginTop: 10 }}>
            <Text style={s.dangerNote}>Resetting will permanently delete all your logs, SpotPoints, and settings.</Text>
            <Button variant="danger" onPress={handleReset}>Reset all data</Button>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 },
    headerSub: { fontSize: 11, color: c.textMuted, fontWeight: '600', marginBottom: 2 },
    headerTitle: { fontSize: 30, fontWeight: '800', color: c.textPrimary, letterSpacing: -0.5 },
    profileHero: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 22, borderRadius: 24 },
    profileName: { fontSize: 11, fontWeight: '700', color: c.textPrimary, letterSpacing: -0.3 },
    profileMeta: { fontSize: 10.5, color: c.textMuted, marginTop: 2 },
    editLink: { fontSize: 10.5, fontWeight: '700', color: c.primaryDark },
    themeRow: { flexDirection: 'row', gap: 6, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border, borderRadius: 16, padding: 6, marginTop: 10 },
    themePill: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
    themePillTx: { fontSize: 10.5, fontWeight: '700' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: c.border },
    rowLabel: { fontSize: 11.5, color: c.textPrimary, fontWeight: '500' },
    rowSub: { fontSize: 9.5, color: c.textMuted, marginTop: 2 },
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
