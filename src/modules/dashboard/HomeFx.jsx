import { View, Animated, Easing, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Text } from '../../shared/styles/index.js';
import { useAnimatedValue } from './HeroCardFx.jsx';

const FLAME = 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.6 1.2 2.5 2 2.5 0-3-.5-5.5 1-8z';

export function RiseIn({ index = 0, style, reduceMotion, children }) {
  const v = useAnimatedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(1);
      return undefined;
    }
    const anim = Animated.timing(v, {
      toValue: 1,
      duration: 800,
      delay: 50 + index * 100,
      easing: Easing.out(Easing.back(1.3)),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, index, v]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] }),
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function Letter({ ch, delay, style, reduceMotion }) {
  const v = useAnimatedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(1);
      return undefined;
    }
    const anim = Animated.timing(v, { toValue: 1, duration: 600, delay, easing: Easing.out(Easing.back(2.2)), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, delay, v]);
  return (
    <Animated.Text
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 1] }),
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) },
            { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-25deg', '0deg'] }) },
          ],
        },
      ]}
    >
      {ch}
    </Animated.Text>
  );
}

export function GreetingLine({ greeting, name, greetingStyle, nameStyle, reduceMotion }) {
  const letters = Array.from(name || '');
  if (reduceMotion || letters.length === 0 || letters.length > 14) {
    return (
      <Text style={greetingStyle} numberOfLines={1}>
        {greeting} <Text style={nameStyle}>{name}</Text>
      </Text>
    );
  }
  return (
    <View style={styles.greetingRow} accessible accessibilityLabel={`${greeting} ${name}`}>
      <Text style={greetingStyle}>{greeting} </Text>
      {letters.map((ch, i) => (
        <Letter key={i} ch={ch} delay={500 + i * 70} style={nameStyle} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
}

export function AvatarRing({ size, ring = 3, reduceMotion, children }) {
  const spin = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true }));
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, spin]);
  const outer = size + ring * 2;
  return (
    <View
      style={{ width: outer, height: outer, borderRadius: outer / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          width: outer,
          height: outer,
          transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
        }}
      >
        <LinearGradient
          colors={['#E5383B', '#D6A24E', '#5FA98C', '#DC5A74']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {children}
    </View>
  );
}

export function ShakeEvery({ every = 3000, reduceMotion, children }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(every),
        Animated.timing(v, { toValue: 1, duration: 110, useNativeDriver: true }),
        Animated.timing(v, { toValue: -1, duration: 130, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0.5, duration: 110, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 110, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, every, v]);
  return (
    <Animated.View
      style={{
        transform: [
          { rotate: v.interpolate({ inputRange: [-1, 1], outputRange: ['-16deg', '16deg'] }) },
          { scale: v.interpolate({ inputRange: [-1, 0, 1], outputRange: [1.12, 1, 1.12] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

export function StreakBadge({ streak, colors, compact = false, reduceMotion }) {
  const label = streak > 0 ? `${streak}-day streak` : 'Start a streak';
  const flicker = useAnimatedValue(0);
  const bump = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(flicker, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: -1, duration: 220, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0.6, duration: 200, useNativeDriver: true }),
        Animated.timing(flicker, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, flicker]);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.sequence([
      Animated.timing(bump, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(bump, { toValue: 0, speed: 20, bounciness: 14, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [streak, reduceMotion, bump]);
  return (
    <Animated.View
      style={[
        compact ? styles.streakCompact : styles.streak,
        { backgroundColor: colors.tertiarySoft, transform: [{ scale: bump.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }] },
      ]}
      accessible
      accessibilityLabel={label}
    >
      <Animated.View
        style={{
          transform: [
            { rotate: flicker.interpolate({ inputRange: [-1, 1], outputRange: ['5deg', '-8deg'] }) },
            { scaleY: flicker.interpolate({ inputRange: [-1, 0, 1], outputRange: [1.05, 1, 1.3] }) },
          ],
        }}
      >
        <Svg
          width={compact ? 12 : 15}
          height={compact ? 12 : 15}
          viewBox="0 0 24 24"
          fill="#F0A14A"
          stroke="#C9782F"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d={FLAME} />
        </Svg>
      </Animated.View>
      <Text style={[compact ? styles.streakTextCompact : styles.streakText, { color: colors.tertiaryDeep }]}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  greetingRow: { flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap' },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 32, paddingHorizontal: 11, borderRadius: 16 },
  streakText: { fontSize: 12, fontWeight: '700' },
  streakCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 11,
    marginTop: 5,
  },
  streakTextCompact: { fontSize: 10.5, fontWeight: '700' },
});
