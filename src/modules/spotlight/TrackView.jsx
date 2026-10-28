import { View, ScrollView, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useTheme, Text, FONT } from '../../shared/styles/index.js';
import { LockIcon } from '../../components/ui/icons.jsx';
import { HeroFrame } from '../dashboard/HeroCardFx.jsx';
import { Rise, PressScale, GradientButton, Icon, Bob, Blob, STAR } from './SpotlightFx.jsx';
import { SpChip } from './HubView.jsx';
import { BackRow } from './TopicsView.jsx';
import { quizColors, tone, GROUP_ICONS } from './quizTheme.js';

function Stars({ count, size = 12 }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  return (
    <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={`${count} of 3 stars`}>
      {[1, 2, 3].map(i => (
        <Icon key={i} d={STAR} size={size} color={i <= count ? q.gold : c.border} fill />
      ))}
    </View>
  );
}

function Node({ level, t }) {
  const { colors: c } = useTheme();
  const done = level.state === 'cleared';
  const now = level.state === 'current';
  return (
    <View
      style={[
        styles.node,
        {
          backgroundColor: done ? t.ink : now ? c.surface : c.background,
          borderColor: done || now ? t.ink : c.border,
          borderWidth: now ? 2.5 : 1.5,
        },
      ]}
    >
      {done ? (
        <Icon d="M5 12.5l4.2 4.2L19 7" size={18} color="#FFFFFF" width={2.6} />
      ) : (
        <Text style={{ fontSize: 14, fontWeight: '800', color: now ? t.ink : c.textMuted }}>{level.n}</Text>
      )}
    </View>
  );
}

function LevelCard({ level, t, balance, settings, reduceMotion, onPress }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  if (level.state === 'current') {
    const label = level.cost === 0 ? 'Let’s play' : `Unlock · ${level.cost} SP`;
    return (
      <HeroFrame borderColor={t.line} radius={22} reduceMotion={reduceMotion}>
        <View style={[styles.card, styles.current, { backgroundColor: c.surface }]}>
          <Blob size={120} color={q.blobA} reduceMotion={reduceMotion} style={{ top: -50, right: -40 }} />
          <Text style={[styles.tag, { color: q.gold }]}>{level.cost === 0 ? 'Free · Up next' : `Up next · ${level.cost} SP`}</Text>
          <Text style={[styles.name, { color: c.textPrimary }]}>{level.name}</Text>
          <Text style={{ fontSize: 10, color: c.textMuted, marginTop: 2 }}>
            {settings?.rounds ?? 5} rounds · {settings?.lives ?? 3} hearts · myth or fact
          </Text>
          {level.ready === false ? (
            <Text style={{ fontSize: 11, fontWeight: '700', color: q.goldDeep, marginTop: 12 }}>
              Coming soon · new questions on the way
            </Text>
          ) : (
            <GradientButton
              small
              style={{ marginTop: 12, alignSelf: 'flex-start' }}
              colors={level.cost > balance ? q.goldButton : q.button}
              reduceMotion={reduceMotion}
              onPress={onPress}
              label={<Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>{label}</Text>}
            />
          )}
        </View>
      </HeroFrame>
    );
  }
  const done = level.state === 'cleared';
  return (
    <PressScale onPress={done ? onPress : undefined} disabled={!done} accessibilityLabel={`Level ${level.n}, ${level.name}`}>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border, borderWidth: 1.5, opacity: done ? 1 : 0.75 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.name, { color: done ? c.textPrimary : c.textMuted, fontSize: 16 }]}>{level.name}</Text>
          {done ? (
            <Stars count={level.stars} />
          ) : level.cost === 0 ? (
            <Text style={{ fontSize: 9.5, fontWeight: '700', color: q.green }}>Free</Text>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <LockIcon size={12} color={c.textMuted} />
              <Text style={{ fontSize: 9.5, fontWeight: '700', color: c.textMuted }}>{level.cost} SP</Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: 10, color: done ? t.ink : c.textMuted, marginTop: 3, fontWeight: done ? '600' : '400' }}>
          {done ? 'Replay to chase 3 stars' : `Clear level ${level.n - 1} to open`}
        </Text>
      </View>
    </PressScale>
  );
}

export default function TrackView({
  insets,
  balance,
  topic,
  levels,
  settings,
  reduceMotion,
  onBack,
  onPlayLevel,
  onHowItWorks,
  onOpenPoints,
}) {
  const { colors: c, isDark } = useTheme();
  const s = useMemo(() => createStyles(c), [c]);
  const t = tone(topic.tone, isDark);
  const cleared = levels.filter(l => l.state === 'cleared').length;
  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      <Rise index={0} reduceMotion={reduceMotion} style={s.top}>
        <BackRow label="Topics" onPress={onBack} />
        <SpChip balance={balance} onPress={onOpenPoints} reduceMotion={reduceMotion} />
      </Rise>
      <Rise index={1} reduceMotion={reduceMotion} style={s.head}>
        <Bob distance={4} reduceMotion={reduceMotion} style={[s.bigIcon, { backgroundColor: t.bg, borderColor: t.line }]}>
          <Icon d={GROUP_ICONS[topic.group]} size={26} color={t.ink} />
        </Bob>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{topic.name}</Text>
          <Text style={s.sub}>
            {cleared} of {levels.length} levels cleared
          </Text>
        </View>
      </Rise>
      <Rise index={2} reduceMotion={reduceMotion} style={s.howRow}>
        <PressScale onPress={onHowItWorks} accessibilityLabel="How it works">
          <View style={[s.how, { borderColor: c.border, backgroundColor: c.surface }]}>
            <Icon d="M12 8v.01M11 12h1v5h1M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z" size={14} color={c.primaryDark} />
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.primaryDark }}>How it works</Text>
          </View>
        </PressScale>
      </Rise>
      <View style={s.path}>
        {levels.map((level, i) => (
          <Rise key={level.n} index={3 + Math.min(i, 6)} reduceMotion={reduceMotion} style={s.step}>
            <View style={s.rail}>
              <Node level={level} t={t} />
              {i < levels.length - 1 && <View style={[s.line, { borderColor: level.state === 'cleared' ? t.ink : c.border }]} />}
            </View>
            <View style={{ flex: 1, paddingBottom: 12 }}>
              <LevelCard
                level={level}
                t={t}
                balance={balance}
                settings={settings}
                reduceMotion={reduceMotion}
                onPress={() => onPlayLevel(level)}
              />
            </View>
          </Rise>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  node: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 20, padding: 14, overflow: 'hidden' },
  current: { borderRadius: 20.5, padding: 16 },
  tag: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontFamily: FONT.serif, fontSize: 20, lineHeight: 24, marginTop: 2 },
});

function createStyles(c) {
  return StyleSheet.create({
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingRight: 24,
      marginBottom: 8,
    },
    head: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 24 },
    bigIcon: { width: 56, height: 56, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontFamily: FONT.serif, fontSize: 30, lineHeight: 36, color: c.textPrimary },
    sub: { fontSize: 11, color: c.textMuted, marginTop: 2 },
    howRow: { paddingHorizontal: 24, marginTop: 14, marginBottom: 18, flexDirection: 'row' },
    how: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 99, borderWidth: 1 },
    path: { paddingHorizontal: 24 },
    step: { flexDirection: 'row', gap: 12 },
    rail: { width: 40, alignItems: 'center' },
    line: { flex: 1, width: 0, borderLeftWidth: 2, borderStyle: 'dashed', marginVertical: 4 },
  });
}
