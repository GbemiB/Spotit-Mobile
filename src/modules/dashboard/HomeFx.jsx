import { View, Animated, Easing, StyleSheet } from 'react-native';
import { useEffect } from 'react';
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

export function AvatarRing({ size, ring = 2, gap = 1.5, color = '#F2A0AE', reduceMotion, children }) {
  const glow = useAnimatedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.timing(glow, { toValue: 1, duration: 1400, delay: 600, easing: Easing.out(Easing.quad), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, glow]);
  const outer = size + (ring + gap) * 2;
  return (
    <View style={{ width: outer, height: outer, alignItems: 'center', justifyContent: 'center' }}>
      {!reduceMotion && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            width: outer,
            height: outer,
            borderRadius: outer / 2,
            backgroundColor: color,
            opacity: glow.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.45, 0] }),
            transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }],
          }}
        />
      )}
      <View
        style={{
          width: outer,
          height: outer,
          borderRadius: outer / 2,
          borderWidth: ring,
          borderColor: color,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
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

const styles = StyleSheet.create({
  greetingRow: { flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap' },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 32, paddingHorizontal: 11, borderRadius: 16 },
  streakText: { fontSize: 10, fontWeight: '500' },
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
  streakTextCompact: { fontSize: 8.5, fontWeight: '700' },
});
