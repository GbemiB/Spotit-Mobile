import { View, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { useMemo, useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Text } from '../../shared/styles/index.js';
import { useAnimatedValue, useReduceMotion } from './HeroCardFx.jsx';

const SHIFTING = ['#E2647C', '#C04E68', '#A9426A', '#E2647C', '#C04E68'];

export default function LogPeriodCta({ title, subtitle, onPress }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const reduceMotion = useReduceMotion();
  const [width, setWidth] = useState(0);
  const shift = useAnimatedValue(0);
  const breathe = useAnimatedValue(0);
  const shine = useAnimatedValue(0);
  const spin = useAnimatedValue(0);
  const press = useAnimatedValue(1);

  useEffect(() => {
    if (reduceMotion) return undefined;
    const loops = Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(shift, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(shift, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ),
      Animated.sequence([
        Animated.delay(1500),
        Animated.loop(
          Animated.sequence([
            Animated.timing(shine, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(shine, { toValue: 0, duration: 0, useNativeDriver: true }),
            Animated.delay(1200),
          ]),
        ),
      ]),
      Animated.sequence([
        Animated.delay(2000),
        Animated.loop(
          Animated.sequence([
            Animated.delay(2700),
            Animated.timing(spin, { toValue: 1, duration: 350, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
            Animated.timing(spin, { toValue: 0, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          ]),
        ),
      ]),
    ]);
    loops.start();
    return () => loops.stop();
  }, [reduceMotion, shift, breathe, shine, spin]);

  const pressTo = toValue => Animated.spring(press, { toValue, speed: 40, bounciness: 10, useNativeDriver: true }).start();

  return (
    <Pressable onPress={onPress} onPressIn={() => pressTo(0.94)} onPressOut={() => pressTo(1)} accessibilityRole="button">
      <Animated.View style={{ transform: [{ scale: press }] }}>
        <Animated.View
          pointerEvents="none"
          style={[
            s.glow,
            {
              opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] }),
              transform: [{ scaleX: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.02] }) }],
            },
          ]}
        />
        <View style={s.card} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
          {reduceMotion || width === 0 ? (
            <LinearGradient
              colors={colors.gradient.primaryAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: width * 3,
                transform: [{ translateX: shift.interpolate({ inputRange: [0, 1], outputRange: [0, -width * 2] }) }],
              }}
            >
              <LinearGradient colors={SHIFTING} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            </Animated.View>
          )}
          {!reduceMotion && width > 0 && (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: 80,
                transform: [
                  { translateX: shine.interpolate({ inputRange: [0, 1], outputRange: [-100, width + 20] }) },
                  { skewX: '-20deg' },
                ],
              }}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.title}>{title}</Text>
            <Text style={s.sub}>{subtitle}</Text>
          </View>
          <Animated.View
            style={[
              s.plusWrap,
              {
                transform: [
                  { rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
                  { scale: spin.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) },
                ],
              },
            ]}
          >
            <Text style={s.plus}>+</Text>
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    glow: {
      position: 'absolute',
      left: 10,
      right: 10,
      top: 10,
      bottom: -6,
      borderRadius: 22,
      backgroundColor: c.primary,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.6,
      shadowRadius: 18,
    },
    card: {
      borderRadius: 22,
      overflow: 'hidden',
      paddingVertical: 15,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: { color: c.white, fontWeight: '700', fontSize: 14 },
    sub: { color: 'rgba(255,255,255,0.82)', fontSize: 10.5, marginTop: 5 },
    plusWrap: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(255,255,255,0.22)',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
    plus: { color: c.white, fontSize: 20, fontWeight: '300' },
  });
}
