import { View, Animated, Easing, StyleSheet } from 'react-native';
import { useMemo, useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Text, FONT } from '../../shared/styles/index.js';
import { useAnimatedValue, useReduceMotion, useCountTo, RiseText, AnimatedCycleBar, Orb, Star, Sweep } from '../dashboard/HeroCardFx.jsx';
import { RiseIn } from '../dashboard/HomeFx.jsx';

const GRADIENT = ['#E2647C', '#C8466A', '#B03E62', '#E2647C', '#C8466A'];
const BAR_SHINE = ['rgba(255,214,200,0)', 'rgba(255,180,190,0.9)', 'rgba(255,214,200,0)'];
const STARS = [
  { x: 0.12, y: 0.18, size: 9, delay: 0, duration: 3000 },
  { x: 0.55, y: 0.1, size: 7, delay: 1000, duration: 2600 },
  { x: 0.86, y: 0.58, size: 10, delay: 500, duration: 3400 },
  { x: 0.4, y: 0.62, size: 6, delay: 1600, duration: 2400 },
  { x: 0.7, y: 0.86, size: 8, delay: 2200, duration: 3200 },
  { x: 0.06, y: 0.74, size: 6, delay: 1200, duration: 2800 },
];
const PETALS = Array.from({ length: 10 }, (_, i) => ({
  x: ((i * 10 + 3) % 100) / 100,
  size: 6 + (i % 3) * 3,
  alpha: 0.35 + (i % 3) * 0.15,
  duration: 6000 + (i % 4) * 1400,
  delay: i * 900,
  sway: (i % 2 ? 1 : -1) * (14 + (i % 3) * 12),
  spin: (i % 2 ? 1 : -1) * 300,
}));

function Petal({ x, size, alpha, duration, delay, sway, spin, width }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })),
    ]);
    anim.start();
    return () => anim.stop();
  }, [delay, duration, v]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: -16,
        left: x * width,
        width: size,
        height: size,
        borderRadius: size / 2,
        borderTopRightRadius: 0,
        backgroundColor: `rgba(255,255,255,${alpha})`,
        opacity: v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.9, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -280] }) },
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, sway] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spin}deg`] }) },
        ],
      }}
    />
  );
}

function Appear({ delay, reduceMotion, style, children }) {
  const v = useAnimatedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(1);
      return undefined;
    }
    const anim = Animated.timing(v, { toValue: 1, duration: 600, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, delay, v]);
  return (
    <Animated.View
      style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}

export default function RewardsHeroCard({ levelName, points, pct, toNextText, streak, badgeCount }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const reduceMotion = useReduceMotion();
  const [size, setSize] = useState(null);
  const w = size?.width ?? 0;
  const h = size?.height ?? 0;

  const shift = useAnimatedValue(0);
  const spin = useAnimatedValue(0);
  const label = useAnimatedValue(reduceMotion ? 1 : 0);
  const divider = useAnimatedValue(reduceMotion ? 1 : 0);
  const flame = useAnimatedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      label.setValue(1);
      divider.setValue(1);
      return undefined;
    }
    const anim = Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(shift, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(shift, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ),
      Animated.loop(Animated.timing(spin, { toValue: 1, duration: 40000, easing: Easing.linear, useNativeDriver: true })),
      Animated.loop(
        Animated.sequence([
          Animated.timing(flame, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(flame, { toValue: -1, duration: 250, useNativeDriver: true }),
          Animated.timing(flame, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
      ),
      Animated.timing(label, { toValue: 1, duration: 900, delay: 250, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(divider, { toValue: 1, duration: 800, delay: 1100, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, shift, spin, flame, label, divider]);

  const pointsShown = useCountTo(points, 0, reduceMotion);
  const streakShown = useCountTo(streak, 0, reduceMotion);
  const badgesShown = useCountTo(badgeCount, 0, reduceMotion);

  return (
    <RiseIn index={0} reduceMotion={reduceMotion}>
      <View style={s.hero} onLayout={e => setSize(e.nativeEvent.layout)}>
        {reduceMotion || w === 0 ? (
          <LinearGradient colors={['#E2647C', '#C8466A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        ) : (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: w * 3,
              transform: [{ translateX: shift.interpolate({ inputRange: [0, 1], outputRange: [0, -w * 2] }) }],
            }}
          >
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
        )}
        {!reduceMotion && w > 0 && (
          <>
            <Orb
              size={180}
              color="rgba(255,214,200,0.55)"
              top={-40}
              left={w * 0.3}
              duration={14000}
              path={[
                [0, 0],
                [60, 30],
                [-30, 50],
                [0, 0],
              ]}
            />
            <Orb
              size={200}
              color="rgba(246,217,190,0.45)"
              top={h - 140}
              left={w - 180}
              duration={11000}
              path={[
                [0, 0],
                [-80, -30],
                [0, 0],
              ]}
            />
          </>
        )}
        <Animated.Text
          style={[
            s.heroFlower,
            !reduceMotion && { transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] },
          ]}
        >
          🌸
        </Animated.Text>
        {!reduceMotion && w > 0 && (
          <>
            {PETALS.map((p, i) => (
              <Petal key={`p${i}`} {...p} width={w} />
            ))}
            {STARS.map((st, i) => (
              <Star key={`s${i}`} {...st} color="#FFF3D1" width={w} height={h} />
            ))}
            <Sweep width={w} />
          </>
        )}

        <Animated.Text
          style={[
            s.heroLabel,
            {
              opacity: label.interpolate({ inputRange: [0, 1], outputRange: [0, 0.85] }),
              letterSpacing: label.interpolate({ inputRange: [0, 1], outputRange: [6, 0] }),
            },
          ]}
        >
          Current level
        </Animated.Text>
        <RiseText style={s.heroLevel} delay={400} reduceMotion={reduceMotion}>
          {levelName}
        </RiseText>
        <Appear delay={600} reduceMotion={reduceMotion}>
          <Text style={s.heroPoints}>{(pointsShown ?? 0).toLocaleString()} Spotit points</Text>
        </Appear>
        <View style={{ marginTop: 16 }}>
          <AnimatedCycleBar
            value={pct}
            colors={['#FFFFFF', '#FFFFFF']}
            trackColor="rgba(255,255,255,0.25)"
            accent="#FFFFFF"
            surface="#FFFFFF"
            height={8}
            shineColors={BAR_SHINE}
            reduceMotion={reduceMotion}
          />
        </View>
        <Appear delay={1000} reduceMotion={reduceMotion}>
          <Text style={s.heroProgress}>{toNextText}</Text>
        </Appear>
        <View style={s.heroStatsRow}>
          <Animated.View style={[s.divider, { width: divider.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
          <Appear delay={1300} reduceMotion={reduceMotion}>
            <RiseText style={s.heroStatNum} delay={0} pop popDelay={2400} reduceMotion={reduceMotion}>
              {streakShown ?? 0}
            </RiseText>
            <View style={s.statLblRow}>
              <Text style={s.heroStatLbl}>Day streak </Text>
              <Animated.Text
                style={[
                  s.heroStatLbl,
                  !reduceMotion && {
                    transform: [
                      { rotate: flame.interpolate({ inputRange: [-1, 1], outputRange: ['4deg', '-6deg'] }) },
                      { scale: flame.interpolate({ inputRange: [-1, 0, 1], outputRange: [0.95, 1, 1.2] }) },
                    ],
                  },
                ]}
              >
                🔥
              </Animated.Text>
            </View>
          </Appear>
          <Appear delay={1450} reduceMotion={reduceMotion}>
            <RiseText style={s.heroStatNum} delay={0} pop popDelay={2550} reduceMotion={reduceMotion}>
              {badgesShown ?? 0}
            </RiseText>
            <Text style={s.heroStatLbl}>Badges earned</Text>
          </Appear>
        </View>
      </View>
    </RiseIn>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    hero: { position: 'relative', borderRadius: 28, padding: 22, overflow: 'hidden' },
    heroFlower: { position: 'absolute', top: -30, right: -20, fontSize: 118, opacity: 0.14 },
    heroLabel: { fontSize: 10.5, fontWeight: '600', color: c.white },
    heroLevel: { fontFamily: FONT.serif, fontSize: 30, marginTop: 15, color: c.white },
    heroPoints: { fontSize: 11, opacity: 0.9, marginTop: 2, color: c.white },
    heroProgress: { fontSize: 9.5, opacity: 0.85, marginTop: 7, color: c.white },
    heroStatsRow: { flexDirection: 'row', gap: 20, marginTop: 16, paddingTop: 14 },
    divider: { position: 'absolute', top: 0, left: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.22)' },
    heroStatNum: { fontSize: 17, fontWeight: '700', color: c.white },
    heroStatLbl: { fontSize: 9, opacity: 0.85, color: c.white, marginTop: 2 },
    statLblRow: { flexDirection: 'row', alignItems: 'flex-end' },
  });
}
