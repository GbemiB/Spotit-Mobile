import { useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import { Rect, Circle, Ellipse, G } from 'react-native-svg';
export const AnimatedG = Animated.createAnimatedComponent(G);
export const AnimatedCircle = Animated.createAnimatedComponent(Circle);
export const AnimatedRect = Animated.createAnimatedComponent(Rect);
export function Flower({ x, y, rx, ry, color, center }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map(a => (
        <Ellipse key={a} cx={0} cy={-ry} rx={rx} ry={ry} fill={color} transform={`rotate(${a})`} />
      ))}
      <Circle r={rx * 0.6} fill={center} />
    </G>
  );
}

export function Card({ x, y, w, h, r }) {
  return (
    <>
      <Rect x={x} y={y + 8} width={w} height={h} rx={r} fill="rgba(192,78,104,0.08)" />
      <Rect x={x} y={y} width={w} height={h} rx={r} fill="#FFFFFF" stroke="#F2E6E1" strokeWidth={1.5} />
    </>
  );
}

export function useLoop(value, { duration, delay = 0, reduceMotion, bounce = true }) {
  useEffect(() => {
    if (reduceMotion) return undefined;
    const run = bounce
      ? Animated.sequence([
          Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          Animated.timing(value, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        ])
      : Animated.timing(value, { toValue: 1, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: false });
    const anim = Animated.sequence([Animated.delay(delay), Animated.loop(run)]);
    anim.start();
    return () => anim.stop();
  }, [value, duration, delay, reduceMotion, bounce]);
}
export function useCycle(value, { duration, reduceMotion }) {
  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.loop(Animated.timing(value, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: false }));
    anim.start();
    return () => anim.stop();
  }, [value, duration, reduceMotion]);
}
