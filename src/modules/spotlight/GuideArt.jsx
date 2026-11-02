import { Animated, Easing, View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Ellipse, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme, Text } from '../../shared/styles/index.js';
import { useAnimatedValue } from '../dashboard/HeroCardFx.jsx';
import { Icon, useLoopValue } from './SpotlightFx.jsx';
import TopicIcon from './TopicIcon.jsx';
import { iconPalette } from './TopicTile.jsx';

const ART_W = 220;
const ART_H = 112;
const SPRING = Easing.out(Easing.back(1.6));

function useEntrance(active, reduceMotion, delay, duration = 520) {
  const v = useAnimatedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(1);
      return undefined;
    }
    if (!active) {
      v.setValue(0);
      return undefined;
    }
    const anim = Animated.timing(v, { toValue: 1, duration, delay, easing: SPRING, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [active, reduceMotion, delay, duration, v]);
  return v;
}

function pop(v) {
  return {
    opacity: v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
    transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
  };
}

function Layer({ origin, style, children, w = ART_W, h = ART_H, viewBox }) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { transformOrigin: `${(origin[0] / w) * 100}% ${(origin[1] / h) * 100}%` }, style]}
    >
      <Svg width={w} height={h} viewBox={viewBox || `0 0 ${w} ${h}`}>
        {children}
      </Svg>
    </Animated.View>
  );
}

function FanTile({ icon, toneName, label, big, reduceMotion }) {
  const { colors: c, isDark } = useTheme();
  const p = iconPalette(toneName, isDark, c);
  const w = big ? 80 : 66;
  const h = big ? 90 : 74;
  return (
    <View style={[styles.tile, { width: w, height: h, borderRadius: big ? 24 : 20, backgroundColor: c.surface }]}>
      <View
        style={[StyleSheet.absoluteFill, { borderRadius: big ? 24 : 20, backgroundColor: p.bg, borderWidth: 1, borderColor: p.line }]}
      />
      <View style={{ marginTop: big ? 10 : 8 }}>
        <TopicIcon icon={icon} size={big ? 52 : 42} palette={p} play={0} reduceMotion={reduceMotion} />
      </View>
      <Text style={[styles.tileLabel, { color: p.ink, fontSize: big ? 9 : 8 }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function TopicsArt({ active, reduceMotion }) {
  const { colors: c } = useTheme();
  const left = useEntrance(active, reduceMotion, 50, 550);
  const right = useEntrance(active, reduceMotion, 150, 550);
  const mid = useEntrance(active, reduceMotion, 250, 600);
  const tick = useEntrance(active, reduceMotion, 750, 400);
  const side = (v, dir) => ({
    opacity: v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.92, 0.92] }),
    transform: [
      { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-40 * dir, 0] }) },
      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [30, 10] }) },
      { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${8 * dir}deg`] }) },
      { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
    ],
  });
  return (
    <View style={styles.art}>
      <Animated.View style={[styles.abs, { left: 18, top: 18 }, side(left, -1)]}>
        <FanTile icon="myth" toneName="pink" label="Myths" reduceMotion={reduceMotion} />
      </Animated.View>
      <Animated.View style={[styles.abs, { right: 18, top: 18 }, side(right, 1)]}>
        <FanTile icon="bowl" toneName="green" label="Food" reduceMotion={reduceMotion} />
      </Animated.View>
      <Animated.View
        style={[
          styles.abs,
          { left: 66, top: 2 },
          {
            opacity: mid.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
            transform: [
              { translateY: mid.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
              { scale: mid.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
            ],
          },
        ]}
      >
        <View style={[styles.ring, { borderColor: c.primary, backgroundColor: c.surface }]}>
          <FanTile icon="cycle" toneName="pink" label="My cycle" big reduceMotion={reduceMotion} />
        </View>
        <Animated.View style={[styles.check, { borderColor: c.surface }, pop(tick)]}>
          <LinearGradient colors={[c.primaryDark, c.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.checkFill}>
            <Icon d="M6.5 12.5l3.6 3.6 7.4-7.6" size={14} color="#FFFFFF" width={3} />
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function LevelDot({ cx, cy, n, p }) {
  return (
    <>
      <Circle cx={cx} cy={cy} r={15} fill={p.mid} />
      <Circle cx={cx} cy={cy} r={15} stroke={p.ink} strokeWidth={2.2} fill="none" />
      <Circle cx={cx - 5} cy={cy - 6} r={2.4} fill={p.hl} />
      <SvgText x={cx} y={cy + 4.5} fontSize={13} fontWeight="800" fill={p.ink} textAnchor="middle">
        {n}
      </SvgText>
    </>
  );
}

const PATH_DOTS = [
  [30, 58],
  [78, 38],
  [126, 62],
  [178, 40],
];

function LockDot({ cx, cy, p, surface }) {
  return (
    <>
      <Circle cx={cx} cy={cy} r={17} fill={p.soft} />
      <Circle cx={cx} cy={cy} r={17} stroke={p.ink} strokeWidth={2.2} fill="none" />
      <Path d={`M${cx - 4.5} ${cy - 2}v-3a4.5 4.5 0 0 1 9 0v3`} stroke={p.ink} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <Rect x={cx - 7} y={cy - 2.5} width={14} height={10} rx={3} fill={p.ink} />
      <Circle cx={cx} cy={cy + 2.5} r={1.6} fill={surface} />
    </>
  );
}

function Pill({ cx, cy, w, text, p }) {
  return (
    <>
      <Rect x={cx - w / 2} y={cy - 8} width={w} height={16} rx={8} fill={p.soft} />
      <SvgText x={cx} y={cy + 3} fontSize={9} fontWeight="700" fill={p.ink} textAnchor="middle">
        {text}
      </SvgText>
    </>
  );
}

function LevelsArt({ active, reduceMotion, freeLevels }) {
  const { colors: c, isDark } = useTheme();
  const g = iconPalette('green', isDark, c);
  const k = iconPalette('pink', isDark, c);
  const l1 = useEntrance(active, reduceMotion, 50);
  const l2 = useEntrance(active, reduceMotion, 170);
  const l3 = useEntrance(active, reduceMotion, 290);
  const l4 = useEntrance(active, reduceMotion, 450);
  const tags = useEntrance(active, reduceMotion, 600, 450);
  const enters = [l1, l2, l3, l4];
  const free = Math.max(0, Math.min(PATH_DOTS.length, freeLevels ?? 2));
  const vb = '0 0 210 96';
  const k2 = Math.min(ART_W / 210, ART_H / 96);
  const at = (x, y) => [(ART_W - 210 * k2) / 2 + x * k2, (ART_H - 96 * k2) / 2 + y * k2];
  const freeDots = PATH_DOTS.slice(0, free);
  const freeX = freeDots.length ? freeDots.reduce((sum, d) => sum + d[0], 0) / freeDots.length : null;
  const firstPaid = free < PATH_DOTS.length ? PATH_DOTS[free] : null;
  return (
    <View style={styles.art}>
      <Layer origin={[0, 0]} viewBox={vb}>
        <Path
          d="M30 58 C 60 30, 80 30, 92 46 S 128 72, 146 52 S 172 30, 184 40"
          stroke={c.border}
          strokeWidth={3}
          strokeDasharray="1 7"
          strokeLinecap="round"
          fill="none"
        />
      </Layer>
      {PATH_DOTS.map(([x, y], i) => (
        <Layer key={x} origin={at(x, y)} viewBox={vb} style={pop(enters[i])}>
          {i < free ? (
            <LevelDot cx={x} cy={y} n={i + 1} p={g} />
          ) : i === free ? (
            <LockDot cx={x} cy={y} p={k} surface={c.surface} />
          ) : (
            <LevelDot cx={x} cy={y} n={i + 1} p={k} />
          )}
        </Layer>
      ))}
      <Layer origin={at(105, 86)} viewBox={vb} style={pop(tags)}>
        {freeX != null ? <Pill cx={freeX} cy={86} w={52} text="Free" p={g} /> : null}
        {firstPaid ? <Pill cx={firstPaid[0]} cy={Math.min(firstPaid[1] + 30, 87)} w={40} text="SP" p={k} /> : null}
      </Layer>
    </View>
  );
}

const HEART_D = x => `M${x} 46s-13-7.8-13-16.4A7.2 7.2 0 0 1 ${x} 25.4a7.2 7.2 0 0 1 13 4.2C${x + 13} 38.2 ${x} 46 ${x} 46z`;
const SPARK_D = 'M120 16c1.2 8 4.4 11.2 12.4 12.4-8 1.2-11.2 4.4-12.4 12.4-1.2-8-4.4-11.2-12.4-12.4 8-1.2 11.2-4.4 12.4-12.4z';
const STAR_D = 'M156 15l4.6 9.4 10.4 1.5-7.5 7.3 1.8 10.3-9.3-4.9-9.3 4.9 1.8-10.3-7.5-7.3 10.4-1.5z';

function KitArt({ active, reduceMotion }) {
  const { colors: c, isDark } = useTheme();
  const k = iconPalette('pink', isDark, c);
  const s = iconPalette('gold', isDark, c);
  const h1 = useEntrance(active, reduceMotion, 50, 450);
  const h2 = useEntrance(active, reduceMotion, 150, 450);
  const h3 = useEntrance(active, reduceMotion, 250, 450);
  const hint = useEntrance(active, reduceMotion, 400, 450);
  const star = useEntrance(active, reduceMotion, 550, 500);
  const beat = useLoopValue(1600, reduceMotion, { delay: 1200 });
  const twA = useLoopValue(2800, reduceMotion);
  const twB = useLoopValue(3400, reduceMotion, { delay: 800 });
  const W = 176;
  const H = 64;
  const heart = (x, v, extra) => (
    <Layer key={x} w={W} h={H} origin={[x, 36]} style={[pop(v), extra]}>
      <Path d={HEART_D(x)} fill={k.mid} />
      <Path d={HEART_D(x)} stroke={k.ink} strokeWidth={2.2} strokeLinejoin="round" fill="none" />
      <Ellipse cx={x - 6.5} cy={30} rx={1.6} ry={2.6} fill={k.hl} />
    </Layer>
  );
  const twinkle = v => ({ transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.08] }) }] });
  return (
    <View style={styles.art}>
      <View style={[styles.kit, { backgroundColor: c.surface }]}>
        <View style={[StyleSheet.absoluteFill, { borderRadius: 26, backgroundColor: k.bg, borderWidth: 1, borderColor: k.line }]} />
        <View style={{ width: W, height: H }}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { transformOrigin: `${(22 / W) * 100}% ${(36 / H) * 100}%` },
              { transform: [{ scale: beat.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.12, 1] }) }] },
            ]}
          >
            {heart(22, h1)}
          </Animated.View>
          {heart(52, h2)}
          {heart(82, h3)}
          <Layer w={W} h={H} origin={[120, 30]} style={pop(hint)}>
            <Rect x={106} y={45} width={28} height={13} rx={6.5} fill={k.soft} />
            <SvgText x={120} y={54.5} fontSize={8} fontWeight="700" fill={k.ink} textAnchor="middle">
              5 SP
            </SvgText>
          </Layer>
          <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: `${(120 / W) * 100}% ${(28 / H) * 100}%` }, twinkle(twA)]}>
            <Layer w={W} h={H} origin={[120, 28]} style={pop(hint)}>
              <Path d={SPARK_D} fill={k.mid} />
              <Path d={SPARK_D} stroke={k.ink} strokeWidth={2.2} strokeLinejoin="round" fill="none" />
            </Layer>
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: `${(156 / W) * 100}% ${(30 / H) * 100}%` }, twinkle(twB)]}>
            <Layer w={W} h={H} origin={[156, 30]} style={pop(star)}>
              <Path d={STAR_D} fill={s.mid} />
              <Path d={STAR_D} stroke={s.ink} strokeWidth={2.2} strokeLinejoin="round" fill="none" />
              <Circle cx={152.5} cy={26} r={1.5} fill={s.hl} />
            </Layer>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

export default function GuideArt({ step, active, reduceMotion, freeLevels }) {
  if (step === 'topics') return <TopicsArt active={active} reduceMotion={reduceMotion} />;
  if (step === 'levels') return <LevelsArt active={active} reduceMotion={reduceMotion} freeLevels={freeLevels} />;
  return <KitArt active={active} reduceMotion={reduceMotion} />;
}

const styles = StyleSheet.create({
  art: { width: ART_W, height: ART_H, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  abs: { position: 'absolute' },
  tile: { alignItems: 'center', overflow: 'hidden' },
  tileLabel: { position: 'absolute', bottom: 7, left: 2, right: 2, textAlign: 'center', fontWeight: '700' },
  ring: { borderWidth: 2.5, borderRadius: 28, padding: 2.5 },
  check: { position: 'absolute', top: -7, right: -7, width: 26, height: 26, borderRadius: 13, borderWidth: 2.5, overflow: 'hidden' },
  checkFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  kit: { width: 196, height: 92, borderRadius: 26, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
