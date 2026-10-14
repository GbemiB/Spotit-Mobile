import { View, Animated, Easing, StyleSheet } from 'react-native';
import { useMemo, useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Text } from '../../shared/styles/index.js';
import OvulationStrip from '../../components/cycle/OvulationStrip.jsx';
import { useAnimatedValue, useReduceMotion, HeroFrame, FadeIn, Orb, Star } from './HeroCardFx.jsx';

const RING = ['#F2A0AE', '#E2B86A', '#A8D3C1', '#F2A0AE'];
const STARS = [
  { x: 0.78, y: 0.12, size: 8, color: '#E2B86A', delay: 0, duration: 3000 },
  { x: 0.92, y: 0.45, size: 6, color: '#F2A0AE', delay: 1200, duration: 2600 },
  { x: 0.55, y: 0.2, size: 5, color: '#5FA98C', delay: 2000, duration: 3200 },
];

export default function OvulationCard({ title, body, lastPeriodDate, cycleLength, periodLength }) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const reduceMotion = useReduceMotion();
  const [size, setSize] = useState(null);
  const float = useAnimatedValue(0);
  const halo = useAnimatedValue(0);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(float, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(halo, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(halo, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, float, halo]);

  const w = size?.width ?? 0;
  return (
    <HeroFrame borderColor={colors.border} radius={22} width={2} gradient={RING} duration={5000} reduceMotion={reduceMotion}>
      <LinearGradient
        colors={isDark ? ['#2A1810', '#301B0F'] : ['#FBF2EC', '#FCEAE0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={s.card}
        onLayout={e => setSize(e.nativeEvent.layout)}
      >
        {!reduceMotion && w > 0 && (
          <>
            <Orb
              size={120}
              color="rgba(214,162,78,0.35)"
              top={-40}
              left={w - 90}
              duration={9000}
              path={[
                [0, 0],
                [-40, 20],
                [0, 0],
              ]}
            />
            <Orb
              size={110}
              color={isDark ? 'rgba(95,169,140,0.25)' : 'rgba(168,211,193,0.45)'}
              top={40}
              left={-40}
              duration={12000}
              path={[
                [0, 0],
                [50, -10],
                [0, 0],
              ]}
            />
            {STARS.map((st, i) => (
              <Star key={i} {...st} width={w} height={size.height} />
            ))}
          </>
        )}
        <View style={s.row}>
          <View style={s.iconWrap}>
            {!reduceMotion && (
              <Animated.View
                pointerEvents="none"
                style={[
                  s.halo,
                  {
                    opacity: halo.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] }),
                    transform: [{ scale: halo.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.15] }) }],
                  },
                ]}
              />
            )}
            <Animated.Text
              style={[
                s.icon,
                !reduceMotion && {
                  transform: [
                    { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) },
                    { rotate: float.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] }) },
                  ],
                },
              ]}
            >
              🌼
            </Animated.Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <FadeIn delay={300} from="left" reduceMotion={reduceMotion}>
              <Text style={s.title}>{title}</Text>
            </FadeIn>
            <FadeIn delay={450} reduceMotion={reduceMotion}>
              <Text style={s.body}>{body}</Text>
            </FadeIn>
          </View>
        </View>
        <View style={{ marginTop: 14 }}>
          <OvulationStrip lastPeriodDate={lastPeriodDate} cycleLength={cycleLength} periodLength={periodLength} animate={!reduceMotion} />
        </View>
      </LinearGradient>
    </HeroFrame>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    card: { borderRadius: 20, padding: 17, overflow: 'hidden' },
    row: { flexDirection: 'row', gap: 12 },
    iconWrap: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
    halo: { position: 'absolute', width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(226,184,106,0.45)' },
    icon: { fontSize: 17 },
    title: { fontSize: 12, fontWeight: '700', color: c.tertiaryDeep },
    body: { fontSize: 11, color: c.textSecondary, lineHeight: 19, marginTop: 3 },
  });
}
