import { View, Animated, Easing, AppState, StyleSheet, useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';
import Svg, { Path, Circle, Ellipse, G, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../../shared/styles/index.js';
import { useReduceMotion, useAnimatedValue } from '../../modules/dashboard/HeroCardFx.jsx';
const PALETTE = {
  light: {
    glowA: '#F6C9D2',
    glowAOpacity: 0.6,
    glowB: '#FAD7B0',
    glowBOpacity: 0.55,
    flowerA: '#F2A0AE',
    flowerB: '#FBC9A4',
    centreA: '#F2C46B',
    centreB: '#F7E1A6',
    leaf: '#9CC5A8',
    flowerOpacityA: 0.6,
    flowerOpacityB: 0.55,
    petals: [
      ['#E2647C', 0.5],
      ['#F2A0AE', 0.6],
      ['#E89A6B', 0.5],
      ['#D6A24E', 0.55],
    ],
    leafOpacity: 0.7,
  },
  dark: {
    glowA: '#DC5A74',
    glowAOpacity: 0.26,
    glowB: '#D6A24E',
    glowBOpacity: 0.18,
    flowerA: '#E2647C',
    flowerB: '#F0A868',
    centreA: '#E0B564',
    centreB: '#E0B564',
    leaf: '#6BBF9B',
    flowerOpacityA: 0.35,
    flowerOpacityB: 0.3,
    petals: [
      ['#F2879B', 0.45],
      ['#F2A0AE', 0.4],
      ['#F0A868', 0.4],
      ['#E0B564', 0.45],
    ],
    leafOpacity: 0.5,
  },
};
const FALLING = [
  { x: 0.87, rx: 6, ry: 10, tone: 0, duration: 22000, start: 0 },
  { x: 0.15, rx: 5, ry: 8, tone: 1, duration: 26000, start: 0.3 },
  { x: 0.59, rx: 6, ry: 9, tone: 2, duration: 24000, start: 0.62 },
  { x: 0.38, rx: 4, ry: 7, tone: 3, duration: 28000, start: 0.14 },
  { x: 0.77, leaf: true, duration: 30000, start: 0.66 },
];
function useAppActive() {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => setActive(next === 'active'));
    return () => sub.remove();
  }, []);
  return active;
}
function useSway(duration, running) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (!running) return undefined;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [v, duration, running]);
  return v;
}
function Glow({ id, color, opacity, size, style, duration, running }) {
  const v = useSway(duration, running);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size },
        style,
        {
          transform: [
            { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) },
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }) },
          ],
        },
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx={size / 2} cy={size / 2} r={size / 2} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={color} stopOpacity={opacity} />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={size} height={size} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}
function Flower({ size, petal, centre, leaf, opacity, petalRx, petalRy, style, duration, running }) {
  const v = useSway(duration, running);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', width: size, height: size, opacity },
        style,
        {
          transform: [
            { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] }) },
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) },
          ],
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {leaf ? <Path d="M50 50 C 30 30, 8 40, 4 62 C 24 66, 40 62, 50 50 Z" fill={leaf} /> : null}
        <G fill={petal}>
          {[0, 72, 144, 216, 288].map(turn => (
            <Ellipse key={turn} cx={50} cy={50 - petalRy} rx={petalRx} ry={petalRy} transform={`rotate(${turn} 50 50)`} />
          ))}
        </G>
        <Circle cx={50} cy={50} r={9} fill={centre} />
      </Svg>
    </Animated.View>
  );
}
function FallingPetal({ item, palette, width, height, running }) {
  const v = useAnimatedValue(item.start);
  useEffect(() => {
    if (!running) return undefined;
    let loop = null;
    const first = Animated.timing(v, {
      toValue: 1,
      duration: (1 - item.start) * item.duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    first.start(({ finished }) => {
      if (!finished) return;
      v.setValue(0);
      loop = Animated.loop(Animated.timing(v, { toValue: 1, duration: item.duration, easing: Easing.linear, useNativeDriver: true }));
      loop.start();
    });
    return () => {
      first.stop();
      loop?.stop();
    };
  }, [v, item, running]);
  const [color, opacity] = item.leaf ? [palette.leaf, palette.leafOpacity] : palette.petals[item.tone];
  const w = item.leaf ? 20 : item.rx * 2;
  const h = item.leaf ? 14 : item.ry * 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: item.x * width,
        top: 0,
        opacity: v.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-40, height + 40] }) },
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, -60] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '320deg'] }) },
        ],
      }}
    >
      <Svg width={w} height={h} viewBox={item.leaf ? '0 0 22 16' : `0 0 ${w} ${h}`}>
        {item.leaf ? (
          <Path d="M1 14 q 8 -14 20 -10 q -6 12 -20 10 z" fill={color} opacity={opacity} />
        ) : (
          <Ellipse cx={item.rx} cy={item.ry} rx={item.rx} ry={item.ry} fill={color} opacity={opacity} />
        )}
      </Svg>
    </Animated.View>
  );
}
export default function LivingBackground() {
  const { isDark } = useTheme();
  const reduceMotion = useReduceMotion();
  const active = useAppActive();
  const { width, height } = useWindowDimensions();
  const palette = PALETTE[isDark ? 'dark' : 'light'];
  const running = active && !reduceMotion;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Glow
        id="livingGlowA"
        color={palette.glowA}
        opacity={palette.glowAOpacity}
        size={360}
        style={{ top: -120, right: -120 }}
        duration={26000}
        running={running}
      />
      <Glow
        id="livingGlowB"
        color={palette.glowB}
        opacity={palette.glowBOpacity}
        size={340}
        style={{ top: height * 0.45, left: -150 }}
        duration={30000}
        running={running}
      />
      <Flower
        size={150}
        petal={palette.flowerA}
        centre={palette.centreA}
        opacity={palette.flowerOpacityA}
        petalRx={14}
        petalRy={22}
        style={{ top: -40, right: -40 }}
        duration={9000}
        running={running}
      />
      <Flower
        size={120}
        petal={palette.flowerB}
        centre={palette.centreB}
        leaf={palette.leaf}
        opacity={palette.flowerOpacityB}
        petalRx={13}
        petalRy={20}
        style={{ bottom: 120, left: -36 }}
        duration={11000}
        running={running}
      />
      {FALLING.map((item, i) => (
        <FallingPetal key={i} item={item} palette={palette} width={width} height={height} running={running} />
      ))}
    </View>
  );
}
