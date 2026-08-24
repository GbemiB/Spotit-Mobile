import { View, ScrollView, Pressable, Image, Animated, StyleSheet } from 'react-native';
import { useState, useMemo, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { cycleDayOf, phaseFor, nextPeriodDate, formatDisplayDate, todayISO } from '../../shared/utils/cycle.js';
import { PHASE_LABELS } from '../../shared/constants/cycle.js';
import { levelInfo } from '../../shared/utils/levels.js';
import { useTheme, phases, Text, FONT } from '../../shared/styles/index.js';
import Avatar from '../../components/ui/Avatar.jsx';
import { BellIcon } from '../../components/ui/icons.jsx';
import OvulationStrip from '../../components/cycle/OvulationStrip.jsx';
import Card from '../../components/ui/Card.jsx';
import ProgressBar from '../../components/ui/ProgressBar.jsx';
import Carousel from '../../components/ui/Carousel.jsx';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
import * as logsApi from '../../shared/api/logs.js';

// Static "For you today" content — no longer backed by GET /content/feed.
const FOR_YOU_CONTENT = [
  {
    tag: 'Education',
    tagColor: '#C04E68',
    title: 'Understanding your fertile window',
    body: 'Your fertile window is the handful of days each cycle when conception is possible — typically the 5 days before ovulation through the day of ovulation itself, since sperm can survive a few days while an egg survives about 24 hours. Spot it estimates this window from your cycle length; tracking symptoms like changes in discharge can help you notice it more precisely. This is a general estimate, not medical advice.',
    imageSource: require('../../../assets/lifestyle.png'),
  },
  {
    tag: 'Nutrition',
    tagColor: '#3F8866',
    title: '5 foods that support ovulation',
    body: 'Leafy greens, berries, fatty fish, whole grains, and nuts are commonly associated with hormonal health due to their fiber, antioxidant, and omega-3 content. No single food guarantees ovulation or fertility outcomes — a balanced diet is just one factor among many. Talk to a doctor or dietitian for guidance specific to you.',
    imageSource: require('../../../assets/food.png'),
  },
  {
    tag: 'Sponsored',
    tagColor: '#B0A09A',
    title: 'Nourish prenatal multivitamins',
    body: 'A prenatal multivitamin formulated to help meet essential nutrient needs before and during pregnancy. As with any supplement, check with your doctor before starting — especially if you take other medications or have a medical condition.',
    imageSource: require('../../../assets/product.png'),
  },
];

function insightFor(phase, cycleLength) {
  const ovDay = cycleLength - 14;
  if (phase.key === 'ovulation') {
    return {
      title: 'Your fertile window is open',
      body: 'Today is your predicted ovulation day. You may notice a small temperature rise tomorrow.',
    };
  }
  if (phase.key === 'fertile') {
    return { title: 'Your fertile window is open', body: 'You’re in your fertile window — a good time to track symptoms closely.' };
  }
  return { title: 'Track your ovulation', body: `Ovulation is predicted around day ${ovDay} of your cycle.` };
}

function GlowBlob({ size, color, duration, delay = 0, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
          transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }],
        },
        style,
      ]}
    />
  );
}

export default function HomeScreen() {
  const { state, dispatch } = useApp();
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { userName, femPoints, cycleLength, periodLength, lastPeriodDate, cycleStatus, accessToken } = state;
  const insets = useSafeAreaInsets();
  const [baseLogPoints, setBaseLogPoints] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    logsApi
      .getTemplate(accessToken)
      .then(data => {
        if (data?.basePoints != null) setBaseLogPoints(data.basePoints);
      })
      .catch(() => {});
  }, []);

  const today = todayISO();
  // Prefer the server-computed status (GET /cycle/current); fall back to the local
  // calculation (same formula, mirrored in utils/cycle.js) until that resolves.
  const cycleDay = cycleStatus?.cycleDay ?? cycleDayOf(today, lastPeriodDate, cycleLength);
  const hasCycleData = cycleDay != null;
  const phaseKey = cycleStatus?.phase ?? phaseFor(cycleDay, periodLength, cycleLength).key;
  const phase = { key: phaseKey, label: PHASE_LABELS[phaseKey], color: phases[phaseKey] };
  const nextP = cycleStatus?.nextPeriodDate ? new Date(cycleStatus.nextPeriodDate) : nextPeriodDate(lastPeriodDate, cycleLength);
  const daysLeft = hasCycleData
    ? cycleStatus
      ? cycleStatus.daysUntilNextPeriod
      : Math.max(0, Math.round((nextP - new Date()) / 86400000))
    : null;
  const isDueToday = daysLeft === 0;
  const level = levelInfo(femPoints);
  const insight = insightFor(phase, cycleLength);
  const feedItems = FOR_YOU_CONTENT.map((c, i) => ({ id: i, ...c }));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,';
  const firstName = userName?.trim().split(/\s+/)[0] || userName;

  const eggFloat = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(eggFloat, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(eggFloat, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  function goSettings() {
    dispatch({ type: A.GO, screen: 'settings' });
  }

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Avatar name={userName} onPress={goSettings} />
          <View style={{ minWidth: 0 }}>
            <Text style={s.greeting}>
              {greeting} <Text style={s.name}>{firstName}</Text>
            </Text>
          </View>
        </View>
        <Pressable onPress={goSettings} style={s.bellBtn}>
          <BellIcon size={18} color={colors.textPrimary} />
          <View style={s.bellDot} />
        </Pressable>
      </View>

      {/* Countdown hero */}
      <View style={s.section}>
        <Card style={s.hero}>
          <GlowBlob size={180} duration={3500} color={isDark ? 'rgba(220,90,116,0.30)' : '#FCE3DC'} style={{ top: -50, right: -40 }} />
          <GlowBlob
            size={170}
            duration={4250}
            delay={1800}
            color={isDark ? 'rgba(214,162,78,0.24)' : '#F6E6CC'}
            style={{ bottom: -60, left: -50 }}
          />
          {hasCycleData ? (
            <>
              <Text style={s.phaseLabel}>
                {phase.label ? `${phase.label} · ` : ''}Day {cycleDay} of {cycleLength}
              </Text>
              {isDueToday ? (
                <Text style={s.heroSerif}>
                  Your period starts <Text style={[s.heroSerif, { color: colors.primary }]}>today</Text>
                </Text>
              ) : (
                <View style={s.heroRow}>
                  <Text style={s.heroSerifSm}>Your period starts in</Text>
                  <Text style={[s.heroSerifBig, { color: colors.primary }]}>{daysLeft}</Text>
                  <Text style={s.heroSerifSm}>days</Text>
                </View>
              )}
              <Text style={s.predictedTx}>Predicted {formatDisplayDate(nextP)}</Text>
              <View style={{ marginTop: 16 }}>
                <ProgressBar value={cycleDay / cycleLength} colors={colors.gradient.primaryAccent} trackColor={colors.border} height={8} />
              </View>
              <View style={s.dayRow}>
                <Text style={s.dayLbl}>Day 1</Text>
                <Text style={s.dayLbl}>Day {cycleLength}</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={s.phaseLabel}>No period logged yet</Text>
              <Text style={s.heroSerif}>Log a period to see your predictions</Text>
              <Text style={s.predictedTx}>Track today&apos;s flow and we&apos;ll start predicting your next cycle.</Text>
            </>
          )}
        </Card>
      </View>

      {/* Period log button */}
      <View style={s.section}>
        <Pressable onPress={() => dispatch({ type: A.OPEN_PERIOD_PICKER })}>
          <LinearGradient colors={colors.gradient.primaryAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.logCta}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.logCtaTitle}>{phaseKey === 'period' ? `Period day ${cycleDay}` : 'Log period'}</Text>
              <Text style={s.logCtaSub}>
                {phaseKey === 'period'
                  ? 'Tap to confirm or adjust the end date'
                  : `Mark when your next period starts and earn points as you do!`}
              </Text>
            </View>
            <View style={s.logCtaPlusWrap}>
              <Text style={s.logCtaPlus}>+</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Level strip */}
      <View style={s.section}>
        <Pressable onPress={() => dispatch({ type: A.GO, screen: 'rewards' })}>
          <Card style={s.levelStrip}>
            <LinearGradient colors={['#F6D9BE', '#F0C088']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.levelIconWrap}>
              <Text style={{ fontSize: 17 }}>🌸</Text>
            </LinearGradient>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={s.levelName}>{level.name}</Text>
                <Text style={s.levelSp}>· {femPoints.toLocaleString()} SP</Text>
              </View>
              <View style={{ marginTop: 7 }}>
                <ProgressBar value={level.pct} colors={['#E2B86A', '#D6A24E']} trackColor={colors.border} height={6} />
              </View>
              <Text style={s.levelProgress}>
                {level.next ? `${(level.hi - femPoints).toLocaleString()} SP to ${level.next.name}` : 'Max level reached'}
              </Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </Card>
        </Pressable>
      </View>

      {/* Ovulation strip */}
      <View style={s.section}>
        <LinearGradient
          colors={isDark ? ['#2A1810', '#301B0F'] : ['#FBF2EC', '#FCEAE0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.6, y: 1 }}
          style={s.ovCard}
        >
          <GlowBlob
            size={90}
            duration={2250}
            color={isDark ? 'rgba(214,162,78,0.30)' : 'rgba(214,162,78,0.28)'}
            style={{ top: -24, right: -16 }}
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Animated.Text
              style={{
                fontSize: 17,
                marginTop: 1,
                transform: [{ translateY: eggFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }],
              }}
            >
              🌼
            </Animated.Text>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.ovTitle}>{insight.title}</Text>
              <Text style={s.ovBody}>{insight.body}</Text>
            </View>
          </View>
          <View style={{ marginTop: 14 }}>
            <OvulationStrip lastPeriodDate={lastPeriodDate} cycleLength={cycleLength} periodLength={periodLength} />
          </View>
        </LinearGradient>
      </View>

      {/* For you today */}
      <View style={{ marginBottom: 8 }}>
        <Text style={[s.sectionTitle, { paddingHorizontal: 24 }]}>For you today</Text>
        <Carousel style={{ marginTop: 11 }}>
          {feedItems.map((card, i) => (
            <Pressable
              key={card.id}
              onPress={() => setActiveCard(card)}
              style={[s.fyCard, { marginLeft: i === 0 ? 24 : 12, marginRight: i === feedItems.length - 1 ? 24 : 0 }]}
            >
              <Image source={card.imageSource} style={s.fyImage} resizeMode="cover" />
              <View style={{ padding: 13 }}>
                <Text style={[s.fyTag, { color: card.tagColor }]}>{card.tag.toUpperCase()}</Text>
                <Text style={s.fyTitle}>{card.title}</Text>
              </View>
            </Pressable>
          ))}
        </Carousel>
      </View>

      <BottomSheet open={!!activeCard} onClose={() => setActiveCard(null)} title={activeCard?.title}>
        {activeCard && (
          <View>
            <Image source={activeCard.imageSource} style={s.fyDetailImage} resizeMode="cover" />
            <Text style={[s.fyTag, { color: activeCard.tagColor, marginTop: 14 }]}>{activeCard.tag.toUpperCase()}</Text>
            <Text style={s.fyDetailBody}>{activeCard.body}</Text>
          </View>
        )}
      </BottomSheet>
    </ScrollView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    section: { paddingHorizontal: 24, marginBottom: 14 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 20 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1, minWidth: 0 },
    greeting: { fontSize: 11, color: c.textMuted, fontWeight: '600', letterSpacing: 0.2 },
    name: { fontSize: 11, fontWeight: '600', color: c.textPrimary },
    bellBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bellDot: {
      position: 'absolute',
      top: 7,
      right: 8,
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: c.primary,
      borderWidth: 1.5,
      borderColor: c.surface,
    },

    hero: { borderRadius: 32, padding: 20, overflow: 'hidden' },
    phaseLabel: { fontSize: 9, fontWeight: '700', color: c.tertiary, textTransform: 'uppercase', letterSpacing: 1 },
    heroSerif: { fontFamily: FONT.serif, fontSize: 28, color: c.textPrimary, marginTop: 12, lineHeight: 40 },
    heroRow: { flexDirection: 'row', alignItems: 'baseline', gap: 9, marginTop: 12, flexWrap: 'wrap' },
    heroSerifSm: { fontFamily: FONT.serif, fontSize: 24, color: c.textPrimary },
    heroSerifBig: { fontFamily: FONT.serif, fontSize: 42 },
    predictedTx: { fontSize: 10, color: c.textMuted, marginTop: 8 },
    dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
    dayLbl: { fontSize: 8.5, color: c.textDisabled, fontWeight: '600' },

    logCta: {
      borderRadius: 22,
      paddingVertical: 15,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.28,
      shadowRadius: 18,
      elevation: 6,
    },
    logCtaTitle: { color: c.white, fontWeight: '700', fontSize: 14 },
    logCtaSub: { color: 'rgba(255,255,255,0.82)', fontSize: 10.5, marginTop: 5 },
    logCtaPlusWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
    logCtaPlus: { color: c.white, fontSize: 20, fontWeight: '300' },

    levelStrip: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
    levelIconWrap: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    levelName: { fontSize: 11.5, fontWeight: '700', color: c.textPrimary },
    levelSp: { fontSize: 9, color: c.textMuted },
    levelProgress: { fontSize: 8.5, color: c.textDisabled, marginTop: 5 },
    chevron: { fontSize: 10, fontWeight: '700', color: c.primaryDark },

    ovCard: { borderRadius: 22, padding: 17, overflow: 'hidden' },
    ovTitle: { fontSize: 12, fontWeight: '700', color: c.tertiaryDeep },
    ovBody: { fontSize: 11, color: c.textSecondary, lineHeight: 19, marginTop: 3 },

    sectionTitle: { fontSize: 12.5, fontWeight: '700', letterSpacing: -0.1, color: c.textPrimary },
    fyCard: { width: 208, borderRadius: 20, overflow: 'hidden', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
    fyImage: { width: 208, height: 118, backgroundColor: c.surfaceAlt },
    fyTag: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
    fyTitle: { fontSize: 11.5, fontWeight: '600', color: c.textPrimary, marginTop: 4, lineHeight: 18 },
    fyDetailImage: { width: '100%', height: 180, borderRadius: 20, backgroundColor: c.surfaceAlt },
    fyDetailBody: { fontSize: 11.5, color: c.textSecondary, lineHeight: 21, marginTop: 10 },
  });
}
