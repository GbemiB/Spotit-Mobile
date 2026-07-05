import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { todayISO } from '../../shared/utils/cycle.js';
import { levelInfo } from '../../shared/utils/levels.js';
import { useTheme } from '../../shared/styles/index.js';
import Card from '../../components/ui/Card.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import SectionHeader from '../../components/ui/SectionHeader.jsx';
import Button from '../../components/ui/Button.jsx';

const BADGES = [
  { id: 'first_log', icon: '🌱', label: 'First Log', desc: 'Log your first day', req: 1 },
  { id: 'streak_3', icon: '🔥', label: '3-Day Streak', desc: '3 days in a row', req: 3 },
  { id: 'streak_7', icon: '⭐', label: 'Week Warrior', desc: '7 days in a row', req: 7 },
  { id: 'streak_14', icon: '💎', label: 'Fortnight', desc: '14 days in a row', req: 14 },
  { id: 'logs_10', icon: '📔', label: 'Journaler', desc: 'Log 10 days total', req: 10 },
  { id: 'logs_30', icon: '📚', label: 'Chronicler', desc: 'Log 30 days total', req: 30 },
  { id: 'cycle_1', icon: '🌙', label: 'Full Cycle', desc: 'Track one full cycle', req: 1 },
  { id: 'fempoints_500', icon: '🎀', label: 'SP Rising', desc: 'Earn 500 SpotPoints', req: 500 },
];

function BadgeCard({ badge, earned, colors, s }) {
  return (
    <View style={[s.badge, !earned && s.badgeLocked]}>
      <Text style={[s.badgeIcon, !earned && { opacity: 0.25 }]}>{badge.icon}</Text>
      <Text style={[s.badgeLabel, !earned && { color: colors.textFaint }]}>{badge.label}</Text>
      <Text style={s.badgeDesc}>{badge.desc}</Text>
      {!earned && <View style={s.lockOverlay}><Text style={s.lockIcon}>🔒</Text></View>}
    </View>
  );
}

function EarnRow({ icon, action, points, last, s }) {
  return (
    <View style={[s.earnRow, last && { borderBottomWidth: 0 }]}>
      <Text style={s.earnIcon}>{icon}</Text>
      <Text style={s.earnAction}>{action}</Text>
      <Text style={s.earnPoints}>{points}</Text>
    </View>
  );
}

export default function RewardsScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { femPoints, streak, longestStreak, logs, lastClaimedDate } = state;
  const insets = useSafeAreaInsets();

  const today = todayISO();
  const level = levelInfo(femPoints);
  const totalLogs = Object.keys(logs).length;
  const claimedToday = lastClaimedDate === today;

  function isEarned(badge) {
    if (badge.id === 'first_log') return totalLogs >= 1;
    if (badge.id === 'streak_3') return longestStreak >= 3;
    if (badge.id === 'streak_7') return longestStreak >= 7;
    if (badge.id === 'streak_14') return longestStreak >= 14;
    if (badge.id === 'logs_10') return totalLogs >= 10;
    if (badge.id === 'logs_30') return totalLogs >= 30;
    if (badge.id === 'cycle_1') return totalLogs >= 28;
    if (badge.id === 'fempoints_500') return femPoints >= 500;
    return false;
  }

  const earned = BADGES.filter(b => isEarned(b));
  const locked = BADGES.filter(b => !isEarned(b));

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerSub}>Your progress</Text>
          <Text style={s.headerTitle}>Rewards</Text>
        </View>

        {/* SP hero card */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <LinearGradient colors={colors.gradient.primaryVivid} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
            <View style={s.heroTop}>
              <View>
                <Text style={s.heroLabel}>SpotPoints</Text>
                <Text style={s.heroSP}>{femPoints.toLocaleString()} SP</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.heroLabel}>Level</Text>
                <Text style={s.heroLevel}>{level.name}</Text>
              </View>
            </View>
            <View style={{ marginBottom: 10 }}>
              <ProgressBar value={level.pct} color={colors.white} trackColor="rgba(255,255,255,0.25)" height={6} radius={3} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={s.heroMeta}>{level.lo.toLocaleString()} SP</Text>
              {level.next
                ? <Text style={s.heroMeta}>{level.next.name}: {level.hi.toLocaleString()} SP</Text>
                : <Text style={s.heroMeta}>Max level!</Text>
              }
            </View>
          </LinearGradient>
        </View>

        {/* Streak cards */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Card style={[s.streakCard, { flex: 1 }]}>
              <Text style={s.streakNum}>🔥 {streak}</Text>
              <Text style={s.streakLbl}>Current streak</Text>
            </Card>
            <Card style={[s.streakCard, { flex: 1 }]}>
              <Text style={s.streakNum}>⭐ {longestStreak}</Text>
              <Text style={s.streakLbl}>Best streak</Text>
            </Card>
          </View>
        </View>

        {/* Daily reward */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Daily reward" />
          <Card style={{ padding: 18, marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <View style={s.rewardIconWrap}>
                <Text style={{ fontSize: 28 }}>🎁</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rewardTitle}>Daily check-in</Text>
                <Text style={s.rewardDesc}>Claim +50 SP every day you open Spot it</Text>
              </View>
            </View>
            <Button onPress={() => dispatch({ type: A.CLAIM_DAILY })} disabled={claimedToday}>
              {claimedToday ? '✓ Claimed today' : 'Claim +50 SP'}
            </Button>
          </Card>
        </View>

        {/* Watch ad */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Card style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <View style={s.rewardIconWrap}>
                <Text style={{ fontSize: 28 }}>🎬</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.rewardTitle}>Watch an ad</Text>
                <Text style={s.rewardDesc}>Earn +100 SP for watching a short video</Text>
              </View>
            </View>
            <Button variant="secondary" onPress={() => dispatch({ type: A.WATCH_AD })}>
              Watch for +100 SP
            </Button>
          </Card>
        </View>

        {/* How to earn */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="How to earn SP" />
          <Card style={{ padding: 0, marginTop: 10, overflow: 'hidden' }}>
            <EarnRow icon="📝" action="Log daily" points="+80 SP" s={s} />
            <EarnRow icon="🎁" action="Daily check-in" points="+50 SP" s={s} />
            <EarnRow icon="🎬" action="Watch an ad" points="+100 SP" s={s} />
            <EarnRow icon="🔥" action="7-day streak bonus" points="+200 SP" last s={s} />
          </Card>
        </View>

        {/* Badges earned */}
        {earned.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <SectionHeader title={`Badges earned (${earned.length})`} />
            <View style={s.badgeGrid}>
              {earned.map(b => <BadgeCard key={b.id} badge={b} earned colors={colors} s={s} />)}
            </View>
          </View>
        )}

        {/* Badges locked */}
        {locked.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <SectionHeader title="Locked badges" />
            <View style={s.badgeGrid}>
              {locked.map(b => <BadgeCard key={b.id} badge={b} earned={false} colors={colors} s={s} />)}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 },
    headerSub: { fontSize: 12, color: c.textMuted, fontWeight: '600', marginBottom: 2 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: c.textPrimary, letterSpacing: -0.5 },
    hero: { borderRadius: 22, padding: 22 },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
    heroLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4 },
    heroSP: { fontSize: 28, fontWeight: '800', color: c.white, letterSpacing: -0.5 },
    heroLevel: { fontSize: 14, fontWeight: '700', color: c.white },
    heroMeta: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
    streakCard: { padding: 18, alignItems: 'center', marginTop: 0 },
    streakNum: { fontSize: 18, fontWeight: '800', color: c.textPrimary, marginBottom: 4 },
    streakLbl: { fontSize: 11, color: c.textMuted, fontWeight: '600' },
    rewardIconWrap: { width: 52, height: 52, borderRadius: 14, backgroundColor: c.primarySoft, borderWidth: 1.5, borderColor: c.primarySoftBorder, alignItems: 'center', justifyContent: 'center' },
    rewardTitle: { fontSize: 12, fontWeight: '700', color: c.textPrimary, marginBottom: 4 },
    rewardDesc: { fontSize: 12, color: c.textMuted, lineHeight: 18 },
    earnRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: c.border },
    earnIcon: { fontSize: 14, width: 28 },
    earnAction: { flex: 1, fontSize: 14, color: c.textPrimary, fontWeight: '500' },
    earnPoints: { fontSize: 12, fontWeight: '700', color: c.primary },
    badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
    badge: { width: '47%', backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border, borderRadius: 20, padding: 16, alignItems: 'center', overflow: 'hidden' },
    badgeLocked: { borderColor: c.border, backgroundColor: c.surfaceAlt },
    badgeIcon: { fontSize: 18, marginBottom: 8 },
    badgeLabel: { fontSize: 12, fontWeight: '700', color: c.textPrimary, marginBottom: 4, textAlign: 'center' },
    badgeDesc: { fontSize: 10, color: c.textMuted, textAlign: 'center', lineHeight: 16 },
    lockOverlay: { position: 'absolute', top: 8, right: 8 },
    lockIcon: { fontSize: 12 },
  });
}
