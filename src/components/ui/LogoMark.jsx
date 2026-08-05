import { View, Image, Animated, StyleSheet } from 'react-native';
import { useRef, useEffect, useMemo } from 'react';
import { useTheme } from '../../shared/styles/index.js';

export default function LogoMark({ size = 76 }) {
  const { isDark } = useTheme();
  const s = useMemo(() => createStyles(size), [size]);
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = val =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: 1, duration: 1700, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 1700, useNativeDriver: true }),
        ]),
      );
    const a1 = loop(ring1);
    const a2 = loop(ring2);
    const a3 = loop(float);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  const ring2Scale = ring2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] });
  const ring2Opacity = ring2.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });
  const ring1Scale = ring1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] });
  const ring1Opacity = ring1.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.9] });
  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });

  return (
    <View style={s.wrap}>
      <Animated.View
        style={[
          s.ring2,
          {
            borderColor: isDark ? 'rgba(242,160,174,0.3)' : 'rgba(220,90,116,0.3)',
            opacity: ring2Opacity,
            transform: [{ scale: ring2Scale }],
          },
        ]}
      />
      <Animated.View style={[s.ringGlow, { opacity: ring1Opacity, transform: [{ scale: ring1Scale }] }]}>
        <View style={[s.ringGlowFill, { backgroundColor: isDark ? 'rgba(242,160,174,0.35)' : 'rgba(242,160,174,0.4)' }]} />
      </Animated.View>
      <Animated.View style={[s.inner, isDark ? s.innerDark : s.innerLight, { transform: [{ translateY: floatY }] }]}>
        <Image source={require('../../../assets/splash.png')} style={s.drop} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

function createStyles(size) {
  const ringSize = size;
  const glowSize = size * 0.833;
  const innerSize = size * 0.77;
  const dropSize = innerSize * 0.66;
  return StyleSheet.create({
    wrap: { width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' },
    ring2: { position: 'absolute', width: ringSize, height: ringSize, borderRadius: ringSize / 2, borderWidth: 1.5 },
    ringGlow: {
      position: 'absolute',
      width: glowSize,
      height: glowSize,
      borderRadius: glowSize / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringGlowFill: { width: glowSize, height: glowSize, borderRadius: glowSize / 2 },
    inner: {
      width: innerSize,
      height: innerSize,
      borderRadius: innerSize / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    innerLight: {
      backgroundColor: '#fff',
      shadowColor: '#C8466A',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.22,
      shadowRadius: 24,
      elevation: 6,
    },
    innerDark: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
    drop: { width: dropSize, height: dropSize },
  });
}
