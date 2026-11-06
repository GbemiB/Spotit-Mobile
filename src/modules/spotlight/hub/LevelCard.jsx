import { Animated, Pressable, ScrollView, View, StyleSheet } from 'react-native';
import { useRef, useState } from 'react';
import Svg, { Defs, RadialGradient, Stop, Circle, Path } from 'react-native-svg';
import { Text, FONT } from '../../../shared/styles/index.js';
import { useLoopValue } from '../common/motion/effects.jsx';
import { todayISO } from '../../../shared/utils/cycle.js';
import { rankProgress, weekDays } from './summaryLogic.js';
import Character from '../common/characters/Character.jsx';
import { STAR_PATH, HEART_PATH, SPARK_PATH } from '../common/style/tokens.js';
import { ds, useCountUp, Breathe, WaveOnce, FloatUp, SlideIn, GrowWidth, Squiggle, Twinkle2 } from '../common/motion/motion.jsx';

const PAGES = ['Your level', 'Your wins', 'This week'];
const FLAG = 'M6 21V4M6 4h11l-2 4 2 4H6';
const CHECK = 'M5 12.5l4.5 4.5L19 7.5';

function Glow({ t, reduceMotion }) {
  const v = useLoopValue(9000, reduceMotion);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        right: -70,
        top: -80,
        width: 200,
        height: 200,
        transform: [
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, -26] }) },
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }) },
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) },
        ],
      }}
    >
      <Svg width={200} height={200}>
        <Defs>
          <RadialGradient id="lvGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={t.cardGlow} stopOpacity={1} />
            <Stop offset="1" stopColor={t.cardGlow} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={100} cy={100} r={100} fill="url(#lvGlow)" />
      </Svg>
    </Animated.View>
  );
}

function Avatar({ t, reduceMotion }) {
  return (
    <View pointerEvents="none" style={styles.avatarBox}>
      <FloatUp reduceMotion={reduceMotion} delay={1800} style={{ left: 2, top: -4 }}>
        <Svg width={10} height={10} viewBox="0 0 24 24">
          <Path d={HEART_PATH} fill={t.pink} />
        </Svg>
      </FloatUp>
      <FloatUp reduceMotion={reduceMotion} delay={3300} style={{ left: 42, top: 2 }}>
        <Svg width={9} height={9} viewBox="0 0 24 24">
          <Path d={SPARK_PATH} fill={t.gold} />
        </Svg>
      </FloatUp>
      <FloatUp reduceMotion={reduceMotion} delay={4900} style={{ left: 24, top: -8 }}>
        <Svg width={8} height={8} viewBox="0 0 24 24">
          <Path d={HEART_PATH} fill={t.petal} />
        </Svg>
      </FloatUp>
      <WaveOnce reduceMotion={reduceMotion} style={[styles.avatar, { backgroundColor: t.pinkSoft }]}>
        <Breathe reduceMotion={reduceMotion}>
          <Character name="padbankGirl" size={64} style={{ marginBottom: -7 }} asViewer />
        </Breathe>
      </WaveOnce>
    </View>
  );
}

function RankTitle({ prefix, name, t, reduceMotion }) {
  const [w, setW] = useState(0);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 8 }}>
      {prefix ? (
        <SlideIn reduceMotion={reduceMotion} delay={250}>
          <Text style={[styles.title, { color: t.text }]}>{prefix} </Text>
        </SlideIn>
      ) : null}
      <SlideIn reduceMotion={reduceMotion} delay={400}>
        <View onLayout={e => setW(e.nativeEvent.layout.width)}>
          <Text style={[styles.title, { color: t.pinkInk, fontFamily: FONT.serifItalic }]}>{name}</Text>
          {w ? <Squiggle color={t.pink} width={w} reduceMotion={reduceMotion} /> : null}
        </View>
      </SlideIn>
    </View>
  );
}

function StarBar({ t, pct, reduceMotion }) {
  return (
    <View style={{ marginTop: 22 }}>
      <View style={[styles.track, { backgroundColor: t.track }]}>
        <GrowWidth reduceMotion={reduceMotion} pct={pct} style={{ height: '100%', borderRadius: 999, backgroundColor: t.pink }} />
      </View>
      <GrowWidth reduceMotion={reduceMotion} pct={pct} style={styles.starRail}>
        <Twinkle2 reduceMotion={reduceMotion} style={styles.barStar}>
          <Svg width={16} height={16} viewBox="0 0 24 24">
            <Path d={STAR_PATH} fill={t.gold} stroke={t.surface} strokeWidth={1.5} />
          </Svg>
        </Twinkle2>
      </GrowWidth>
    </View>
  );
}

function WinTile({ value, label, icon, bg, ink, t, index, reduceMotion, restart }) {
  const shown = useCountUp(value, reduceMotion, 1000, restart);
  return (
    <SlideIn reduceMotion={reduceMotion} delay={50 + index * 70} trigger={restart} style={[styles.winTile, { backgroundColor: bg }]}>
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d={icon} stroke={ink} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <Text style={[styles.winValue, { color: ink }]}>{shown}</Text>
      <Text style={[styles.winLabel, { color: t.text2 }]}>{label}</Text>
    </SlideIn>
  );
}

export default function LevelCard({ t, stats, isNew, reduceMotion }) {
  const [page, setPage] = useState(0);
  const [restart, setRestart] = useState(0);
  const [width, setWidth] = useState(0);
  const scroller = useRef(null);
  const stars = stats?.stars || 0;
  const rank = stats?.rank;
  const prog = rankProgress(rank, stars);
  const counted = useCountUp(stars, reduceMotion, 1000, restart);
  const pct = Math.round(prog.pct * 100);
  const nextMin = rank?.nextMinStars;
  const line = prog.top ? `${counted} stars · top level` : `${isNew ? stars : counted} of ${nextMin} stars · next: ${prog.next}`;
  const days = weekDays(todayISO(), stats?.week);
  const played = days.filter(d => d.played).length;
  const weekLine = played
    ? `You played ${played} ${played === 1 ? 'day' : 'days'} this week.${stats?.bestRun ? ` Best run: ${stats.bestRun} right in a row.` : ''}`
    : 'Play today to start your streak.';
  function show(i) {
    if (i === page) return;
    setPage(i);
    setRestart(r => r + 1);
  }
  function go(i) {
    scroller.current?.scrollTo({ x: i * (width + 40), animated: !reduceMotion });
    show(i);
  }
  function settle(e) {
    show(Math.round(e.nativeEvent.contentOffset.x / (width + 40)));
  }
  return (
    <SlideIn
      reduceMotion={reduceMotion}
      delay={80}
      distance={22}
      style={[styles.card, { backgroundColor: t.surface, borderColor: t.border, shadowColor: t.cardShadow }]}
    >
      <Glow t={t} reduceMotion={reduceMotion} />
      <Avatar t={t} reduceMotion={reduceMotion} />
      {isNew ? (
        <View>
          <View style={{ paddingRight: 66 }}>
            <Text style={[styles.kicker, { color: t.pinkInk }]}>Welcome to Spotlight</Text>
            <RankTitle prefix="You’re" name={rank?.name || ''} t={t} reduceMotion={reduceMotion} />
          </View>
          <StarBar t={t} pct={pct} reduceMotion={reduceMotion} />
          <Text style={[styles.line, { color: t.text2 }]}>{line}</Text>
        </View>
      ) : (
        <View>
          <View onLayout={e => setWidth(e.nativeEvent.layout.width)} style={{ minHeight: 128 }}>
            {width ? (
              <ScrollView
                ref={scroller}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={settle}
                style={{ marginHorizontal: -20 }}
              >
                <View style={{ width: width + 40, paddingHorizontal: 20 }}>
                  <View style={{ paddingRight: 66 }}>
                    <Text style={[styles.kicker, { color: t.pinkInk }]}>Your level</Text>
                    <RankTitle name={rank?.name || ''} t={t} reduceMotion={reduceMotion} />
                  </View>
                  <StarBar t={t} pct={pct} reduceMotion={reduceMotion} />
                  <Text style={[styles.line, { color: t.text2 }]}>{line}</Text>
                </View>
                <View style={{ width: width + 40, paddingLeft: 20, paddingRight: 86 }}>
                  <Text style={[styles.kicker, { color: t.pinkInk }]}>Your wins</Text>
                  <View style={styles.winRow}>
                    <WinTile
                      value={stats?.levelsDone || 0}
                      label="levels won"
                      icon={FLAG}
                      bg={t.pinkSoft}
                      ink={t.pinkInk}
                      t={t}
                      index={0}
                      reduceMotion={reduceMotion}
                      restart={restart}
                    />
                    <WinTile
                      value={stars}
                      label="stars"
                      icon={STAR_PATH}
                      bg={t.goldSoft}
                      ink={t.goldInk}
                      t={t}
                      index={1}
                      reduceMotion={reduceMotion}
                      restart={restart}
                    />
                    <WinTile
                      value={stats?.rightAnswers || 0}
                      label="right answers"
                      icon={CHECK}
                      bg={t.greenSoft}
                      ink={t.greenInk}
                      t={t}
                      index={2}
                      reduceMotion={reduceMotion}
                      restart={restart}
                    />
                  </View>
                </View>
                <View style={{ width: width + 40, paddingLeft: 20, paddingRight: 86 }}>
                  <Text style={[styles.kicker, { color: t.pinkInk }]}>This week</Text>
                  <View style={{ flexDirection: 'row', gap: 5, marginTop: 10 }}>
                    {days.map((d, i) => (
                      <View key={d.key} style={{ alignItems: 'center', gap: 3 }}>
                        <SlideIn reduceMotion={reduceMotion || !d.played} delay={50 + i * 50} trigger={restart}>
                          <View
                            style={[
                              styles.weekDot,
                              {
                                backgroundColor: d.played ? t.goldSoft : 'transparent',
                                borderColor: d.today ? t.pink : d.played ? t.gold : t.border,
                              },
                            ]}
                          >
                            <Svg width={10} height={10} viewBox="0 0 24 24">
                              <Path d={STAR_PATH} fill={d.played ? t.gold : t.starOff} />
                            </Svg>
                          </View>
                        </SlideIn>
                        <Text style={[styles.weekLetter, { color: d.today ? t.pinkInk : t.text3 }]}>{d.letter}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={[styles.weekLine, { color: t.text2 }]}>{weekLine}</Text>
                </View>
              </ScrollView>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', gap: 2, marginLeft: -8 }}>
            {PAGES.map((label, i) => (
              <Pressable
                key={label}
                onPress={() => go(i)}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected: page === i }}
                style={styles.dotHit}
              >
                <View
                  style={{ width: page === i ? 22 : 7, height: 7, borderRadius: 999, backgroundColor: page === i ? t.pink : t.track }}
                />
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </SlideIn>
  );
}

export function StreakStrip({ t, stats, reduceMotion }) {
  const days = weekDays(todayISO(), stats?.week);
  return (
    <SlideIn reduceMotion={reduceMotion} delay={160} style={[styles.strip, { borderColor: t.dash }]}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {days.map(d => (
          <View key={d.key} style={{ alignItems: 'center', gap: 2 }}>
            <View
              style={[styles.stripDot, { backgroundColor: d.today ? t.pinkSoft : 'transparent', borderColor: d.today ? t.pink : t.border }]}
            />
            <Text style={[styles.stripLetter, { color: d.today ? t.pinkInk : t.text3 }]}>{d.letter}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.stripText, { color: t.text2 }]}>
        <Text style={{ fontWeight: '800', color: t.text, fontSize: ds(10.5) }}>Play today</Text> to start your streak. Your wins will show
        here.
      </Text>
    </SlideIn>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    paddingTop: 26,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 18,
  },
  avatarBox: { position: 'absolute', right: 20, top: 24, width: 56, height: 56, zIndex: 1 },
  avatar: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  kicker: { fontSize: ds(10.5), fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  title: { fontFamily: FONT.serif, fontSize: 28, lineHeight: 31, letterSpacing: -0.3 },
  track: { height: 6, borderRadius: 999, overflow: 'hidden' },
  starRail: { position: 'absolute', left: 0, top: -5, height: 16 },
  barStar: { position: 'absolute', right: -8, top: 0 },
  line: { fontSize: ds(12), marginTop: 11 },
  winRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  winTile: { flex: 1, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 16, alignItems: 'center' },
  winValue: { fontFamily: FONT.serif, fontSize: 22, lineHeight: 24, marginTop: 2 },
  winLabel: { fontSize: ds(9), fontWeight: '700', marginTop: 2 },
  weekDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  weekLetter: { fontSize: ds(8.5), fontWeight: '700' },
  weekLine: { fontSize: ds(11), lineHeight: 16, marginTop: 10 },
  dotHit: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  strip: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stripDot: { width: 15, height: 15, borderRadius: 8, borderWidth: 1.5 },
  stripLetter: { fontSize: ds(8), fontWeight: '700' },
  stripText: { flex: 1, fontSize: ds(10.5), lineHeight: 15 },
});
