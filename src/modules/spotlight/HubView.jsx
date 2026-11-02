import { View, ScrollView, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme, Text, FONT } from '../../shared/styles/index.js';
import { Rise, Bob, PressScale } from './SpotlightFx.jsx';
import SpotlightCard from './SpotlightCard.jsx';
import { QuizCard, GameGrid } from './ChallengeTiles.jsx';
import { splitChallenges } from './summaryLogic.js';
import { quizColors } from './quizTheme.js';

export function SpChip({ balance, onPress, reduceMotion }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  return (
    <PressScale onPress={onPress} accessibilityLabel={`Your SpotPoints: ${balance}`}>
      <View style={[styles.chip, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Bob distance={1.5} duration={4000} reduceMotion={reduceMotion}>
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Circle cx={12} cy={12} r={9} fill={q.goldSoft} stroke={q.gold} strokeWidth={1.8} />
            <Path d="M12 7.6l1.3 2.8 3 .3-2.3 2 .7 2.9-2.7-1.6-2.7 1.6.7-2.9-2.3-2 3-.3z" fill={q.gold} />
          </Svg>
        </Bob>
        <Text style={{ fontSize: 12, fontWeight: '700', color: c.textPrimary }}>{balance.toLocaleString()} SP</Text>
      </View>
    </PressScale>
  );
}

export default function HubView({
  insets,
  balance,
  stats,
  userId,
  challenges,
  loading,
  error,
  onRetry,
  reduceMotion,
  onOpenChallenge,
  onOpenPoints,
}) {
  const { quiz, games } = splitChallenges(challenges);
  const { colors: c } = useTheme();
  const s = useMemo(() => createStyles(c), [c]);
  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      <Rise index={0} reduceMotion={reduceMotion} style={s.header}>
        <View style={{ flexShrink: 1 }}>
          <Text style={s.title}>Spotlight</Text>
          <Text style={s.sub}>Play, learn and shine</Text>
        </View>
        <SpChip balance={balance} onPress={onOpenPoints} reduceMotion={reduceMotion} />
      </Rise>

      <Rise index={1} reduceMotion={reduceMotion} style={[s.section, { marginBottom: 22 }]}>
        <SpotlightCard stats={stats} userId={userId} reduceMotion={reduceMotion} />
      </Rise>

      <Rise index={2} reduceMotion={reduceMotion} style={s.sectionHead}>
        <Text style={s.sectionTitle}>Challenges</Text>
        {challenges.length ? (
          <Text style={s.count}>{challenges.length === 1 ? '1 way to play' : `${challenges.length} ways to play`}</Text>
        ) : null}
      </Rise>

      {error ? (
        <View style={[s.section, s.notice, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Text style={s.noticeTx}>{error}</Text>
          <PressScale onPress={onRetry} accessibilityLabel="Try again">
            <Text style={s.link}>Try again</Text>
          </PressScale>
        </View>
      ) : null}
      {loading && challenges.length === 0 && !error ? <Text style={s.note}>Loading challenges…</Text> : null}

      {quiz ? (
        <Rise index={3} reduceMotion={reduceMotion} style={[s.section, { marginBottom: 10 }]}>
          <QuizCard quiz={quiz} levelsWon={stats?.levelsDone || 0} reduceMotion={reduceMotion} onOpen={() => onOpenChallenge(quiz)} />
        </Rise>
      ) : null}
      {games.length ? (
        <Rise index={4} reduceMotion={reduceMotion} style={s.section}>
          <GameGrid games={games} reduceMotion={reduceMotion} onOpen={onOpenChallenge} />
        </Rise>
      ) : null}
      {games.length ? <Text style={s.note}>All games are pretend: no real products, doctors or money change hands.</Text> : null}

      <Text style={s.note}>For learning only. Not medical advice.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 13, borderRadius: 99, borderWidth: 1 },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  statIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

function createStyles(c) {
  return StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '700', color: c.textPrimary, letterSpacing: -0.4 },
    sub: { fontSize: 11, color: c.textMuted, marginTop: 4 },
    section: { paddingHorizontal: 24, marginBottom: 14 },
    sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 6 },
    count: { fontSize: 10.5, color: c.textMuted },
    sectionTitle: { fontFamily: FONT.serif, fontSize: 20, color: c.textPrimary },
    link: { fontSize: 11, fontWeight: '700', color: c.primaryDark, paddingVertical: 10 },
    notice: { borderWidth: 1.5, borderRadius: 18, padding: 14, alignItems: 'center', gap: 2 },
    noticeTx: { fontSize: 11, color: c.textSecondary, textAlign: 'center' },
    note: { fontSize: 10, color: c.textMuted, textAlign: 'center', marginTop: 14, paddingHorizontal: 24 },
  });
}
