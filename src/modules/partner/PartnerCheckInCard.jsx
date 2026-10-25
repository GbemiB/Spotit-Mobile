import { View, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, TextInput, FONT } from '../../shared/styles/index.js';
import Button from '../../components/ui/Button.jsx';
import * as partnerApi from '../../shared/api/partner.js';
import * as rewardsApi from '../../shared/api/rewards.js';
import { supportLabels } from '../../shared/utils/partner.js';
import { useReduceMotion, useAnimatedValue } from '../dashboard/HeroCardFx.jsx';
export const HEART = 'M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z';
const NOTE_MAX = 200;
const ICONS = {
  checked_in: ['M4 5h16v11H9l-5 4V5z', 'M12 13.5s-2.6-1.6-2.6-3.3a1.4 1.4 0 0 1 2.6-.7 1.4 1.4 0 0 1 2.6.7c0 1.7-2.6 3.3-2.6 3.3z'],
  listened: ['M7 9a5 5 0 1 1 10 0c0 3.2-3 3.8-3 7a3 3 0 0 1-6 0', 'M10 9.5a2 2 0 0 1 4 0'],
  snacks: [
    'M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9z',
    'M16 10h1.5a2.5 2.5 0 0 1 0 5H16M9 3.5c0 1.5 1.5 1.5 1.5 3M12.5 3.5c0 1.5 1.5 1.5 1.5 3',
  ],
  massage: ['M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z', 'M18.5 16l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z'],
  chores: ['M4 11l8-6 8 6v8H4v-8z', 'M10 19v-5h4v5'],
  quiet_time: ['M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z', 'M16 4.5l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z'],
};
const BURST = [
  [-40, -22, 0],
  [40, -26, 80],
  [-30, 30, 140],
  [34, 28, 200],
  [0, -44, 100],
];
function Heart({ size, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d={HEART} />
    </Svg>
  );
}
export function OptionIcon({ id, color, size = 22 }) {
  const [a, b] = ICONS[id] || ICONS.checked_in;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d={a} />
      <Path d={b} />
    </Svg>
  );
}
function Beating({ reduceMotion, children }) {
  const beat = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(beat, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(beat, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(beat, { toValue: 0.7, duration: 160, useNativeDriver: true }),
        Animated.timing(beat, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.delay(800),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [beat, reduceMotion]);
  const scale = beat.interpolate({ inputRange: [0, 1], outputRange: [1, 1.16] });
  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}
function Tile({ option, on, onPress, reduceMotion, c, s }) {
  const press = useAnimatedValue(1);
  const float = useAnimatedValue(0);
  function handlePress() {
    onPress();
    if (reduceMotion) return;
    press.setValue(0.9);
    Animated.spring(press, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }).start();
    if (!on) {
      float.setValue(0);
      Animated.timing(float, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    }
  }
  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      accessibilityLabel={option.label}
      style={{ width: '31.5%' }}
    >
      <Animated.View
        style={[
          s.tile,
          on && { borderWidth: 2, borderColor: c.primary, backgroundColor: c.primarySoft },
          { transform: [{ scale: press }] },
        ]}
      >
        {!reduceMotion && (
          <Animated.View
            pointerEvents="none"
            style={[
              s.float,
              {
                opacity: float.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
                transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) }],
              },
            ]}
          >
            <Heart size={14} color={c.primary} />
          </Animated.View>
        )}
        <OptionIcon id={option.id} color={on ? c.primaryDark : c.textMuted} />
        <Text style={[s.tileTx, { color: on ? c.primaryDark : c.textSecondary }]} numberOfLines={1}>
          {option.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
function BurstHeart({ x, y, delay, color }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 1100, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v, delay]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 21,
        top: 21,
        opacity: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
        transform: [
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, x] }) },
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, y] }) },
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
        ],
      }}
    >
      <Heart size={14} color={color} />
    </Animated.View>
  );
}
function LoveSent({ checkIn, name, justSent, reduceMotion, c, s }) {
  const labels = supportLabels(checkIn.options, checkIn.supports);
  const colors = [c.primaryLight, c.tertiary, c.primary, c.primaryLight, c.primary];
  return (
    <View style={[s.card, s.sentCard]}>
      <View style={s.sentHeart}>
        {justSent && !reduceMotion && BURST.map(([x, y, delay], i) => <BurstHeart key={i} x={x} y={y} delay={delay} color={colors[i]} />)}
        <Beating reduceMotion={reduceMotion}>
          <View style={s.sentCircle}>
            <Heart size={28} color={c.primary} />
          </View>
        </Beating>
      </View>
      <Text style={s.sentTitle}>Love sent</Text>
      <Text style={s.sentSub}>{`${name || 'She'} will see this.`}</Text>
      {labels.length > 0 && (
        <View style={[s.chips, { justifyContent: 'center' }]}>
          {labels.map(label => (
            <View key={label} style={s.sentChip}>
              <Text style={s.sentChipTx}>{label}</Text>
            </View>
          ))}
        </View>
      )}
      {checkIn.note ? <Text style={s.sentNote}>{`“${checkIn.note}”`}</Text> : null}
      <View style={s.statsRow}>
        {justSent && checkIn.pointsAwarded > 0 && <Text style={[s.stat, { color: c.tertiaryDeep }]}>{`+${checkIn.pointsAwarded} SP`}</Text>}
        {justSent && checkIn.pointsAwarded > 0 && <Text style={[s.stat, { color: c.textSecondary }]}>·</Text>}
        <Text style={[s.stat, { color: c.success }]}>{`${checkIn.streak}-day streak`}</Text>
      </View>
      <Text style={s.tomorrow}>See you tomorrow to keep it going.</Text>
    </View>
  );
}
export default function PartnerCheckInCard({ name }) {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const reduceMotion = useReduceMotion();
  const { accessToken, today } = state;
  const [checkIn, setCheckIn] = useState(null);
  const [picked, setPicked] = useState([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [justSent, setJustSent] = useState(false);
  useEffect(() => {
    partnerApi
      .getPartnerCheckIn(accessToken)
      .then(setCheckIn)
      .catch(() => {});
  }, [accessToken, today]);
  function toggle(id) {
    setPicked(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }
  const ready = picked.length > 0 || note.trim().length > 0;
  async function submit() {
    if (busy || !ready) return;
    setBusy(true);
    try {
      const result = await partnerApi.partnerCheckIn({ supports: picked, note: note.trim() || null }, accessToken);
      setCheckIn(result);
      setJustSent(true);
      setPicked([]);
      setNote('');
      dispatch({
        type: A.SHOW_TOAST,
        icon: '💞',
        text: result.pointsAwarded > 0 ? `+${result.pointsAwarded} SP · love sent` : 'Love sent',
      });
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
    return <LoveSent checkIn={checkIn} name={name} justSent={justSent} reduceMotion={reduceMotion} c={colors} s={s} />;
  }
  return (
    <View style={s.card}>
      <View style={s.blush} />
      <View style={s.headRow}>
        <Beating reduceMotion={reduceMotion}>
          <View style={s.headHeart}>
            <Heart size={16} color={colors.primary} />
          </View>
        </Beating>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.title}>{`Love for ${name || 'her'} today`}</Text>
          <Text style={s.sub}>Little things, big love. Tap what you did.</Text>
        </View>
        <View style={s.spPill}>
          <Text style={s.spTx}>{`+${checkIn.reward} SP`}</Text>
        </View>
      </View>
      <View style={s.grid}>
        {checkIn.options.map(option => (
          <Tile
            key={option.id}
            option={option}
            on={picked.includes(option.id)}
            onPress={() => toggle(option.id)}
            reduceMotion={reduceMotion}
            c={colors}
            s={s}
          />
        ))}
      </View>
      <TextInput
        value={note}
        onChangeText={v => setNote(v.slice(0, NOTE_MAX))}
        placeholder={`Add a sweet note for ${name || 'her'} (optional)`}
        placeholderTextColor={colors.textFaint}
        maxLength={NOTE_MAX}
        multiline
        style={s.noteInput}
      />
      <View style={{ marginTop: 12, opacity: ready ? 1 : 0.6 }}>
        <Button onPress={submit} disabled={busy || !ready}>
          {busy ? 'Sending…' : ready ? 'Send love ♡' : 'Pick something or write a note'}
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
      overflow: 'hidden',
    },
    blush: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: c.primarySoft, top: -70, right: -50 },
    headRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 },
    headHeart: { width: 30, height: 30, borderRadius: 15, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
    title: { fontFamily: FONT.serif, fontSize: 19, lineHeight: 24, color: c.textPrimary },
    sub: { fontSize: 10, color: c.textSecondary, marginTop: 2 },
    spPill: { backgroundColor: c.tertiarySoft, borderRadius: 99, paddingVertical: 4, paddingHorizontal: 8 },
    spTx: { fontSize: 10, fontWeight: '800', color: c.tertiaryDeep },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8, marginTop: 14 },
    tile: {
      height: 70,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    float: { position: 'absolute', top: 6 },
    tileTx: { fontSize: 10, fontWeight: '700' },
    noteInput: {
      marginTop: 12,
      minHeight: 44,
      maxHeight: 96,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 12,
      fontSize: 11.5,
      color: c.textPrimary,
    },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
    sentCard: { alignItems: 'center', backgroundColor: c.primarySoft, borderColor: c.primarySoftBorder, paddingTop: 20, paddingBottom: 18 },
    sentHeart: { width: 56, height: 56 },
    sentCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.primary,
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    sentTitle: { fontFamily: FONT.serif, fontSize: 21, lineHeight: 27, color: c.textPrimary, marginTop: 12 },
    sentSub: { fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 14, lineHeight: 20, color: c.textSecondary, marginTop: 2 },
    sentChip: {
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.primarySoftBorder,
      borderRadius: 99,
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    sentChipTx: { fontSize: 10, fontWeight: '700', color: c.primaryDark },
    sentNote: {
      fontFamily: FONT.serif,
      fontStyle: 'italic',
      fontSize: 13,
      lineHeight: 19,
      color: c.textPrimary,
      marginTop: 10,
      textAlign: 'center',
    },
    statsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
    stat: { fontSize: 10, fontWeight: '700' },
    tomorrow: { fontSize: 10, color: c.textSecondary, marginTop: 6 },
  });
}
