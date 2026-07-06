import { View, ScrollView, Pressable, Animated, Alert, StyleSheet } from 'react-native';
import { useRef, useEffect, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { cycleDayOf, phaseFor, nextPeriodDate, formatDisplayDate, todayISO } from '../../shared/utils/cycle.js';
import { levelInfo } from '../../shared/utils/levels.js';
import { PHASE_NOTES } from '../../shared/constants/cycle.js';
import { useTheme, Text } from '../../shared/styles/index.js';
import CycleRing from '../../components/cycle/CycleRing.jsx';
import Card from '../../components/ui/Card.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import Carousel from '../../components/ui/Carousel.jsx';
import SectionHeader from '../../components/ui/SectionHeader.jsx';
import Button from '../../components/ui/Button.jsx';

const TIPS = [
  { icon: '💧', title: 'Stay hydrated', body: 'Drinking water helps reduce bloating and fatigue during your cycle.' },
  { icon: '🧘', title: 'Try gentle yoga', body: 'Restorative poses can ease cramps and calm your nervous system.' },
  { icon: '🍫', title: 'Dark chocolate', body: 'Rich in magnesium — can help reduce PMS symptoms naturally.' },
  { icon: '😴', title: 'Prioritise sleep', body: 'Your body repairs and rebalances hormones during deep sleep.' },
];

function PulseBlob({ size, color, delay }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', width: size, height: size, borderRadius: size / 2,
      backgroundColor: color,
      opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.2] }),
      transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }],
    }} />
  );
}

function SpotPointsCard({ femPoints, streak, level, colors, s }) {
  const shimAnim = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimAnim, { toValue: 1, duration: 2600, useNativeDriver: true })
    ).start();
  }, []);
  return (
    <LinearGradient colors={colors.gradient.primaryVivid} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.spCard}>
      <Animated.View style={[s.shimmer, {
        transform: [{ translateX: shimAnim.interpolate({ inputRange: [-1, 1], outputRange: [-180, 180] }) }],
      }]} />
      <View style={s.spRow}>
        <View>
          <Text style={s.spLabel}>SpotPoints</Text>
          <Text style={s.spVal}>{femPoints.toLocaleString()} SP</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.spLabel}>Level</Text>
          <Text style={s.spLvl}>{level.name}</Text>
        </View>
      </View>
      <ProgressBar value={level.pct} color={colors.white} trackColor="rgba(255,255,255,0.2)" height={5} radius={3} />
      <View style={s.spMeta}>
        <Text style={s.spMetaTx}>🔥 {streak}-day streak</Text>
        {level.next && <Text style={s.spMetaTx}>{level.next.name} in {(level.hi - femPoints).toLocaleString()} SP</Text>}
      </View>
    </LinearGradient>
  );
}

export default function HomeScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { userName, femPoints, streak, cycleLength, periodLength, lastPeriodDate, logs } = state;
  const insets = useSafeAreaInsets();

  const today = todayISO();
  const cycleDay = cycleDayOf(today, lastPeriodDate, cycleLength);
  const phase = phaseFor(cycleDay, periodLength, cycleLength);
  const nextP = nextPeriodDate(lastPeriodDate, cycleLength);
  const daysLeft = Math.max(0, Math.round((nextP - new Date()) / 86400000));
  const level = levelInfo(femPoints);
  const loggedToday = !!logs[today];

  const bobAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bobAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.timing(bobAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,';

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

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.greeting}>{greeting}</Text>
          <Text style={s.name}>{userName}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <Pressable onPress={() => dispatch({ type: A.GO, screen: 'rewards' })}>
            <LinearGradient colors={colors.gradient.primary} style={s.spBadge}>
              <Text style={s.spBadgeTx}>⭐ {femPoints.toLocaleString()} SP</Text>
            </LinearGradient>
          </Pressable>
          <Pressable onPress={handleLogout} style={s.logoutBtn}>
            <Text style={s.logoutTx}>Log out  ↩</Text>
          </Pressable>
        </View>
      </View>

      {/* Cycle ring */}
      <View style={s.ringWrap}>
        <PulseBlob size={260} color={phase.color} delay={0} />
        <PulseBlob size={200} color={phase.color} delay={600} />
        <CycleRing cycleDay={cycleDay} cycleLength={cycleLength} size={220} />
        <View style={s.ringCenter} pointerEvents="none">
          <Animated.Text style={[s.ringEmoji, { transform: [{ translateY: bobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }]}>
            🩸
          </Animated.Text>
          <Text style={[s.phaseLabel, { color: phase.color }]}>{phase.label}</Text>
          <Text style={s.cycleDayTx}>Day {cycleDay}</Text>
          <Text style={s.nextPTx}>{daysLeft === 0 ? 'Period due today' : `Next period in ${daysLeft}d`}</Text>
        </View>
      </View>

      {/* Log button */}
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        {loggedToday
          ? <View style={s.loggedBadge}><Text style={s.loggedTx}>✓ Logged today</Text></View>
          : <Button onPress={() => dispatch({ type: A.OPEN_LOG })}>Log today →</Button>
        }
      </View>

      {/* SpotPoints card */}
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <SpotPointsCard femPoints={femPoints} streak={streak} level={level} colors={colors} s={s} />
      </View>

      {/* Phase tip */}
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <SectionHeader title="Phase tip" />
        <Card style={{ padding: 18, marginTop: 10 }}>
          <View style={[s.phaseChip, { backgroundColor: phase.color + '18' }]}>
            <Text style={{ color: phase.color, fontSize: 12, fontWeight: '700' }}>{phase.label}</Text>
          </View>
          <Text style={s.phaseTipTx}>{PHASE_NOTES[phase.key]}</Text>
        </Card>
      </View>

      {/* Wellness tips carousel */}
      <View style={{ marginBottom: 24 }}>
        <SectionHeader title="For you today" style={{ paddingHorizontal: 24 }} />
        <Carousel style={{ marginTop: 10 }}>
          {TIPS.map((tip, i) => (
            <Card key={i} style={[s.tipCard, { marginLeft: i === 0 ? 24 : 10, marginRight: i === TIPS.length - 1 ? 24 : 0 }]}>
              <Text style={s.tipIcon}>{tip.icon}</Text>
              <Text style={s.tipTitle}>{tip.title}</Text>
              <Text style={s.tipBody}>{tip.body}</Text>
            </Card>
          ))}
        </Carousel>
      </View>

      {/* Quick stats */}
      <View style={{ paddingHorizontal: 24 }}>
        <SectionHeader title="This cycle" />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <Card style={[s.statCard, { flex: 1 }]}>
            <Text style={s.statVal}>{cycleDay}</Text>
            <Text style={s.statLbl}>Cycle day</Text>
          </Card>
          <Card style={[s.statCard, { flex: 1 }]}>
            <Text style={s.statVal}>{cycleLength}</Text>
            <Text style={s.statLbl}>Cycle length</Text>
          </Card>
          <Card style={[s.statCard, { flex: 1 }]}>
            <Text style={s.statVal}>{Object.keys(logs).length}</Text>
            <Text style={s.statLbl}>Days logged</Text>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 20 },
    greeting: { fontSize: 12, color: c.textMuted, fontWeight: '600', marginBottom: 2 },
    name: { fontSize: 18, fontWeight: '800', color: c.textPrimary, letterSpacing: -0.5 },
    spBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
    spBadgeTx: { fontSize: 12, fontWeight: '700', color: c.white },
    logoutBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface },
    logoutTx: { fontSize: 11, fontWeight: '700', color: c.textMuted },
    ringWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 20, height: 260 },
    ringCenter: { position: 'absolute', alignItems: 'center' },
    ringEmoji: { fontSize: 28, marginBottom: 4 },
    phaseLabel: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
    cycleDayTx: { fontSize: 12, color: c.textMuted, fontWeight: '600' },
    nextPTx: { fontSize: 12, color: c.textDisabled, marginTop: 2 },
    loggedBadge: { backgroundColor: c.successSoft, borderWidth: 1.5, borderColor: c.successBorder, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
    loggedTx: { fontSize: 12, fontWeight: '700', color: c.success },
    spCard: { borderRadius: 22, padding: 20, overflow: 'hidden' },
    shimmer: { position: 'absolute', top: 0, bottom: 0, width: 80, backgroundColor: 'rgba(255,255,255,0.1)', transform: [{ skewX: '-20deg' }] },
    spRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 },
    spLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 2 },
    spVal: { fontSize: 18, fontWeight: '800', color: c.white },
    spLvl: { fontSize: 12, fontWeight: '700', color: c.white },
    spMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    spMetaTx: { fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
    phaseChip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, marginBottom: 10 },
    phaseTipTx: { fontSize: 12, color: c.textSecondary, lineHeight: 22 },
    tipCard: { width: 200, padding: 18 },
    tipIcon: { fontSize: 18, marginBottom: 10 },
    tipTitle: { fontSize: 12, fontWeight: '700', color: c.textPrimary, marginBottom: 6 },
    tipBody: { fontSize: 12, color: c.textMuted, lineHeight: 19 },
    statCard: { padding: 18, alignItems: 'center' },
    statVal: { fontSize: 24, fontWeight: '800', color: c.primary, marginBottom: 4 },
    statLbl: { fontSize: 11, color: c.textMuted, fontWeight: '600' },
  });
}
