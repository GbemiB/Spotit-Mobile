import { Animated, Easing } from 'react-native';
import { useEffect, useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { useAnimatedValue } from '../../../dashboard/HeroCardFx.jsx';
import { useLoopValue, useEnter } from './effects.jsx';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function ds(n) {
  return n <= 15.5 ? n - 1.5 : n;
}

export function useCountUp(target, reduceMotion, duration = 1000, restart = 0) {
  const v = useAnimatedValue(0);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    v.setValue(0);
    const id = v.addListener(({ value }) => setShown(Math.round(target * value)));
    const anim = Animated.timing(v, { toValue: 1, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    anim.start();
    return () => {
      anim.stop();
      v.removeListener(id);
    };
  }, [target, reduceMotion, duration, restart, v]);
  return reduceMotion ? target : shown;
}

export function Breathe({ reduceMotion, style, children, duration = 4200 }) {
  const v = useLoopValue(duration, reduceMotion);
  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) },
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.012] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function Sway({ reduceMotion, style, children, deg = 2.5, duration = 4000, delay = 0 }) {
  const v = useLoopValue(duration, reduceMotion, { delay });
  return (
    <Animated.View
      style={[style, { transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: [`-${deg}deg`, `${deg}deg`] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}

export function Drift({ reduceMotion, style, children, distance = 14, duration = 9000 }) {
  const v = useLoopValue(duration, reduceMotion);
  return (
    <Animated.View style={[style, { transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, distance] }) }] }]}>
      {children}
    </Animated.View>
  );
}

export function Travel({ reduceMotion, style, children, from, to, duration, delay = 0, axis = 'x' }) {
  const v = useLoopValue(duration, reduceMotion, { delay, linear: true });
  const move = v.interpolate({ inputRange: [0, 1], outputRange: [from, to] });
  return (
    <Animated.View style={[style, { transform: [axis === 'x' ? { translateX: move } : { translateY: move }] }]}>{children}</Animated.View>
  );
}

export function WaveOnce({ reduceMotion, style, children, delay = 600 }) {
  const v = useEnter(reduceMotion, delay);
  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            {
              rotate: v.interpolate({
                inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                outputRange: ['0deg', '-8deg', '7deg', '-5deg', '3deg', '0deg'],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function FloatUp({ reduceMotion, style, children, delay = 0, duration = 4600 }) {
  const v = useLoopValue(duration, reduceMotion, { delay, linear: true });
  if (reduceMotion) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute' },
        style,
        {
          opacity: v.interpolate({ inputRange: [0, 0.15, 0.7, 1], outputRange: [0, 1, 0.8, 0] }),
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) },
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function SlideIn({ reduceMotion, delay = 0, distance = 10, style, children, trigger, axis = 'y' }) {
  const v = useEnter(reduceMotion, delay, [trigger]);
  const shift = v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });
  return (
    <Animated.View
      style={[
        style,
        { opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 1] }), transform: [axis === 'y' ? { translateY: shift } : { translateX: shift }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function GrowWidth({ reduceMotion, pct, delay = 450, style, children }) {
  const v = useAnimatedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(1);
      return undefined;
    }
    v.setValue(0);
    const anim = Animated.timing(v, { toValue: 1, duration: 1200, delay, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [pct, reduceMotion, delay, v]);
  const width = v.interpolate({ inputRange: [0, 1], outputRange: ['0%', `${Math.max(0, Math.min(100, pct))}%`] });
  return <Animated.View style={[style, { width }]}>{children}</Animated.View>;
}

export function Squiggle({ color, reduceMotion, width, delay = 750 }) {
  const v = useAnimatedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(1);
      return undefined;
    }
    v.setValue(0);
    const anim = Animated.timing(v, { toValue: 1, duration: 900, delay, easing: Easing.out(Easing.quad), useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, delay, v]);
  return (
    <Svg width={width} height={8} viewBox="0 0 100 8" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: -6 }}>
      <AnimatedPath
        d="M2 5 Q 14 1 26 5 T 50 5 T 74 5 T 98 5"
        stroke={color}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        strokeDasharray="110"
        strokeDashoffset={v.interpolate({ inputRange: [0, 1], outputRange: [110, 0] })}
      />
    </Svg>
  );
}

export function Pulse({ reduceMotion, style, children, scale = 1.06, duration = 2400 }) {
  const v = useLoopValue(duration, reduceMotion);
  return (
    <Animated.View style={[style, { transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, scale] }) }] }]}>
      {children}
    </Animated.View>
  );
}

export function Blink({ reduceMotion, style, children, duration = 3400, delay = 0 }) {
  const v = useLoopValue(duration, reduceMotion, { delay });
  return (
    <Animated.View style={[style, { opacity: reduceMotion ? 1 : v.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }) }]}>
      {children}
    </Animated.View>
  );
}

export function FlipCard({ reduceMotion, front, back, style }) {
  const v = useLoopValue(6000, reduceMotion, { linear: true });
  const rot = v.interpolate({ inputRange: [0, 0.38, 0.5, 0.88, 1], outputRange: ['0deg', '0deg', '180deg', '180deg', '360deg'] });
  const frontOpacity = v.interpolate({ inputRange: [0, 0.43, 0.44, 0.93, 0.94, 1], outputRange: [1, 1, 0, 0, 1, 1] });
  const backOpacity = v.interpolate({ inputRange: [0, 0.43, 0.44, 0.93, 0.94, 1], outputRange: [0, 0, 1, 1, 0, 0] });
  const fill = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };
  return (
    <Animated.View style={[style, { transform: [{ perspective: 200 }, { rotateY: rot }] }]}>
      <Animated.View style={[fill, { opacity: frontOpacity }]}>{front}</Animated.View>
      <Animated.View style={[fill, { opacity: backOpacity, transform: [{ rotateY: '180deg' }] }]}>{back}</Animated.View>
    </Animated.View>
  );
}

export function Twinkle2({ reduceMotion, style, children, delay = 1600, duration = 2400 }) {
  const v = useLoopValue(duration, reduceMotion, { delay });
  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) },
            { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '18deg'] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
