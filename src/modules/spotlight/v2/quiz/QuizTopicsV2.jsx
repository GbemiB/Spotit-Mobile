import { View, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, FONT } from '../../../../shared/styles/index.js';
import { PressScale } from '../../common/SpotlightFx.jsx';
import Character from '../Character.jsx';
import { toneOf } from '../tokens.js';
import { ds, Breathe, FlipCard, SlideIn, GrowWidth } from '../motion.jsx';
import { CircleButton, SpPill, AnimIcon, Glow } from '../ui.jsx';
import { topicIcon, BACK, LOCK } from './quizArt.js';

function Hero({ t, settings, reduceMotion }) {
  const rules = [];
  if (settings?.rounds) rules.push({ label: `${settings.rounds} rounds`, free: false });
  if (settings?.lives) rules.push({ label: `${settings.lives} ${settings.lives === 1 ? 'heart' : 'hearts'}`, free: false });
  if (settings?.freeLevels)
    rules.push({ label: settings.freeLevels === 1 ? 'Level 1 free' : `Levels 1–${settings.freeLevels} free`, free: true });
  return (
    <SlideIn reduceMotion={reduceMotion} delay={60} distance={22} style={[styles.hero, { borderColor: t.border }]}>
      <LinearGradient colors={t.heroBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Breathe reduceMotion={reduceMotion} style={{ position: 'absolute', right: 0, bottom: -6 }}>
        <Character name="you" size={124} />
      </Breathe>
      <FlipCard
        reduceMotion={reduceMotion}
        style={{ position: 'absolute', right: 108, top: 18, width: 52, height: 36 }}
        front={
          <View style={[styles.flipFace, { backgroundColor: t.pink }]}>
            <Text style={styles.flipText}>MYTH</Text>
          </View>
        }
        back={
          <View style={[styles.flipFace, { backgroundColor: t.green }]}>
            <Text style={styles.flipText}>FACT</Text>
          </View>
        }
      />
      <View style={{ padding: 16, paddingRight: 0, width: 200 }}>
        <Text style={[styles.heroTitle, { color: t.text }]}>Is it a myth, or is it a fact?</Text>
        <View style={styles.rules}>
          {rules.map(r => (
            <View key={r.label} style={[styles.rule, { backgroundColor: r.free ? t.greenSoft : t.pinkSoft }]}>
              <Text style={[styles.ruleText, { color: r.free ? t.greenInk : t.pinkInk }]}>{r.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </SlideIn>
  );
}

function TopicCard({ t, item, tone, index, reduceMotion, onPress }) {
  const icon = topicIcon(item.topic.icon);
  const [bg, ink] = toneOf(t, tone);
  const pct = item.count ? Math.round((item.cleared / item.count) * 100) : 0;
  const label = item.locked ? item.status.label : item.started ? `${item.cleared} of ${item.count}` : 'New';
  return (
    <SlideIn reduceMotion={reduceMotion} delay={50 + index * 50} style={{ width: '48.5%' }}>
      <PressScale onPress={onPress} accessibilityLabel={`${item.topic.name}. ${label}`}>
        <View
          style={[
            styles.card,
            { backgroundColor: t.surface, borderColor: t.border, shadowColor: t.cardShadow, opacity: item.locked ? 0.6 : 1 },
          ]}
        >
          <View style={styles.cardTop}>
            <View style={[styles.iconTile, { backgroundColor: bg }]}>
              <AnimIcon
                d={item.locked ? LOCK : icon[0]}
                kind={item.locked ? 'bob' : icon[1]}
                color={ink}
                reduceMotion={reduceMotion || item.locked}
              />
            </View>
            <Text style={[styles.level, { color: ink }]}>{label}</Text>
          </View>
          <Text style={[styles.name, { color: t.text }]} numberOfLines={2}>
            {item.topic.name}
          </Text>
          <View style={[styles.track, { backgroundColor: t.track }]}>
            <GrowWidth reduceMotion={reduceMotion} pct={pct} delay={300}>
              <LinearGradient
                colors={[t.pink, t.goldBar]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 5, borderRadius: 999 }}
              />
            </GrowWidth>
          </View>
        </View>
      </PressScale>
    </SlideIn>
  );
}

export default function QuizTopicsV2({
  t,
  title,
  insets,
  balance,
  groups,
  chips,
  filter,
  onFilter,
  hasMore,
  loadingMore,
  loading,
  onLoadMore,
  settings,
  reduceMotion,
  onBack,
  onOpenTopic,
  onLocked,
  onOpenPoints,
}) {
  const items = groups.flatMap(g => g.items.map(item => ({ item, tone: g.tone })));
  const allChips = [{ key: 'all', label: 'All' }, ...chips];
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Glow t={t} />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
        onScroll={e => {
          const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
          if (hasMore && !loadingMore && layoutMeasurement.height + contentOffset.y > contentSize.height - 300) onLoadMore();
        }}
        scrollEventThrottle={200}
      >
        <View style={styles.header}>
          <CircleButton t={t} icon={BACK} label="Back to Spotlight" onPress={onBack} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.kicker, { color: t.pinkInk }]}>Myth or fact</Text>
            <Text style={[styles.title, { color: t.text }]} numberOfLines={1} adjustsFontSizeToFit>
              {title || 'Know Yourself'}
            </Text>
          </View>
          <SpPill t={t} balance={balance} reduceMotion={reduceMotion} onPress={onOpenPoints} />
        </View>
        <Hero t={t} settings={settings} reduceMotion={reduceMotion} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {allChips.map(c => {
            const on = filter === c.key;
            return (
              <PressScale key={c.key} onPress={() => onFilter(c.key)} accessibilityLabel={c.label}>
                <View style={[styles.chip, { backgroundColor: on ? t.pink : t.surface, borderColor: on ? t.pink : t.border }]}>
                  <Text style={[styles.chipText, { color: on ? '#FFFFFF' : t.text2 }]}>{c.label}</Text>
                </View>
              </PressScale>
            );
          })}
        </ScrollView>
        {loading ? <Text style={[styles.note, { color: t.text3 }]}>Loading topics…</Text> : null}
        <View style={styles.grid}>
          {items.map(({ item, tone }, i) => (
            <TopicCard
              key={item.topic.id}
              t={t}
              item={item}
              tone={tone}
              index={i}
              reduceMotion={reduceMotion}
              onPress={() => (item.locked ? onLocked(item.topic) : onOpenTopic(item.topic.id))}
            />
          ))}
        </View>
        {loadingMore ? <Text style={[styles.note, { color: t.text3 }]}>Loading more…</Text> : null}
        <Text style={[styles.note, { color: t.text3 }]}>For learning only, not medical advice.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  kicker: { fontSize: ds(9.5), fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontFamily: FONT.serif, fontSize: 26, lineHeight: 29 },
  hero: { marginHorizontal: 16, marginTop: 16, height: 128, borderRadius: 26, borderWidth: 1, overflow: 'hidden' },
  heroTitle: { fontFamily: FONT.serif, fontSize: 19, lineHeight: 23 },
  rules: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 10 },
  rule: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  ruleText: { fontSize: ds(9.5), fontWeight: '800' },
  flipFace: { flex: 1, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  flipText: { color: '#FFFFFF', fontSize: ds(10), fontWeight: '800', letterSpacing: 0.6 },
  chips: { gap: 6, paddingHorizontal: 16, paddingTop: 14 },
  chip: { height: 34, paddingHorizontal: 13, borderRadius: 17, borderWidth: 1, justifyContent: 'center' },
  chipText: { fontSize: ds(12), fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10, paddingHorizontal: 16, paddingTop: 12 },
  card: { padding: 12, borderRadius: 22, borderWidth: 1, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 18 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconTile: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  level: { fontSize: ds(9.5), fontWeight: '800' },
  name: { fontSize: ds(13), fontWeight: '700', lineHeight: 17, marginTop: 10, minHeight: 34 },
  track: { height: 5, borderRadius: 999, overflow: 'hidden', marginTop: 8 },
  note: { fontSize: ds(10), textAlign: 'center', marginTop: 14, paddingHorizontal: 28 },
});
