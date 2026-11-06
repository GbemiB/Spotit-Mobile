import { View, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useTheme, Text, FONT } from '../../../shared/styles/index.js';
import { PressScale } from '../common/motion/effects.jsx';
import { spotTokens } from '../common/style/tokens.js';
import { ds, useCountUp, SlideIn, Travel } from '../common/motion/motion.jsx';
import LevelCard, { StreakStrip } from './LevelCard.jsx';
import PlayCards from './PlayCards.jsx';

const COIN_STAR = 'M12 6.8l1.5 3.2 3.4.4-2.5 2.3.7 3.4-3.1-1.8-3.1 1.8.7-3.4-2.5-2.3 3.4-.4z';
const PETAL = 'M8 0c4 4 4 12 0 16-4-4-4-12 0-16z';

function Petal({ color, left, top, delay, reduceMotion }) {
  return (
    <Travel
      reduceMotion={reduceMotion}
      from={0}
      to={16}
      duration={11000}
      delay={delay}
      axis="y"
      style={{ position: 'absolute', left, top }}
    >
      <Svg width={16} height={16} viewBox="0 0 16 16">
        <Path d={PETAL} fill={color} />
      </Svg>
    </Travel>
  );
}

function SpPill({ t, balance, reduceMotion, onPress }) {
  const shown = useCountUp(balance, reduceMotion);
  return (
    <PressScale onPress={onPress} accessibilityLabel={`${balance} SpotPoints. Tap to see how to earn more`}>
      <View style={[styles.pill, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={10} fill={t.goldSoft} stroke={t.gold} strokeWidth={1.8} />
          <Path d={COIN_STAR} fill={t.gold} />
        </Svg>
        <Text style={[styles.pillText, { color: t.text }]}>{shown.toLocaleString()} SP</Text>
      </View>
    </PressScale>
  );
}

export default function SpotlightHub({
  insets,
  balance,
  stats,
  challenges,
  freeLevels,
  loading,
  error,
  onRetry,
  refreshing,
  onRefresh,
  reduceMotion,
  onOpenChallenge,
  onOpenPoints,
}) {
  const { isDark } = useTheme();
  const t = spotTokens(isDark);
  const isNew = !!stats && !stats.stars && !stats.levelsDone && !(stats.week || []).some(Boolean);
  const count = challenges.length;
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View pointerEvents="none" style={styles.glowWrap}>
        <Svg width="100%" height={420}>
          <Defs>
            <RadialGradient id="hubGlow" cx="70%" cy="30%" r="65%">
              <Stop offset="0" stopColor={t.glow} stopOpacity={isDark ? 1 : 0.75} />
              <Stop offset="1" stopColor={t.glow} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width="100%" height={420} fill="url(#hubGlow)" />
        </Svg>
        <Petal color={t.petal} left={40} top={112} delay={0} reduceMotion={reduceMotion} />
        <Petal color={t.petal} left={330} top={242} delay={4000} reduceMotion={reduceMotion} />
        <Petal color={t.petal} left={210} top={34} delay={7000} reduceMotion={reduceMotion} />
      </View>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={t.pink} progressViewOffset={insets.top} />
        }
      >
        <View style={styles.header}>
          <SlideIn reduceMotion={reduceMotion} delay={0}>
            <Text style={[styles.title, { color: t.text }]}>Spotlight</Text>
            <Text style={[styles.sub, { color: t.text2 }]}>Play, learn and shine</Text>
          </SlideIn>
          <SlideIn reduceMotion={reduceMotion} delay={100}>
            <SpPill t={t} balance={balance} reduceMotion={reduceMotion} onPress={onOpenPoints} />
          </SlideIn>
        </View>

        {stats ? <LevelCard t={t} stats={stats} isNew={isNew} reduceMotion={reduceMotion} /> : null}
        {stats && isNew ? <StreakStrip t={t} stats={stats} reduceMotion={reduceMotion} /> : null}

        <SlideIn reduceMotion={reduceMotion} delay={180} style={styles.sectionHead}>
          <Text style={[styles.section, { color: t.text }]}>Let’s play</Text>
          {count ? <Text style={[styles.count, { color: t.text3 }]}>{count === 1 ? '1 way to play' : `${count} ways to play`}</Text> : null}
        </SlideIn>

        {error ? (
          <View style={[styles.notice, { borderColor: t.border, backgroundColor: t.surface }]}>
            <Text style={[styles.noticeText, { color: t.text2 }]}>{error}</Text>
            <PressScale onPress={onRetry} accessibilityLabel="Try again">
              <Text style={[styles.link, { color: t.pinkInk }]}>Try again</Text>
            </PressScale>
          </View>
        ) : null}
        {loading && !count && !error ? <Text style={[styles.note, { color: t.text3 }]}>Loading challenges…</Text> : null}

        <PlayCards
          t={t}
          isDark={isDark}
          challenges={challenges}
          isNew={isNew}
          freeLevels={freeLevels}
          reduceMotion={reduceMotion}
          onOpen={onOpenChallenge}
        />

        <Text style={[styles.note, { color: t.text3 }]}>All games are pretend.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  glowWrap: { position: 'absolute', left: 0, right: 0, top: 0, height: 420 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  sub: { fontSize: ds(12), marginTop: 2 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingLeft: 8,
    paddingRight: 13,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { fontSize: ds(13), fontWeight: '800', minWidth: 48 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  section: { fontFamily: FONT.serifMedium, fontSize: 20 },
  count: { fontSize: ds(10.5), fontWeight: '600' },
  notice: { marginHorizontal: 20, marginBottom: 10, borderWidth: 1.5, borderRadius: 18, padding: 14, alignItems: 'center', gap: 2 },
  noticeText: { fontSize: ds(11), textAlign: 'center' },
  link: { fontSize: ds(11), fontWeight: '700', paddingVertical: 10 },
  note: { fontSize: ds(10), lineHeight: 15, textAlign: 'center', marginTop: 14, paddingHorizontal: 28 },
});
