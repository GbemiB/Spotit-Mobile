import { Animated, Easing, Pressable, View } from 'react-native';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useAnimatedValue } from '../dashboard/HeroCardFx.jsx';

export const SPARKLE = 'M12 2c.6 5 2.6 7.4 8 8.2-5.4.8-7.4 3.2-8 8.2-.6-5-2.6-7.4-8-8.2 5.4-.8 7.4-3.2 8-8.2z';
export const HEART = 'M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z';
export const STAR = 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z';
export const FLAME = 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5.3 1.6 1.2 2.5 2 2.5 0-3-.5-5.5 1-8z';

export function useLoopValue(duration, reduceMotion, { delay = 0, linear = false } = {}) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(0);
      return undefined;
    }
    const ease = Easing.inOut(Easing.sin);
    const steps = linear
      ? [
          Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]
      : [
          Animated.timing(v, { toValue: 1, duration: duration / 2, easing: ease, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: duration / 2, easing: ease, useNativeDriver: true }),
        ];
    const anim = Animated.loop(Animated.sequence(delay ? [Animated.delay(delay), ...steps] : steps));
    anim.start();
    return () => anim.stop();
  }, [v, duration, reduceMotion, delay, linear]);
  return v;
}

export function useEnter(reduceMotion, delay = 0, deps = []) {
  const v = useAnimatedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(1);
      return undefined;
    }
    v.setValue(0);
    const anim = Animated.timing(v, { toValue: 1, duration: 650, delay, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, delay, v, ...deps]);
  return v;
}

export function Rise({ index = 0, reduceMotion, style, children }) {
  const v = useEnter(reduceMotion, 60 + index * 90);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1] }),
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function Pop({ delay = 0, reduceMotion, style, children, trigger }) {
  const v = useEnter(reduceMotion, delay, [trigger]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function Bob({ distance = 4, duration = 3400, delay = 0, rotate = 0, reduceMotion, style, children }) {
  const v = useLoopValue(duration, reduceMotion, { delay });
  const transform = [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] }) }];
  if (rotate) transform.push({ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${rotate}deg`] }) });
  return <Animated.View style={[style, { transform }]}>{children}</Animated.View>;
}

export function Twinkle({ size, color, delay = 0, reduceMotion, style }) {
  const v = useLoopValue(2400, reduceMotion, { delay });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size },
        style,
        {
          opacity: reduceMotion ? 0.9 : v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.1] }) }],
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={SPARKLE} fill={color} />
      </Svg>
    </Animated.View>
  );
}

export function Beat({ reduceMotion, children, style }) {
  const v = useLoopValue(1400, reduceMotion);
  return (
    <Animated.View style={[style, { transform: [{ scale: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.18, 1] }) }] }]}>
      {children}
    </Animated.View>
  );
}

export function Flicker({ reduceMotion, children }) {
  const v = useLoopValue(1800, reduceMotion);
  return (
    <Animated.View
      style={{
        transform: [
          { scaleY: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.08, 0.96] }) },
          { rotate: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-3deg', '3deg', '-3deg'] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

export function Blob({ size, color, duration = 3500, delay = 0, reduceMotion, style }) {
  const v = useLoopValue(duration * 2, reduceMotion, { delay });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }],
        },
      ]}
    />
  );
}

export function Wave({ width, height, color, duration, reverse, bottom, d, reduceMotion }) {
  const v = useLoopValue(duration, reduceMotion, { linear: true });
  if (!width) return null;
  const translateX = v.interpolate({ inputRange: [0, 1], outputRange: reverse ? [-width, 0] : [0, -width] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, bottom, width: width * 2, height, transform: [{ translateX }] }}
    >
      <Svg width={width * 2} height={height} viewBox={`0 0 800 ${height}`} preserveAspectRatio="none">
        <Path d={d} fill={color} />
      </Svg>
    </Animated.View>
  );
}

export function Waves({ isDark, reduceMotion }) {
  const [w, setW] = useState(0);
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 64 }}
      onLayout={e => setW(e.nativeEvent.layout.width)}
    >
      <Wave
        width={w}
        height={60}
        bottom={-6}
        color={isDark ? 'rgba(220,90,116,0.10)' : 'rgba(242,160,174,0.16)'}
        duration={9000}
        reduceMotion={reduceMotion}
        d="M0 30 C 100 5, 100 55, 200 30 S 300 5, 400 30 S 500 55, 600 30 S 700 5, 800 30 V 60 H 0 Z"
      />
      <Wave
        width={w}
        height={48}
        bottom={-8}
        color={isDark ? 'rgba(214,162,78,0.08)' : 'rgba(246,217,190,0.30)'}
        duration={6000}
        reverse
        reduceMotion={reduceMotion}
        d="M0 24 C 100 44, 100 4, 200 24 S 300 44, 400 24 S 500 4, 600 24 S 700 44, 800 24 V 48 H 0 Z"
      />
    </View>
  );
}

export function PressScale({ onPress, disabled, style, children, accessibilityLabel, accessibilityRole = 'button' }) {
  const v = useAnimatedValue(1);
  const to = toValue => Animated.spring(v, { toValue, speed: 40, bounciness: 8, useNativeDriver: true }).start();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => to(0.96)}
      onPressOut={() => to(1)}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[style, { transform: [{ scale: v }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Shine({ width, reduceMotion }) {
  const v = useLoopValue(3600, reduceMotion, { delay: 1200, linear: true });
  if (reduceMotion || !width) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: -10,
        bottom: -10,
        width: 46,
        transform: [
          { translateX: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-80, width + 30, width + 30] }) },
          { skewX: '-18deg' },
        ],
      }}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}

export function GradientButton({ label, onPress, colors, reduceMotion, icon, style, disabled, small }) {
  const [w, setW] = useState(0);
  return (
    <PressScale onPress={onPress} disabled={disabled} style={style} accessibilityLabel={typeof label === 'string' ? label : undefined}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        onLayout={e => setW(e.nativeEvent.layout.width)}
        style={{
          height: small ? 44 : 50,
          borderRadius: 14,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          overflow: 'hidden',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {!disabled && <Shine width={w} reduceMotion={reduceMotion} />}
        {label}
        {icon}
      </LinearGradient>
    </PressScale>
  );
}

export function Icon({ d, size = 20, color, fill, width = 1.9 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={d}
        stroke={fill ? undefined : color}
        fill={fill ? color : 'none'}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
