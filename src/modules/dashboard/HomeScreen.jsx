import { View, ScrollView, Pressable, Image, Animated, RefreshControl, StyleSheet } from 'react-native';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import {
  phaseFor,
  nextPeriodDate,
  nextMilestone,
  addDays,
  formatDisplayDate,
  todayISO,
  toISO,
  periodStatus,
} from '../../shared/utils/cycle.js';
import { PHASE_LABELS } from '../../shared/constants/cycle.js';
import { levelInfo } from '../../shared/utils/levels.js';
import { useTheme, phases, Text, FONT } from '../../shared/styles/index.js';
import Avatar from '../../components/ui/Avatar.jsx';
import { BellIcon } from '../../components/ui/icons.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
import * as logsApi from '../../shared/api/logs.js';
import * as cycleApi from '../../shared/api/cycle.js';
import * as billingApi from '../../shared/api/billing.js';
import * as rewardsApi from '../../shared/api/rewards.js';
import * as usersApi from '../../shared/api/users.js';
import NotificationsSheet from './NotificationsSheet.jsx';
import PointsCard from './PointsCard.jsx';
import LogPeriodCta from './LogPeriodCta.jsx';
import MoodCheckIn from './MoodCheckIn.jsx';
import WeekStrip from './WeekStrip.jsx';
import ArticleSources from './ArticleSources.jsx';
import ForYouCarousel from './ForYouCarousel.jsx';
import OvulationCard from './OvulationCard.jsx';
import { RiseIn, GreetingLine, AvatarRing, ShakeEvery } from './HomeFx.jsx';
import {
  HeroFrame,
  HeroBackdrop,
  AnimatedCycleBar,
  AnimatedHeadline,
  AnimatedLabel,
  RiseText,
  FadeIn,
  useReduceMotion,
  useCountTo,
} from './HeroCardFx.jsx';
const CONTENT_IMAGES = {
  lifestyle: require('../../../assets/lifestyle.png'),
  food: require('../../../assets/food.png'),
  product: require('../../../assets/fitness.png'),
};
const TAG_COLORS = {
  Education: '#C04E68',
  Nutrition: '#3F8866',
  Sponsored: '#B0A09A',
  Health: '#C04E68',
  Fitness: '#4A6FA5',
  Wellness: '#3F8866',
  Mindfulness: '#8A6BA8',
  Tips: '#C58A3D',
};
const IMAGE_KEYS = ['lifestyle', 'food', 'product'];
const MAX_FEED_ITEMS = 3;
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
function shortDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  const {
    userName,
    femPoints,
    streak,
    cycleLength,
    periodLength,
    lastPeriodDate,
    cycleStatus,
    accessToken,
    levels,
    content,
    inbox,
    periodPromptDismissedOn,
  } = state;
  const [inboxOpen, setInboxOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const [baseLogPoints, setBaseLogPoints] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    logsApi
      .getTemplate(accessToken)
      .then(data => {
        if (data?.basePoints != null) setBaseLogPoints(data.basePoints);
      })
      .catch(() => {});
  }, []);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const now = new Date();
    const from = toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60));
    const to = toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14));
    await Promise.allSettled([
      cycleApi.getCurrent(accessToken).then(status => dispatch({ type: A.CYCLE_STATUS_HYDRATED, status })),
      logsApi.getLogsInRange({ from, to }, accessToken).then(data => dispatch({ type: A.LOGS_HYDRATED, from, to, logs: data.logs || {} })),
      billingApi
        .getStatus(accessToken)
        .then(data =>
          dispatch({
            type: A.SUBSCRIPTION_UPDATED,
            isPremium: data.isPremium,
            plan: data.plan,
            renewsAt: data.renewsAt,
            autoRenew: data.autoRenew,
          }),
        ),
      rewardsApi.getSummary(accessToken).then(data => dispatch({ type: A.REWARDS_HYDRATED, ...data })),
    ]);
    dispatch({ type: A.TODAY_CHANGED, today: todayISO() });
    setRefreshing(false);
  }, [accessToken, dispatch]);
  const today = todayISO();
  const status = periodStatus(today, lastPeriodDate, cycleLength);
  const unconfirmed = !!status && status.state !== 'tracking';
  const askStarted = unconfirmed;
  const promptDismissed = askStarted && periodPromptDismissedOn === today;
  const cycleDay = status?.cycleDay ?? cycleStatus?.cycleDay ?? null;
  const hasCycleData = cycleDay != null;
  const reportedPhaseKey = cycleStatus?.phase ?? phaseFor(cycleDay, periodLength, cycleLength).key;
  const phaseKey = unconfirmed ? null : reportedPhaseKey;
  const phase = { key: phaseKey, label: PHASE_LABELS[phaseKey], color: phases[phaseKey] };
  const nextP = cycleStatus?.nextPeriodDate ? new Date(cycleStatus.nextPeriodDate) : nextPeriodDate(lastPeriodDate, cycleLength);
  const milestone = hasCycleData && !unconfirmed ? nextMilestone(cycleDay, cycleLength, periodLength) : null;
  const milestoneDate = milestone ? addDays(today, milestone.daysUntil) : null;
  const level = levelInfo(femPoints, levels);
  const reduceMotion = useReduceMotion();
  const ovDay = cycleLength - 14;
  const daysToOv = hasCycleData ? (ovDay - cycleDay + cycleLength) % cycleLength : null;
  const ovDateLabel = daysToOv === 0 ? 'Ovulation today' : daysToOv != null ? `Ovulation ${shortDate(addDays(today, daysToOv))}` : null;
  const heroParts =
    phaseKey === 'period'
      ? [{ text: 'You’re on' }, { text: `day ${cycleDay}`, highlight: true }, { text: 'of your period' }]
      : phaseKey === 'fertile'
        ? [{ text: 'You’re in your' }, { text: 'fertile window', highlight: true }]
        : phaseKey === 'ovulation'
          ? [{ text: 'Today is your predicted' }, { text: 'ovulation day', highlight: true }]
          : null;
  const lateParts =
    status?.state === 'due'
      ? [{ text: 'Your period is' }, { text: 'due today', highlight: true }]
      : [
          { text: 'Your period is predicted to be' },
          { text: `${status?.daysLate} ${status?.daysLate === 1 ? 'day' : 'days'} late`, highlight: true },
        ];
  function dismissPeriodPrompt() {
    dispatch({ type: A.UPDATE_SETTINGS, patch: { periodPromptDismissedOn: today } });
  }
  const daysUntilShown = useCountTo(milestone?.daysUntil, cycleLength, reduceMotion);
  const insight = insightFor(phase, cycleLength);
  const feedItems = (Array.isArray(content) ? content : [])
    .filter(c => c && c.title && c.enabled !== false && c.active !== false && !c.hidden)
    .slice(0, MAX_FEED_ITEMS)
    .map((c, i) => ({
      id: c.id ?? `feed-${i}`,
      tag: c.tag || (c.sponsored ? 'Sponsored' : 'Education'),
      tagColor: TAG_COLORS[c.tag] || (c.sponsored ? TAG_COLORS.Sponsored : '#B0A09A'),
      title: c.title,
      body: c.body,
      references: c.references,
      imageSource: CONTENT_IMAGES[c.imageKey] || CONTENT_IMAGES[IMAGE_KEYS[i % IMAGE_KEYS.length]],
    }));
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 18 ? 'Good afternoon,' : 'Good evening,';
  const firstName = userName?.trim().split(/\s+/)[0] || userName;
  function goSettings() {
    dispatch({ type: A.GO, screen: 'settings' });
  }
  function openInbox() {
    setInboxOpen(true);
    if (inbox.unreadCount > 0) usersApi.markInboxRead(accessToken).catch(() => {});
  }
  function closeInbox() {
    setInboxOpen(false);
    if (inbox.unreadCount > 0) dispatch({ type: A.INBOX_READ });
  }
  function renderBody(text, accentColor) {
    if (!text?.includes('**')) return <Text style={s.fyDetailBody}>{text}</Text>;
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return (
      <Text style={s.fyDetailBody}>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <Text key={i} style={{ fontWeight: '700', color: accentColor }}>
              {part}
            </Text>
          ) : (
            part
          ),
        )}
      </Text>
    );
  }
  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <RiseIn index={0} style={s.header} reduceMotion={reduceMotion}>
        <View style={s.headerLeft}>
          <AvatarRing size={38} reduceMotion={reduceMotion}>
            <Avatar name={userName} onPress={goSettings} />
          </AvatarRing>
          <View style={{ minWidth: 0, flexShrink: 1 }}>
            <GreetingLine greeting={greeting} name={firstName} greetingStyle={s.greeting} nameStyle={s.name} reduceMotion={reduceMotion} />
          </View>
        </View>
        <View style={s.headerRight}>
          <Pressable onPress={openInbox} style={s.bellBtn} accessibilityRole="button" accessibilityLabel="Notifications">
            <ShakeEvery reduceMotion={reduceMotion}>
              <BellIcon size={18} color={colors.textPrimary} />
            </ShakeEvery>
            {inbox.unreadCount > 0 && <View style={s.bellDot} />}
          </Pressable>
        </View>
      </RiseIn>

      <RiseIn index={1} style={s.section} reduceMotion={reduceMotion}>
        <HeroFrame borderColor={colors.border} radius={32} reduceMotion={reduceMotion}>
          <Card style={[s.hero, s.heroInner]}>
            <GlowBlob size={180} duration={3500} color={isDark ? 'rgba(220,90,116,0.30)' : '#FCE3DC'} style={{ top: -50, right: -40 }} />
            <GlowBlob
              size={170}
              duration={4250}
              delay={1800}
              color={isDark ? 'rgba(214,162,78,0.24)' : '#F6E6CC'}
              style={{ bottom: -60, left: -50 }}
            />
            <HeroBackdrop isDark={isDark} reduceMotion={reduceMotion} />
            {hasCycleData && askStarted ? (
              <>
                <AnimatedLabel style={s.phaseLabel} reduceMotion={reduceMotion}>
                  Period expected · {formatDisplayDate(status.expectedDate)}
                </AnimatedLabel>
                <AnimatedHeadline parts={lateParts} style={s.heroSerif} highlightColor={colors.primary} reduceMotion={reduceMotion} />
                {status.missedCycles > 0 && (
                  <FadeIn delay={900} reduceMotion={reduceMotion}>
                    <Text style={s.predictedTx}>No period logged for {formatDisplayDate(addDays(status.expectedDate, -cycleLength))}</Text>
                  </FadeIn>
                )}
                <FadeIn delay={1000} reduceMotion={reduceMotion}>
                  <Text style={s.predictedTx}>{promptDismissed ? 'We’ll ask again tomorrow.' : 'Has your period started?'}</Text>
                </FadeIn>
                {!promptDismissed && (
                  <FadeIn delay={1100} reduceMotion={reduceMotion}>
                    <View style={s.confirmRow}>
                      <Button size="sm" onPress={() => dispatch({ type: A.OPEN_PERIOD_PICKER })}>
                        Yes, log it
                      </Button>
                      <Button size="sm" variant="secondary" onPress={dismissPeriodPrompt}>
                        Not yet
                      </Button>
                    </View>
                  </FadeIn>
                )}
              </>
            ) : hasCycleData ? (
              <>
                <AnimatedLabel style={s.phaseLabel} reduceMotion={reduceMotion}>
                  {phase.label ? `${phase.label} · ` : ''}Day {cycleDay} of {cycleLength}
                </AnimatedLabel>
                {heroParts ? (
                  <AnimatedHeadline parts={heroParts} style={s.heroSerif} highlightColor={colors.primary} reduceMotion={reduceMotion} />
                ) : (
                  <View style={s.heroRow}>
                    <RiseText style={s.heroSerifSm} delay={350} reduceMotion={reduceMotion}>
                      {milestone?.key === 'fertile'
                        ? 'Your fertile window starts in'
                        : milestone?.key === 'ovulation'
                          ? 'Ovulation in'
                          : 'Your period starts in'}
                    </RiseText>
                    <RiseText style={[s.heroSerifBig, { color: colors.primary }]} delay={450} pop reduceMotion={reduceMotion}>
                      {daysUntilShown}
                    </RiseText>
                    <RiseText style={s.heroSerifSm} delay={550} reduceMotion={reduceMotion}>
                      {milestone?.daysUntil === 1 ? 'day' : 'days'}
                    </RiseText>
                  </View>
                )}
                <FadeIn delay={1000} reduceMotion={reduceMotion}>
                  <Text style={s.predictedTx}>
                    {phaseKey === 'period' || phaseKey === 'fertile' || phaseKey === 'ovulation'
                      ? `Next period predicted ${formatDisplayDate(nextP)}`
                      : `Predicted ${formatDisplayDate(milestoneDate)}`}
                  </Text>
                </FadeIn>
                <View style={{ marginTop: 16 }}>
                  <AnimatedCycleBar
                    value={cycleDay / cycleLength}
                    colors={colors.gradient.primaryAccent}
                    trackColor={colors.border}
                    accent={colors.primary}
                    surface={colors.surface}
                    height={8}
                    fertile={{ start: (ovDay - 6) / cycleLength, end: ovDay / cycleLength }}
                    fertileColor={isDark ? 'rgba(95,169,140,0.85)' : 'rgba(95,169,140,0.8)'}
                    ovulation={(ovDay - 0.5) / cycleLength}
                    ovulationColor={phases.ovulation}
                    reduceMotion={reduceMotion}
                  />
                </View>
                <FadeIn delay={1100} reduceMotion={reduceMotion}>
                  <View style={s.dayRow}>
                    <Text style={s.dayLbl}>Day 1</Text>
                    <Text style={[s.ovLbl, { left: `${((ovDay - 0.5) / cycleLength) * 100}%` }]}>{ovDateLabel}</Text>
                    <Text style={s.dayLbl}>Day {cycleLength}</Text>
                  </View>
                </FadeIn>
              </>
            ) : (
              <>
                <Text style={s.phaseLabel}>No period logged yet</Text>
                <Text style={s.heroSerif}>Log a period to see your predictions</Text>
                <Text style={s.predictedTx}>Track today&apos;s flow and we&apos;ll start predicting your next cycle.</Text>
              </>
            )}
          </Card>
        </HeroFrame>
      </RiseIn>

      <RiseIn index={2} style={s.section} reduceMotion={reduceMotion}>
        <MoodCheckIn />
      </RiseIn>

      <RiseIn index={3} style={s.section} reduceMotion={reduceMotion}>
        <LogPeriodCta
          title={askStarted ? 'Has your period started?' : phaseKey === 'period' ? `Period day ${cycleDay}` : 'Log period'}
          subtitle={
            askStarted
              ? 'Tap to log it and earn points'
              : phaseKey === 'period'
                ? 'Tap to confirm or adjust the end date'
                : `Mark when your next period starts and earn points as you do!`
          }
          onPress={() => dispatch({ type: A.OPEN_PERIOD_PICKER })}
        />
      </RiseIn>

      <RiseIn index={4} style={s.section} reduceMotion={reduceMotion}>
        <WeekStrip />
      </RiseIn>

      <RiseIn index={5} style={s.section} reduceMotion={reduceMotion}>
        <PointsCard
          levelName={level.name}
          points={femPoints.toLocaleString()}
          pct={level.pct}
          toNextText={level.next ? `${(level.hi - femPoints).toLocaleString()} SP to ${level.next.name}` : 'Max level reached'}
          onPress={() => dispatch({ type: A.GO, screen: 'rewards' })}
        />
      </RiseIn>

      <RiseIn index={6} style={s.section} reduceMotion={reduceMotion}>
        <OvulationCard
          title={insight.title}
          body={insight.body}
          lastPeriodDate={lastPeriodDate}
          cycleLength={cycleLength}
          periodLength={periodLength}
        />
      </RiseIn>

      {feedItems.length > 0 && (
        <RiseIn index={7} style={{ marginBottom: 8 }} reduceMotion={reduceMotion}>
          <ForYouCarousel items={feedItems} onOpen={setActiveCard} />
        </RiseIn>
      )}

      <BottomSheet open={!!activeCard} onClose={() => setActiveCard(null)} title={activeCard?.title}>
        {activeCard && (
          <View>
            <Image source={activeCard.imageSource} style={s.fyDetailImage} resizeMode="cover" />
            <Text style={[s.fyTag, { color: activeCard.tagColor, marginTop: 14 }]}>{activeCard.tag.toUpperCase()}</Text>
            {renderBody(activeCard.body, activeCard.tagColor || colors.primary)}
            <ArticleSources references={activeCard.references} />
          </View>
        )}
      </BottomSheet>
      <NotificationsSheet open={inboxOpen} onClose={closeInbox} items={inbox.items} />
    </ScrollView>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    section: { paddingHorizontal: 24, marginBottom: 14 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 20 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
    heroInner: { borderRadius: 30.5, borderWidth: 0 },
    phaseLabel: { fontSize: 9, fontWeight: '700', color: c.tertiary, textTransform: 'uppercase', letterSpacing: 1 },
    heroSerif: { fontFamily: FONT.serif, fontSize: 28, color: c.textPrimary, marginTop: 12, lineHeight: 40 },
    heroRow: { flexDirection: 'row', alignItems: 'baseline', gap: 9, marginTop: 12, flexWrap: 'wrap' },
    heroSerifSm: { fontFamily: FONT.serif, fontSize: 24, color: c.textPrimary, maxWidth: '100%' },
    heroSerifBig: { fontFamily: FONT.serif, fontSize: 42 },
    predictedTx: { fontSize: 10, color: c.textMuted, marginTop: 8 },
    confirmRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
    dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
    ovLbl: {
      position: 'absolute',
      width: 120,
      marginLeft: -60,
      textAlign: 'center',
      fontSize: 8.5,
      fontWeight: '700',
      color: c.tertiaryDeep,
    },
    dayLbl: { fontSize: 8.5, color: c.textDisabled, fontWeight: '600' },
    fyTag: { fontSize: 8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
    fyDetailImage: { width: '100%', height: 180, borderRadius: 20, backgroundColor: c.surfaceAlt },
    fyDetailBody: { fontSize: 11.5, color: c.textSecondary, lineHeight: 21, marginTop: 10 },
  });
}
