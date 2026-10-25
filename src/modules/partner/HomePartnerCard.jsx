import { View, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useTheme, Text } from '../../shared/styles/index.js';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import * as partnerApi from '../../shared/api/partner.js';
import { addDays, todayISO } from '../../shared/utils/cycle.js';
import { FONT } from '../../shared/styles/typography.js';
import Avatar from '../../components/ui/Avatar.jsx';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import {
  ownerCard,
  homeInviteCopy,
  connectedLine,
  connectedTitle,
  inviteExpiryText,
  sharedSinceLabel,
  headsUpChip,
} from '../../shared/utils/partner.js';
import { ChevronRightIcon } from '../../components/ui/icons.jsx';
import usePartnerSharing from './usePartnerSharing.js';
import InviteSheet from './InviteSheet.jsx';
import { HeroFrame, AnimatedHeadline, useReduceMotion, useAnimatedValue } from '../dashboard/HeroCardFx.jsx';
const LIGHT_CARD = ['#FFF1F2', '#FDE3DB', '#FCEFD9'];
const LIGHT_RING = ['#F2D0D8', '#F2D0D8', '#DC5A74', '#D6A24E', '#F2D0D8', '#F2D0D8'];
const PETALS = [
  { x: 0.88, y: 0.16, rx: 7, ry: 12, color: '#E2647C', opacity: 0.55, turn: 30, duration: 7000, delay: 0 },
  { x: 0.79, y: 0.41, rx: 5, ry: 9, color: '#F2A0AE', opacity: 0.7, turn: -20, duration: 8000, delay: 800 },
  { x: 0.93, y: 0.6, rx: 6, ry: 10, color: '#E89A6B', opacity: 0.55, turn: 60, duration: 9000, delay: 1600 },
  { x: 0.7, y: 0.12, rx: 4, ry: 7, color: '#D6A24E', opacity: 0.6, turn: 10, duration: 7500, delay: 400 },
  { x: 0.86, y: 0.82, rx: 5, ry: 8, color: '#F2A0AE', opacity: 0.6, turn: -40, duration: 8500, delay: 1200 },
  { x: 0.59, y: 0.88, rx: 4, ry: 7, color: '#E2647C', opacity: 0.4, turn: 25, duration: 9500, delay: 2000 },
];
const LEAVES = [
  { x: 0.74, y: 0.68, turn: -10, duration: 9000, delay: 500 },
  { x: 0.95, y: 0.32, turn: 20, duration: 10000, delay: 1500 },
];
function Drift({ x, y, w, h, turn, duration, delay, still, children }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (still) return undefined;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [still, v, delay, duration]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x * w,
        top: y * h,
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -7] }) },
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, 4] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: [`${turn}deg`, `${turn + 14}deg`] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
function LightBackdrop({ still }) {
  const [size, setSize] = useState(null);
  const w = size?.width ?? 0;
  const h = size?.height ?? 0;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={e => setSize(e.nativeEvent.layout)}>
      {w > 0 && (
        <>
          <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="partnerGlowPink" cx={w * 0.85} cy={h * 0.1} r={w * 0.45} gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#F9C3CF" stopOpacity="1" />
                <Stop offset="1" stopColor="#F9C3CF" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="partnerGlowPeach" cx={w * 0.1} cy={h * 0.95} r={w * 0.5} gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#FAD7B0" stopOpacity="1" />
                <Stop offset="1" stopColor="#FAD7B0" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Rect x={0} y={0} width={w} height={h} fill="url(#partnerGlowPink)" />
            <Rect x={0} y={0} width={w} height={h} fill="url(#partnerGlowPeach)" />
          </Svg>
          {PETALS.map((p, i) => (
            <Drift key={`p${i}`} {...p} w={w} h={h} still={still}>
              <Svg width={p.rx * 2} height={p.ry * 2}>
                <Ellipse cx={p.rx} cy={p.ry} rx={p.rx} ry={p.ry} fill={p.color} opacity={p.opacity} />
              </Svg>
            </Drift>
          ))}
          {LEAVES.map((l, i) => (
            <Drift key={`l${i}`} {...l} w={w} h={h} still={still}>
              <Svg width={22} height={16} viewBox="0 0 22 16">
                <Path d="M1 14 q 8 -14 20 -10 q -6 12 -20 10 z" fill="#9CC5A8" opacity={0.8} />
              </Svg>
            </Drift>
          ))}
        </>
      )}
    </View>
  );
}
function PeopleIcon({ color, size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3.5} stroke={color} strokeWidth={1.8} />
      <Circle cx={16.5} cy={9.5} r={2.5} stroke={color} strokeWidth={1.8} />
      <Path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 6 2 6 5.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function MailIcon({ color }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect x={3} y={5} width={18} height={14} rx={2.5} stroke={color} strokeWidth={1.8} />
      <Path d="M3.5 6.5 12 13l8.5-6.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
export default function HomePartnerCard({ firstName, phaseKey, cycleDay, daysToPeriod }) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const { status, busy, invite, resend, cancel, stop } = usePartnerSharing();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const reduceMotion = useReduceMotion();
  const float = useAnimatedValue(0);
  const halo = useAnimatedValue(0);
  const meet = useAnimatedValue(1);
  const card = ownerCard(status);
  const { state: appState, dispatch } = useApp();
  const { accessToken, today, partnerLove } = appState;
  useEffect(() => {
    if (card !== 'active' || !accessToken) return;
    const to = todayISO();
    const from = addDays(to, -60);
    partnerApi
      .getPartnerLove({ from, to }, accessToken)
      .then(data => dispatch({ type: A.PARTNER_LOVE_HYDRATED, from, to, items: data.items }))
      .catch(() => {});
  }, [card, accessToken, today, dispatch]);
  const loveToday = partnerLove?.[todayISO()];
  useEffect(() => {
    if (reduceMotion || card !== 'none') return undefined;
    const anim = Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(float, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(halo, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(halo, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, card, float, halo]);
  useEffect(() => {
    if (reduceMotion || card !== 'active') {
      meet.setValue(1);
      return undefined;
    }
    meet.setValue(0);
    const anim = Animated.timing(meet, {
      toValue: 1,
      duration: 900,
      delay: 400,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, card, meet]);
  if (card === 'loading' || card === 'hidden') return null;
  const partnerName = status.partnerFirstName || 'your partner';
  const Partner = status.partnerFirstName || 'Your partner';
  function openInviteFromManage() {
    setManageOpen(false);
    setInviteOpen(true);
  }
  async function afterConfirm() {
    const action = confirm;
    if (!(await stop())) return;
    setConfirm(null);
    setManageOpen(false);
    if (action === 'change') setInviteOpen(true);
  }
  async function resendFromManage() {
    if (await resend()) setManageOpen(false);
  }
  async function cancelFromManage() {
    if (await cancel()) setManageOpen(false);
  }
  const copy = homeInviteCopy({ firstName, phaseKey, cycleDay, daysToPeriod });
  const since = sharedSinceLabel(status.sharedSince);
  return (
    <View>
      {card === 'none' && (
        <HeroFrame
          borderColor={colors.primarySoftBorder}
          radius={28}
          width={isDark ? 1.5 : 2}
          gradient={isDark ? undefined : LIGHT_RING}
          reduceMotion={reduceMotion}
        >
          <LinearGradient
            colors={isDark ? [colors.surface, colors.primarySoft] : LIGHT_CARD}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.inviteCard}
          >
            {!isDark && <LightBackdrop still={reduceMotion} />}
            <View style={s.inviteHead}>
              <Animated.View style={{ transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] }}>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    s.halo,
                    {
                      opacity: halo.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] }),
                      transform: [{ scale: halo.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }],
                    },
                  ]}
                />
                <View style={s.iconSmall}>
                  <PeopleIcon color={colors.primary} size={16} />
                </View>
              </Animated.View>
              <Text style={s.eyebrow}>Partner</Text>
            </View>
            <AnimatedHeadline key={copy.title} parts={[{ text: copy.title }]} style={s.serif} reduceMotion={reduceMotion} />
            <Text style={s.body}>{copy.body}</Text>
            <Pressable
              onPress={() => setInviteOpen(true)}
              accessibilityRole="button"
              style={({ pressed }) => [s.ctaWrap, pressed && { opacity: 0.8 }]}
            >
              <LinearGradient colors={colors.gradient.primaryAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
                <Text style={s.ctaTx}>Invite partner</Text>
                <ChevronRightIcon size={14} color={colors.white} />
              </LinearGradient>
            </Pressable>
          </LinearGradient>
        </HeroFrame>
      )}
      {(card === 'pending' || card === 'expired') && (
        <View style={s.rowCard}>
          <View style={[s.iconCircle, { backgroundColor: colors.tertiarySoft }]}>
            <MailIcon color={colors.tertiaryDeep} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={s.titleRow}>
              <Text style={[s.rowTitle, { flexShrink: 1 }]} numberOfLines={1}>
                {card === 'pending' ? 'Waiting for your partner to join' : 'Invite expired'}
              </Text>
              <View style={[s.pill, { backgroundColor: card === 'pending' ? colors.tertiarySoft : colors.border }]}>
                <Text style={[s.pillTx, { color: card === 'pending' ? colors.tertiaryDeep : colors.textSecondary }]}>
                  {card === 'pending' ? 'Pending' : 'Expired'}
                </Text>
              </View>
            </View>
            <Text style={s.rowSub} numberOfLines={1}>
              {`${status.inviteEmail} · ${inviteExpiryText(status.inviteExpiresAt)}`}
            </Text>
          </View>
          <Pressable style={s.manage} onPress={() => setManageOpen(true)} accessibilityRole="button">
            <Text style={s.manageTx}>Manage</Text>
          </Pressable>
        </View>
      )}
      {card === 'active' && (
        <HeroFrame
          borderColor={colors.primarySoftBorder}
          radius={24}
          width={isDark ? 1.5 : 2}
          gradient={isDark ? undefined : LIGHT_RING}
          reduceMotion={reduceMotion}
        >
          <LinearGradient
            colors={isDark ? [colors.surface, colors.primarySoft, colors.tertiarySoft] : LIGHT_CARD}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.syncCard}
          >
            {!isDark && <LightBackdrop still={reduceMotion} />}
            <View style={s.syncHead}>
              <View style={s.avatars}>
                <Animated.View style={{ transform: [{ translateX: meet.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) }] }}>
                  <Avatar name={firstName || 'You'} size={38} />
                </Animated.View>
                <Animated.View
                  style={[s.secondAvatar, { transform: [{ translateX: meet.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}
                >
                  <Avatar name={partnerName} size={38} />
                </Animated.View>
              </View>
              <Text style={[s.serif, { flex: 1, fontSize: 19, lineHeight: 24 }]}>{connectedTitle(status.partnerFirstName)}</Text>
            </View>
            <Text style={s.body}>{connectedLine({ partnerName: status.partnerFirstName })}</Text>
            {loveToday ? (
              <View style={s.lovePanel}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill={colors.primary}>
                  <Path d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z" />
                </Svg>
                <View style={{ flex: 1 }}>
                  <Text style={s.loveTitle}>
                    {loveToday.labels.length
                      ? `${loveToday.partnerName || Partner} promised: ${loveToday.labels.join(' · ')}`
                      : `${loveToday.partnerName || Partner} left you a note today`}
                  </Text>
                  {loveToday.note ? <Text style={s.loveNote}>{`“${loveToday.note}”`}</Text> : null}
                </View>
              </View>
            ) : null}
            <View style={s.syncFoot}>
              {headsUpChip(daysToPeriod) ? (
                <View style={[s.chip, { backgroundColor: colors.surface }]}>
                  <Text style={s.chipTx}>{headsUpChip(daysToPeriod)}</Text>
                </View>
              ) : (
                <View />
              )}
              <Pressable
                style={[s.manage, { borderColor: colors.primarySoftBorder }]}
                onPress={() => setManageOpen(true)}
                accessibilityRole="button"
              >
                <Text style={s.manageTx}>Manage</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </HeroFrame>
      )}
      <BottomSheet open={manageOpen} onClose={() => setManageOpen(false)} title="Your partner">
        {card === 'active' ? (
          <View style={s.sheet}>
            <View style={s.box}>
              <View style={s.boxRow}>
                <Avatar name={partnerName} size={40} />
                <View>
                  <Text style={s.rowTitle}>{Partner}</Text>
                  {since ? <Text style={s.rowSub}>{since}</Text> : null}
                </View>
              </View>
            </View>
            <View style={s.box}>
              <Text style={s.rowTitle}>{`What ${partnerName} can see`}</Text>
              <Text style={s.body}>
                {`Everything you track: your cycle, predictions, flow, mood, symptoms, notes and intimacy. ${Partner} can look but can't change anything, and gets a reminder 5 days before your period.`}
              </Text>
            </View>
            <View style={[s.box, s.list]}>
              <Pressable style={s.listRow} onPress={() => setConfirm('change')}>
                <Text style={s.listTx}>Change partner</Text>
              </Pressable>
              <Pressable style={[s.listRow, { borderBottomWidth: 0 }]} onPress={() => setConfirm('stop')}>
                <Text style={[s.listTx, { color: colors.error }]}>Stop sharing</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={s.sheet}>
            <View style={s.box}>
              <Text style={s.rowTitle} numberOfLines={1}>
                {status.inviteEmail}
              </Text>
              <Text style={s.rowSub}>{inviteExpiryText(status.inviteExpiresAt)}</Text>
            </View>
            <View style={[s.box, s.list]}>
              <Pressable style={s.listRow} onPress={resendFromManage} disabled={busy}>
                <Text style={s.listTx}>{card === 'expired' ? 'Send a new code' : 'Resend code'}</Text>
              </Pressable>
              <Pressable style={s.listRow} onPress={openInviteFromManage}>
                <Text style={s.listTx}>Change email</Text>
              </Pressable>
              <Pressable style={[s.listRow, { borderBottomWidth: 0 }]} onPress={cancelFromManage} disabled={busy}>
                <Text style={[s.listTx, { color: colors.error }]}>Cancel invite</Text>
              </Pressable>
            </View>
          </View>
        )}
      </BottomSheet>
      <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} onSend={invite} busy={busy} />
      <ConfirmModal
        visible={confirm === 'stop'}
        title={`Stop sharing with ${partnerName}?`}
        message={`${Partner} will stop seeing your cycle straight away and won't get reminders. You can invite someone again anytime.`}
        confirmLabel={busy ? 'Stopping…' : 'Stop sharing'}
        destructive
        onConfirm={afterConfirm}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmModal
        visible={confirm === 'change'}
        title="Change partner?"
        message={`${Partner} will stop seeing your cycle straight away. Then you can invite someone new.`}
        confirmLabel={busy ? 'Stopping…' : 'Stop and invite'}
        destructive
        onConfirm={afterConfirm}
        onCancel={() => setConfirm(null)}
      />
    </View>
  );
}
function createStyles(c, isDark) {
  return StyleSheet.create({
    inviteCard: { borderRadius: isDark ? 26.5 : 26, paddingVertical: 14, paddingHorizontal: 16, gap: 6, overflow: 'hidden' },
    halo: {
      position: 'absolute',
      top: -4,
      left: -4,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: isDark ? c.primarySoftBorder : '#F6C9D2',
    },
    iconSmall: { width: 30, height: 30, borderRadius: 15, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
      borderRadius: 99,
      paddingVertical: 5,
      paddingHorizontal: 10,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: isDark ? c.border : c.primarySoftBorder,
    },
    chipTx: { fontSize: 9, fontWeight: '600', color: c.textSecondary },
    ctaWrap: { alignSelf: 'flex-start', marginTop: 4 },
    cta: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingVertical: 9, paddingHorizontal: 16 },
    ctaTx: { fontSize: 11, fontWeight: '700', color: c.white },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    pill: { borderRadius: 99, paddingVertical: 3, paddingHorizontal: 9 },
    pillTx: { fontSize: 9, fontWeight: '700' },
    syncFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    inviteHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
    eyebrow: { fontSize: 9, fontWeight: '700', color: c.tertiaryDeep, textTransform: 'uppercase', letterSpacing: 1 },
    serif: { fontFamily: FONT.serif, fontSize: 20, lineHeight: 26, color: c.textPrimary },
    body: { fontSize: 11, lineHeight: 18, color: c.textSecondary },
    lovePanel: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      marginTop: 10,
      marginBottom: 2,
      padding: 10,
      borderRadius: 14,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.primarySoftBorder,
    },
    loveTitle: { fontSize: 10.5, fontWeight: '700', color: c.textPrimary, lineHeight: 15 },
    loveNote: { fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 12.5, lineHeight: 18, color: c.textSecondary, marginTop: 3 },
    rowCard: {
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: 24,
      paddingVertical: 16,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    rowTitle: { fontSize: 12, fontWeight: '700', color: c.textPrimary },
    rowSub: { fontSize: 10, color: c.textSecondary, marginTop: 3 },
    manage: {
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor: c.surface,
    },
    manageTx: { fontSize: 11, fontWeight: '700', color: c.primaryDark },
    syncCard: { borderRadius: isDark ? 22.5 : 22, paddingVertical: 16, paddingHorizontal: 18, gap: 12, overflow: 'hidden' },
    syncHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatars: { flexDirection: 'row' },
    secondAvatar: { marginLeft: -10, borderRadius: 21, borderWidth: 2, borderColor: c.surface },
    sheet: { gap: 12 },
    box: { backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border, borderRadius: 20, padding: 16, gap: 6 },
    boxRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    list: { padding: 0, gap: 0, overflow: 'hidden' },
    listRow: { paddingVertical: 15, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: c.border },
    listTx: { fontSize: 12, fontWeight: '600', color: c.textPrimary },
  });
}
