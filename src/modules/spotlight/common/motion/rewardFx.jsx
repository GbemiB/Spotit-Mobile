import { Animated, Easing, View, Dimensions } from 'react-native';
import { useEffect } from 'react';
import Svg, { Path } from 'react-native-svg';
import { useAnimatedValue } from '../../../dashboard/HeroCardFx.jsx';
import { useEnter } from './effects.jsx';
import { STAR_PATH, HEART_PATH } from '../style/tokens.js';

function Piece({ left, w, h, round, color, delay, reduceMotion }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.timing(v, { toValue: 1, duration: 2800, delay, easing: Easing.bezier(0.3, 0.6, 0.4, 1), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [v, delay, reduceMotion]);
  if (reduceMotion) return null;
  const fall = Dimensions.get('window').height;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left,
        width: w,
        height: h,
        borderRadius: round ? w / 2 : 2,
        backgroundColor: color,
        opacity: v.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-30, fall] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '380deg'] }) },
        ],
      }}
    />
  );
}

export function Confetti({ colors, reduceMotion }) {
  const width = Dimensions.get('window').width;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20 }}>
      {Array.from({ length: 14 }, (_, i) => (
        <Piece
          key={i}
          left={((8 + i * 27) % 380) * (width / 390)}
          w={6 + (i % 3) * 2}
          h={10 + (i % 2) * 4}
          round={i % 3 === 0}
          color={colors[i % colors.length]}
          delay={i * 120}
          reduceMotion={reduceMotion}
        />
      ))}
    </View>
  );
}

export function LandingStar({ size, color, delay, reduceMotion }) {
  const v = useEnter(reduceMotion, delay);
  return (
    <Animated.View
      style={{
        opacity: v.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) },
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-60deg', '0deg'] }) },
        ],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={STAR_PATH} fill={color} />
      </Svg>
    </Animated.View>
  );
}

export function StarRow({ t, count, reduceMotion, big = 54, small = 44, baseDelay = 300 }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 6 }}>
      {[0, 1, 2].map(i => (
        <LandingStar key={i} size={i === 1 ? big : small} color={i < count ? t.gold : t.starOff} delay={baseDelay + i * 220} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
}

export function HeartIcon({ alive, lost, t, size = 20, reduceMotion }) {
  const v = useEnter(reduceMotion || !lost, 0, [lost]);
  const style = lost
    ? {
        transform: [
          { scale: v.interpolate({ inputRange: [0, 0.3, 0.6, 1], outputRange: [1, 1.5, 0.9, 1] }) },
          { rotate: v.interpolate({ inputRange: [0, 0.3, 0.6, 1], outputRange: ['0deg', '-12deg', '8deg', '0deg'] }) },
        ],
      }
    : null;
  return (
    <Animated.View style={style}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={HEART_PATH} fill={alive ? t.pink : t.starOff} />
      </Svg>
    </Animated.View>
  );
}

export function Shake({ trigger, reduceMotion, style, children }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (!trigger || reduceMotion) return undefined;
    v.setValue(0);
    const anim = Animated.timing(v, { toValue: 1, duration: 450, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [trigger, reduceMotion, v]);
  return (
    <Animated.View
      style={[
        style,
        { transform: [{ translateX: v.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -7, 7, -3, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}
