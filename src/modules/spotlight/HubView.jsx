import { View, ScrollView, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme, Text, FONT } from '../../shared/styles/index.js';
import { HeroFrame } from '../dashboard/HeroCardFx.jsx';
import { Rise, Blob, Waves, Beat, Flicker, Bob, PressScale, GradientButton, Icon, HEART, STAR, FLAME } from './SpotlightFx.jsx';
import QuizArt from './QuizArt.jsx';
import { quizColors, tone, GROUP_ICONS } from './quizTheme.js';

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

function Stat({ value, label, bg, children }) {
  const { colors: c } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>{children}</View>
      <View style={{ flexShrink: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: c.textPrimary, lineHeight: 17 }}>{value}</Text>
        <Text style={{ fontSize: 9, color: c.textMuted }} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </View>
  );
}

export function TopicCard({ topic, status, onPress, reduceMotion, index }) {
  const { colors: c, isDark } = useTheme();
  const t = tone(topic.tone, isDark);
  return (
    <PressScale onPress={onPress} accessibilityLabel={`${topic.name}, ${status.label}`}>
      <View style={[styles.topicCard, { backgroundColor: t.bg, borderColor: t.line }]}>
        <Bob
          distance={4}
          duration={3400}
          delay={(index % 2) * 1100}
          reduceMotion={reduceMotion}
          style={[styles.topicIcon, { backgroundColor: c.surface }]}
        >
          <Icon d={GROUP_ICONS[topic.group]} color={t.ink} />
        </Bob>
        <Text style={[styles.topicName, { color: c.textPrimary }]} numberOfLines={2}>
          {topic.name}
        </Text>
        <View style={{ marginTop: 'auto' }}>
          <Text style={{ fontSize: 9.5, fontWeight: '600', color: t.ink }}>{status.label}</Text>
          <View style={[styles.bar, { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.8)' }]}>
            <View style={{ width: `${Math.max(status.pct, 3)}%`, height: '100%', borderRadius: 99, backgroundColor: t.ink }} />
          </View>
        </View>
      </View>
    </PressScale>
  );
}

export default function HubView({
  insets,
  balance,
  stats,
  pick,
  cards,
  topicCount,
  settings,
  loading,
  error,
  onRetry,
  reduceMotion,
  onPlayPick,
  onOpenTopics,
  onOpenTopic,
  onOpenPoints,
}) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
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

      <Rise index={1} reduceMotion={reduceMotion} style={s.section}>
        <HeroFrame borderColor={c.border} radius={32} reduceMotion={reduceMotion}>
          <View style={[s.hero, { backgroundColor: c.surface }]}>
            <Blob size={180} color={q.blobA} reduceMotion={reduceMotion} style={{ top: -50, right: -40 }} />
            <Blob size={170} color={q.blobB} duration={4250} delay={1800} reduceMotion={reduceMotion} style={{ bottom: -60, left: -50 }} />
            <Waves isDark={isDark} reduceMotion={reduceMotion} />
            <QuizArt reduceMotion={reduceMotion} />
            {pick ? (
              <View style={{ maxWidth: 196 }}>
                <Text style={[s.label, { color: q.gold }]}>Today’s pick · {pick.topic.name}</Text>
                <Text style={s.heroTitle}>
                  {pick.titleA}
                  <Text style={{ fontFamily: FONT.serif, color: c.primary }}>{pick.titleB}</Text>
                </Text>
                <View style={s.metaRow}>
                  <Text style={s.meta}>
                    Level {pick.level.n} · {settings.rounds} rounds
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={`${settings.lives} hearts`}>
                    <Beat reduceMotion={reduceMotion}>
                      <Icon d={HEART} size={11} color={c.primary} fill />
                    </Beat>
                    {Array.from({ length: Math.max(0, settings.lives - 1) }, (_, i) => (
                      <Icon key={i} d={HEART} size={11} color={c.primary} fill />
                    ))}
                  </View>
                </View>
                <View style={s.ctaRow}>
                  <GradientButton
                    small
                    colors={q.button}
                    reduceMotion={reduceMotion}
                    onPress={onPlayPick}
                    label={<Text style={s.ctaTx}>{pick.free ? 'Play free' : `Play · ${pick.level.cost} SP`}</Text>}
                    icon={<Icon d="M5 12h13M13 6l6 6-6 6" size={14} color="#FFFFFF" width={2.2} />}
                  />
                </View>
              </View>
            ) : (
              <View style={{ maxWidth: 196 }}>
                <Text style={[s.label, { color: q.gold }]}>Today’s pick</Text>
                <Text style={s.heroTitle}>
                  New questions <Text style={{ fontFamily: FONT.serif, color: c.primary }}>soon</Text>
                </Text>
                <Text style={[s.meta, { marginTop: 8 }]}>We’re getting fresh myth-or-fact rounds ready for you.</Text>
              </View>
            )}
          </View>
        </HeroFrame>
      </Rise>

      <Rise index={2} reduceMotion={reduceMotion} style={[s.section, s.stats]}>
        <Stat value={stats.streak} label="day streak" bg={q.peachSoft}>
          <Flicker reduceMotion={reduceMotion}>
            <Icon d={FLAME} size={16} color={q.peach} fill />
          </Flicker>
        </Stat>
        <Stat value={stats.stars} label="stars won" bg={q.goldSoft}>
          <Icon d={STAR} size={16} color={q.gold} fill />
        </Stat>
        <Stat value={stats.levelsDone} label="levels done" bg={q.greenSoft}>
          <Icon d="M5 12.5l4.2 4.2L19 7" size={16} color={q.green} width={2.4} />
        </Stat>
      </Rise>

      <Rise index={3} reduceMotion={reduceMotion} style={s.sectionHead}>
        <Text style={s.sectionTitle}>Know Yourself</Text>
        <PressScale onPress={onOpenTopics} accessibilityLabel={`All ${topicCount} topics`}>
          <Text style={s.link}>All {topicCount} topics ›</Text>
        </PressScale>
      </Rise>

      {error ? (
        <View style={[s.section, s.notice, { borderColor: c.border, backgroundColor: c.surface }]}>
          <Text style={s.noticeTx}>{error}</Text>
          <PressScale onPress={onRetry} accessibilityLabel="Try again">
            <Text style={s.link}>Try again</Text>
          </PressScale>
        </View>
      ) : null}
      {loading && cards.length === 0 && !error ? <Text style={s.note}>Loading topics…</Text> : null}

      <Rise index={4} reduceMotion={reduceMotion}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 12, paddingBottom: 6 }}
        >
          {cards.map((card, i) => (
            <TopicCard
              key={card.topic.id}
              index={i}
              topic={card.topic}
              status={card.status}
              reduceMotion={reduceMotion}
              onPress={() => onOpenTopic(card.topic.id)}
            />
          ))}
        </ScrollView>
      </Rise>

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
  topicCard: { width: 132, height: 150, padding: 14, borderRadius: 22, borderWidth: 1.5 },
  topicIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  topicName: { fontFamily: FONT.serif, fontSize: 17, lineHeight: 20, marginTop: 12 },
  bar: { height: 5, borderRadius: 99, overflow: 'hidden', marginTop: 6 },
});

function createStyles(c) {
  return StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 20 },
    title: { fontSize: 24, fontWeight: '700', color: c.textPrimary, letterSpacing: -0.4 },
    sub: { fontSize: 11, color: c.textMuted, marginTop: 4 },
    section: { paddingHorizontal: 24, marginBottom: 14 },
    hero: { borderRadius: 30.5, padding: 20, overflow: 'hidden', minHeight: 182 },
    label: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
    heroTitle: { fontFamily: FONT.serif, fontSize: 28, lineHeight: 34, color: c.textPrimary, marginTop: 10 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    meta: { fontSize: 10, color: c.textMuted },
    ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
    ctaTx: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '700' },
    stats: { flexDirection: 'row', gap: 10, marginBottom: 22 },
    sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 6 },
    sectionTitle: { fontFamily: FONT.serif, fontSize: 20, color: c.textPrimary },
    link: { fontSize: 11, fontWeight: '700', color: c.primaryDark, paddingVertical: 10 },
    notice: { borderWidth: 1.5, borderRadius: 18, padding: 14, alignItems: 'center', gap: 2 },
    noticeTx: { fontSize: 11, color: c.textSecondary, textAlign: 'center' },
    note: { fontSize: 10, color: c.textMuted, textAlign: 'center', marginTop: 14, paddingHorizontal: 24 },
  });
}
