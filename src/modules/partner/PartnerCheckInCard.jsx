import { View, Pressable, StyleSheet } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text } from '../../shared/styles/index.js';
import Button from '../../components/ui/Button.jsx';
import * as partnerApi from '../../shared/api/partner.js';
import * as rewardsApi from '../../shared/api/rewards.js';
import { supportLabels } from '../../shared/utils/partner.js';
export default function PartnerCheckInCard({ name }) {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { accessToken, today } = state;
  const [checkIn, setCheckIn] = useState(null);
  const [picked, setPicked] = useState([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    partnerApi
      .getPartnerCheckIn(accessToken)
      .then(setCheckIn)
      .catch(() => {});
  }, [accessToken, today]);
  function toggle(id) {
    setPicked(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }
  async function submit() {
    if (busy || picked.length === 0) return;
    setBusy(true);
    try {
      const result = await partnerApi.partnerCheckIn(picked, accessToken);
      setCheckIn(result);
      setPicked([]);
      if (result.pointsAwarded > 0) dispatch({ type: A.SHOW_TOAST, icon: '💞', text: `+${result.pointsAwarded} SP for checking in` });
      rewardsApi
        .getSummary(accessToken)
        .then(data => dispatch({ type: A.REWARDS_HYDRATED, ...data }))
        .catch(() => {});
    } catch (e) {
      dispatch({ type: A.SHOW_TOAST, icon: '🌸', text: e.message });
    } finally {
      setBusy(false);
    }
  }
  if (!checkIn) return null;
  if (checkIn.checkedInToday) {
    return (
      <View style={s.card}>
        <View style={s.headRow}>
          <Text style={s.title}>Checked in today</Text>
          <Text style={[s.badge, { color: colors.success }]}>{`${checkIn.streak}-day streak`}</Text>
        </View>
        <View style={s.chips}>
          {supportLabels(checkIn.options, checkIn.supports).map(label => (
            <View key={label} style={[s.chip, s.chipOn, { borderColor: colors.primary, backgroundColor: colors.primarySoft }]}>
              <Text style={[s.chipTx, { color: colors.primaryDark }]}>{label}</Text>
            </View>
          ))}
        </View>
        <Text style={s.note}>Come back tomorrow to keep your streak going.</Text>
      </View>
    );
  }
  return (
    <View style={s.card}>
      <View style={s.headRow}>
        <Text style={s.title}>{`How did you support ${name} today?`}</Text>
        <Text style={[s.badge, { color: colors.tertiaryDeep }]}>{`+${checkIn.reward} SP`}</Text>
      </View>
      <View style={s.chips}>
        {checkIn.options.map(option => {
          const on = picked.includes(option.id);
          return (
            <Pressable
              key={option.id}
              onPress={() => toggle(option.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              style={[s.chip, on && { borderColor: colors.primary, backgroundColor: colors.primarySoft }]}
            >
              <Text style={[s.chipTx, { color: on ? colors.primaryDark : colors.textSecondary }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ marginTop: 14 }}>
        <Button size="sm" onPress={submit} disabled={busy || picked.length === 0}>
          {busy ? 'Checking in…' : 'Check in'}
        </Button>
      </View>
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    card: {
      borderRadius: 26,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      paddingTop: 18,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    headRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 4 },
    title: { fontSize: 12, fontWeight: '700', color: c.textPrimary, flexShrink: 1 },
    badge: { fontSize: 10, fontWeight: '700', marginLeft: 8 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
    chip: {
      paddingVertical: 9,
      paddingHorizontal: 12,
      borderRadius: 99,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background,
    },
    chipOn: { borderWidth: 1.5 },
    chipTx: { fontSize: 10.5, fontWeight: '600' },
    note: { fontSize: 10, color: c.textMuted, marginTop: 12, paddingHorizontal: 4 },
  });
}
