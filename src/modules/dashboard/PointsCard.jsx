import { View, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { useMemo, useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme, Text } from '../../shared/styles/index.js';
import { useAnimatedValue, useReduceMotion } from './HeroCardFx.jsx';

const GOLD = ['#E2B86A', '#D6A24E'];
const FLOWER =
  'M12 9c0-3 1.5-5 0-6-1.5 1 0 3 0 6M15 12c3 0 5 1.5 6 0-1-1.5-3 0-6 0M12 15c0 3-1.5 5 0 6 1.5-1 0-3 0-6M9 12c-3 0-5-1.5-6 0 1 1.5 3 0 6 0';

export default function PointsCard({ levelName, points, pct, toNextText, onPress }) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const reduceMotion = useReduceMotion();
  const [barWidth, setBarWidth] = useState(0);
  const value = Math.min(1, Math.max(0, pct || 0));

  const spin = useAnimatedValue(0);
  const wiggle = useAnimatedValue(0);
  const fill = useAnimatedValue(reduceMotion ? value : 0);
  const shine = useAnimatedValue(0);
  const bump = useAnimatedValue(0);
  const press = useAnimatedValue(1);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const loops = Animated.parallel([
      Animated.loop(Animated.timing(spin, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })),
      Animated.loop(
        Animated.sequence([
          Animated.delay(2600),
          Animated.timing(wiggle, { toValue: 1, duration: 120, useNativeDriver: true }),
          Animated.timing(wiggle, { toValue: -1, duration: 140, useNativeDriver: true }),
          Animated.timing(wiggle, { toValue: 0.5, duration: 120, useNativeDriver: true }),
          Animated.timing(wiggle, { toValue: 0, duration: 120, useNativeDriver: true }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(shine, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(shine, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ),
    ]);
    loops.start();
    return () => loops.stop();
  }, [reduceMotion, spin, wiggle, shine]);

  useEffect(() => {
    if (reduceMotion) {
      fill.setValue(value);
      return undefined;
    }
    const anim = Animated.timing(fill, {
      toValue: value,
      duration: 1400,
      delay: 600,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [value, reduceMotion, fill]);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.sequence([
      Animated.timing(bump, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(bump, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [points, reduceMotion, bump]);

  const pressTo = toValue => Animated.spring(press, { toValue, speed: 40, bounciness: 8, useNativeDriver: true }).start();
  const fillWidth = fill.interpolate({ inputRange: [0, 1], outputRange: [0, barWidth] });
  const filledPx = barWidth * value;

  return (
    <Pressable onPress={onPress} onPressIn={() => pressTo(0.97)} onPressOut={() => pressTo(1)} accessibilityRole="button">
      <Animated.View style={[s.card, { transform: [{ scale: press }] }]}>
        <View style={s.tile}>
          <Animated.View
            style={[s.tileSpin, { transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}
          >
            <LinearGradient
              colors={['#F6D9BE', '#F0C088', '#E2B86A', '#F6D9BE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          <Animated.View
            style={{
              transform: [
                { rotate: wiggle.interpolate({ inputRange: [-1, 1], outputRange: ['-14deg', '14deg'] }) },
                { scale: wiggle.interpolate({ inputRange: [-1, 0, 1], outputRange: [1.1, 1, 1.1] }) },
              ],
            }}
          >
            <Svg
              width={22}
              height={22}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#A9663D"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Circle cx={12} cy={12} r={3} />
              <Path d={FLOWER} />
            </Svg>
          </Animated.View>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={s.titleRow}>
            <Text style={s.name}>{levelName}</Text>
            <Animated.Text style={[s.points, { transform: [{ scale: bump.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }] }]}>
              {points} SP
            </Animated.Text>
          </View>
          <View style={s.track} onLayout={e => setBarWidth(e.nativeEvent.layout.width)}>
            <Animated.View style={[s.fill, { width: fillWidth }]}>
              <LinearGradient colors={GOLD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
              {!reduceMotion && filledPx > 0 && (
                <Animated.View
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: Math.max(20, filledPx * 0.3),
                    transform: [{ translateX: shine.interpolate({ inputRange: [0, 1], outputRange: [-filledPx * 0.3, filledPx * 1.3] }) }],
                  }}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              )}
            </Animated.View>
          </View>
          <Text style={s.toNext}>{toNextText}</Text>
        </View>
        <Svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDark ? colors.primaryLight : colors.primaryDark}
          strokeWidth={2.4}
          strokeLinecap="round"
        >
          <Path d="M9 6l6 6-6 6" />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      borderRadius: 22,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    tile: { width: 46, height: 46, borderRadius: 15, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    tileSpin: { position: 'absolute', width: 66, height: 66, left: -10, top: -10 },
    titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    name: { fontSize: 14, fontWeight: '700', color: c.textPrimary },
    points: { fontSize: 13, fontWeight: '800', color: c.tertiaryDeep },
    track: { height: 8, borderRadius: 4, backgroundColor: c.border, marginTop: 8, overflow: 'hidden' },
    fill: { height: 8, borderRadius: 4, overflow: 'hidden' },
    toNext: { fontSize: 12, color: c.textSecondary, marginTop: 6 },
  });
}
