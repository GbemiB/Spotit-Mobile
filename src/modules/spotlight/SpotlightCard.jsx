import { Animated, Easing, View, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import Svg, { Circle, Path, Ellipse, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme, Text, FONT } from '../../shared/styles/index.js';
import { todayISO } from '../../shared/utils/cycle.js';
import { useAnimatedValue } from '../dashboard/HeroCardFx.jsx';
import { Blob, Flicker, Icon, useLoopValue, FLAME, STAR } from './SpotlightFx.jsx';
import { tone, quizColors } from './quizTheme.js';
import { rankProgress, weekDays, streakLabel, summaryLine, isRankUp, readSeenRank, saveSeenRank } from './summaryLogic.js';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RING = 92;
const R = 42;
const CIRC = 2 * Math.PI * R;
const SPRING = Easing.out(Easing.back(1.5));
const TROPHY = 'M8 4h8v4a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 12v4M9 20h6M10 16h4v4h-4z';
const SPARKS = [0, 45, 90, 135, 180, 225, 270, 315];

function useIn(reduceMotion, delay, duration = 550, easing = SPRING) {
  const v = useAnimatedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(1);
      return undefined;
    }
    const anim = Animated.timing(v, { toValue: 1, duration, delay, easing, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, delay, duration, easing, v]);
  return v;
}

function popStyle(v, from = 0.4) {
  return {
    opacity: v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [from, 1] }) }],
  };
}

function CountUp({ to, reduceMotion, style }) {
  const v = useAnimatedValue(0);
  const [shown, setShown] = useState(reduceMotion ? to : 0);
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(to);
      return undefined;
    }
    const id = v.addListener(({ value }) => setShown(Math.round(value)));
    const anim = Animated.timing(v, { toValue: to, duration: 1100, delay: 450, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    anim.start();
    return () => {
      anim.stop();
      v.removeListener(id);
    };
  }, [to, reduceMotion, v]);
  return <Text style={style}>{(reduceMotion ? to : shown).toLocaleString()}</Text>;
}

function Medal({ size, reduceMotion, celebrate }) {
  const { colors: c, isDark } = useTheme();
  const p = tone('pink', isDark);
  const g = tone('gold', isDark);
  const hl = isDark ? 'rgba(255,255,255,0.7)' : '#FFFFFF';
  const u = size / 48;
  const shine = useLoopValue(4500, reduceMotion, { linear: true, delay: 1600 });
  const enter = useIn(reduceMotion, 200, celebrate ? 1100 : 800, Easing.out(Easing.back(celebrate ? 2.4 : 1.4)));
  const star = 'M24 14.5l2 4.1 4.5.6-3.3 3.1.8 4.5-4-2.1-4 2.1.8-4.5-3.3-3.1 4.5-.6z';
  const ribbonL = 'M15 31l-4 13 7-3 4 6 4-13z';
  const ribbonR = 'M33 31l4 13-7-3-4 6-4-13z';
  const line = { stroke: p.ink, strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  return (
    <Animated.View style={[{ width: size, height: size }, popStyle(enter, 0.6)]}>
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Path d={ribbonL} fill={p.soft} />
        <Path d={ribbonL} {...line} />
        <Path d={ribbonR} fill={p.soft} />
        <Path d={ribbonR} {...line} />
        <Circle cx={24} cy={21} r={15.5} fill={p.mid} />
        <Circle cx={24} cy={21} r={15.5} {...line} />
        <Circle cx={24} cy={21} r={11} fill={p.soft} />
      </Svg>
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 13 * u, top: 10 * u, width: 22 * u, height: 22 * u, borderRadius: 11 * u, overflow: 'hidden' }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            left: 9 * u,
            top: -6 * u,
            width: 4 * u,
            height: 34 * u,
            backgroundColor: hl,
            opacity: shine.interpolate({ inputRange: [0, 0.8, 0.88, 0.96, 1], outputRange: [0, 0, 0.9, 0, 0] }),
            transform: [
              { translateX: shine.interpolate({ inputRange: [0, 0.8, 0.96, 1], outputRange: [-12 * u, -12 * u, 12 * u, 12 * u] }) },
              { rotate: '25deg' },
            ],
          }}
        />
      </View>
      <Svg width={size} height={size} viewBox="0 0 48 48" style={StyleSheet.absoluteFill}>
        <Path d={star} fill={g.mid} />
        <Path d={star} stroke={g.ink} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
        <Ellipse cx={16.5} cy={15} rx={1.6} ry={2.6} fill={hl} />
      </Svg>
      {celebrate ? <Sparks color={c.primaryLight} gold={g.mid} reduceMotion={reduceMotion} size={size} /> : null}
    </Animated.View>
  );
}

function Sparks({ color, gold, reduceMotion, size }) {
  const v = useIn(reduceMotion, 550, 900, Easing.out(Easing.cubic));
  if (reduceMotion) return null;
  return SPARKS.map((a, i) => (
    <Animated.View
      key={a}
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: size / 2 - 2.5,
        top: size / 2 - 2.5,
        width: 5,
        height: 5,
        borderRadius: 3,
        backgroundColor: i % 3 === 2 ? gold : color,
        opacity: v.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 0] }),
        transform: [{ rotate: `${a}deg` }, { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.85] }) }],
      }}
    />
  ));
}

function Ring({ pct, reduceMotion }) {
  const { colors: c } = useTheme();
  const v = useAnimatedValue(reduceMotion ? pct : 0);
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(pct);
      return undefined;
    }
    const anim = Animated.timing(v, { toValue: pct, duration: 1300, delay: 350, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [pct, reduceMotion, v]);
  return (
    <Svg width={RING} height={RING} style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}>
      <Defs>
        <SvgGradient id="spotlightRing" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={c.primaryLight} />
          <Stop offset="1" stopColor={c.primaryDark} />
        </SvgGradient>
      </Defs>
      <Circle cx={RING / 2} cy={RING / 2} r={R} stroke={c.border} strokeWidth={6} fill="none" />
      <AnimatedCircle
        cx={RING / 2}
        cy={RING / 2}
        r={R}
        stroke="url(#spotlightRing)"
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${CIRC} ${CIRC}`}
        strokeDashoffset={v.interpolate({ inputRange: [0, 1], outputRange: [CIRC, 0] })}
      />
    </Svg>
  );
}

function Win({ value, label, bg, index, reduceMotion, children }) {
  const { colors: c } = useTheme();
  const v = useIn(reduceMotion, 450 + index * 120, 500);
  return (
    <View style={[styles.win, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Animated.View style={[styles.winIcon, { backgroundColor: bg }, popStyle(v)]}>{children}</Animated.View>
      <CountUp to={value} reduceMotion={reduceMotion} style={[styles.winValue, { color: c.textPrimary }]} />
      <Text style={{ fontSize: 9.5, color: c.textMuted }} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function DayDot({ day, index, reduceMotion }) {
  const { colors: c } = useTheme();
  const v = useIn(reduceMotion, 800 + index * 80, 450);
  return (
    <View style={styles.day}>
      <View style={day.today ? [styles.todayRing, { borderColor: c.primaryLight }] : null}>
        <View style={[styles.dot, { backgroundColor: c.border }]}>
          {day.played ? <Animated.View style={[styles.dotOn, { backgroundColor: c.primary }, popStyle(v, 0.3)]} /> : null}
        </View>
      </View>
      <Text style={{ fontSize: 8.5, fontWeight: '600', color: day.today ? c.primaryDark : c.textMuted }}>{day.letter}</Text>
    </View>
  );
}

export default function SpotlightCard({ stats, userId, reduceMotion }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  const p = tone('pink', isDark);
  const g = tone('gold', isDark);
  const gr = tone('green', isDark);
  const rank = stats?.rank || null;
  const progress = rankProgress(rank, stats?.stars || 0);
  const days = weekDays(todayISO(), stats?.week);
  const summary = summaryLine(stats);
  const played = days.filter(d => d.played).length;
  const [celebrate, setCelebrate] = useState(false);
  const rankId = rank?.id;

  useEffect(() => {
    if (!rankId || !userId) return undefined;
    let cancelled = false;
    readSeenRank(userId).then(seen => {
      if (cancelled) return;
      if (isRankUp(seen, { id: rankId })) setCelebrate(true);
      saveSeenRank(userId, rankId);
    });
    return () => {
      cancelled = true;
    };
  }, [rankId, userId]);

  const tag = useIn(reduceMotion || !celebrate, 900, 500);

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: p.line }]}>
      <Blob size={150} color={p.bg} duration={9000} reduceMotion={reduceMotion} style={{ top: -55, right: -45 }} />
      {rank ? (
        <View style={styles.rankRow}>
          <View style={{ width: RING, height: RING, alignItems: 'center', justifyContent: 'center' }}>
            <Ring pct={progress.pct} reduceMotion={reduceMotion} />
            <View style={[styles.medalWell, { backgroundColor: p.bg, borderColor: p.line }]}>
              <Medal size={46} reduceMotion={reduceMotion} celebrate={celebrate} />
            </View>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.label, { color: c.primaryDark }]}>Your level</Text>
            <Text style={[styles.rankName, { color: c.primary }]} numberOfLines={1}>
              {rank.name}
            </Text>
            {celebrate ? (
              <Animated.View style={[styles.newTag, { backgroundColor: p.bg, borderColor: p.line }, popStyle(tag, 0.6)]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: c.primaryDark }}>New level!</Text>
              </Animated.View>
            ) : null}
            {progress.line ? (
              <Text style={[styles.next, { color: c.textSecondary }]}>
                {progress.top ? (
                  progress.line
                ) : (
                  <>
                    <Text style={{ fontWeight: '700', color: c.textPrimary }}>
                      {progress.need} more {progress.need === 1 ? 'star' : 'stars'}
                    </Text>{' '}
                    to {progress.next}
                  </>
                )}
              </Text>
            ) : null}
          </View>
        </View>
      ) : null}

      <View style={styles.wins}>
        <Win value={stats?.levelsDone || 0} label="levels won" bg={p.bg} index={0} reduceMotion={reduceMotion}>
          <Icon d={TROPHY} size={16} color={p.ink} width={2} />
        </Win>
        <Win value={stats?.stars || 0} label="stars" bg={g.bg} index={1} reduceMotion={reduceMotion}>
          <Icon d={STAR} size={16} color={g.mid} fill />
        </Win>
        <Win value={stats?.rightAnswers || 0} label="right answers" bg={gr.bg} index={2} reduceMotion={reduceMotion}>
          <Icon d="M5 12.5l4.2 4.2L19 7" size={16} color={gr.ink} width={2.4} />
        </Win>
      </View>

      <View style={[styles.summary, { borderTopColor: c.border }]}>
        <View style={styles.streakRow}>
          <View style={styles.streakLeft}>
            <View style={[styles.flame, { backgroundColor: q.peachSoft }]}>
              <Flicker reduceMotion={reduceMotion}>
                <Icon d={FLAME} size={16} color={q.peach} fill />
              </Flicker>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: c.textPrimary }} numberOfLines={1}>
              {streakLabel(stats?.streak || 0)}
            </Text>
          </View>
          <View style={styles.week} accessible accessibilityLabel={`Played on ${played} of the last 7 days`}>
            {days.map((day, i) => (
              <DayDot key={day.key} day={day} index={i} reduceMotion={reduceMotion} />
            ))}
          </View>
        </View>
        <Text style={{ fontSize: 11, color: c.textSecondary }}>
          {summary ? (
            <>
              Best run: <Text style={{ fontWeight: '700', color: c.textPrimary }}>{summary.run}</Text> ·{' '}
              <Text style={{ fontWeight: '700', color: c.textPrimary }}>{summary.topics}</Text>
            </>
          ) : (
            'Play your first level to start your summary.'
          )}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, borderWidth: 1.5, padding: 18, gap: 16, overflow: 'hidden' },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  medalWell: { width: 68, height: 68, borderRadius: 34, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  rankName: { fontFamily: FONT.serif, fontSize: 28, lineHeight: 33, marginTop: 4 },
  newTag: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3, marginTop: 4 },
  next: { fontSize: 11, lineHeight: 16, marginTop: 4 },
  wins: { flexDirection: 'row', gap: 8 },
  win: { flex: 1, borderWidth: 1.5, borderRadius: 18, padding: 10, gap: 6 },
  winIcon: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  winValue: { fontSize: 18, fontWeight: '800', lineHeight: 21, fontVariant: ['tabular-nums'] },
  summary: { borderTopWidth: 1, paddingTop: 14, gap: 10 },
  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  flame: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row', gap: 5 },
  day: { alignItems: 'center', gap: 4 },
  todayRing: { borderWidth: 1.5, borderRadius: 10, padding: 1.5 },
  dot: { width: 13, height: 13, borderRadius: 7, overflow: 'hidden' },
  dotOn: { width: 13, height: 13, borderRadius: 7 },
});
