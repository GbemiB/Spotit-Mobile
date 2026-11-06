import { Animated, Easing, Pressable, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useAnimatedValue } from '../../dashboard/HeroCardFx.jsx';

export const SPARKLE = 'M12 2c.6 5 2.6 7.4 8 8.2-5.4.8-7.4 3.2-8 8.2-.6-5-2.6-7.4-8-8.2 5.4-.8 7.4-3.2 8-8.2z';
export const HEART = 'M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z';

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

const OUTER_KEYS =
  /^(flex|flexGrow|flexShrink|flexBasis|alignSelf|width|minWidth|maxWidth|margin.*|position|top|bottom|left|right|zIndex)$/;

export function splitPressStyle(style) {
  const flat = StyleSheet.flatten(style) || {};
  const outer = {};
  const inner = {};
  Object.keys(flat).forEach(k => {
    if (OUTER_KEYS.test(k)) outer[k] = flat[k];
    else inner[k] = flat[k];
  });
  if (outer.flex != null || outer.flexGrow != null) inner.flexGrow = 1;
  return { outer, inner };
}

export function PressScale({ onPress, disabled, style, children, accessibilityLabel, accessibilityRole = 'button' }) {
  const v = useAnimatedValue(1);
  const to = toValue => Animated.spring(v, { toValue, speed: 40, bounciness: 8, useNativeDriver: true }).start();
  const { outer, inner } = splitPressStyle(style);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => to(0.96)}
      onPressOut={() => to(1)}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={outer}
    >
      <Animated.View style={[inner, { transform: [{ scale: v }] }]}>{children}</Animated.View>
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
