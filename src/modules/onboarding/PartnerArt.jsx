import { useEffect } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Circle, Ellipse, Path, G, Text as SvgText } from 'react-native-svg';
import { FONT } from '../../shared/styles/typography.js';
import { useAnimatedValue } from '../dashboard/HeroCardFx.jsx';
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const HEART = 'M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z';
const TRAIL = 'M500 250 C 470 120, 330 110, 300 230';
const P = [
  [500, 250],
  [470, 120],
  [330, 110],
  [300, 230],
];
const STEPS = Array.from({ length: 13 }, (_, i) => i / 12);
function onTrail(t) {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]];
}
const TRAIL_X = STEPS.map(t => onTrail(t)[0]);
const TRAIL_Y = STEPS.map(t => onTrail(t)[1]);
const TRAVELLERS = [
  { color: '#DC5A74', scale: 1.1, delay: 0 },
  { color: '#F2A0AE', scale: 0.9, delay: 800 },
  { color: '#D6A24E', scale: 0.8, delay: 1600 },
];
const BOLD = FONT.extraBold;
const MEDIUM = FONT.medium;
function Heart({ x, y, scale = 1, fill }) {
  return <Path d={HEART} fill={fill} transform={`translate(${x} ${y}) scale(${scale})`} />;
}
function Flower({ x, y, rx, ry, color, center }) {
  return (
    <G transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map(a => (
        <Ellipse key={a} cx={0} cy={-ry} rx={rx} ry={ry} fill={color} transform={`rotate(${a})`} />
      ))}
      <Circle r={rx * 0.6} fill={center} />
    </G>
  );
}
function Card({ x, y, w, h, r }) {
  return (
    <>
      <Rect x={x} y={y + 8} width={w} height={h} rx={r} fill="rgba(192,78,104,0.08)" />
      <Rect x={x} y={y} width={w} height={h} rx={r} fill="#FFFFFF" stroke="#F2E6E1" strokeWidth={1.5} />
    </>
  );
}
function useLoop(value, { duration, delay = 0, reduceMotion, bounce = true }) {
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
function Traveller({ color, scale, delay, reduceMotion }) {
  const t = useAnimatedValue(reduceMotion ? 0.5 : 0);
  useLoop(t, { duration: 2400, delay, reduceMotion, bounce: false });
  if (reduceMotion) return null;
  return (
    <AnimatedG
      translateX={t.interpolate({ inputRange: STEPS, outputRange: TRAIL_X })}
      translateY={t.interpolate({ inputRange: STEPS, outputRange: TRAIL_Y })}
      opacity={t.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] })}
    >
      <Heart x={-12 * scale} y={-12 * scale} scale={scale} fill={color} />
    </AnimatedG>
  );
}
export default function PartnerArt({ reduceMotion }) {
  const bob1 = useAnimatedValue(0);
  const bob2 = useAnimatedValue(0);
  const beat = useAnimatedValue(0);
  const halo = useAnimatedValue(0);
  useLoop(bob1, { duration: 2000, reduceMotion });
  useLoop(bob2, { duration: 2300, delay: 400, reduceMotion });
  useLoop(beat, { duration: 700, reduceMotion });
  useLoop(halo, { duration: 1600, reduceMotion });
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 700 700"
      preserveAspectRatio="xMidYMid slice"
      accessibilityLabel="His phone sends hearts to her phone. Her phone shows a promise of tea and a back rub, and a hug."
    >
      <Defs>
        <LinearGradient id="pa-bg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFE9EC" />
          <Stop offset="0.55" stopColor="#FFF4EF" />
          <Stop offset="1" stopColor="#FFF8F0" />
        </LinearGradient>
        <RadialGradient id="pa-halo" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#F7B7C3" stopOpacity="0.9" />
          <Stop offset="1" stopColor="#F7B7C3" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="pa-ring" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#F2A0AE" />
          <Stop offset="0.6" stopColor="#DC5A74" />
          <Stop offset="1" stopColor="#D6A24E" />
        </LinearGradient>
        <LinearGradient id="pa-badge" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E2647C" />
          <Stop offset="1" stopColor="#C04E68" />
        </LinearGradient>
      </Defs>
      <Rect width={700} height={700} fill="url(#pa-bg)" />
      <AnimatedCircle
        cx={400}
        cy={190}
        r={halo.interpolate({ inputRange: [0, 1], outputRange: [160, 180] })}
        fill="url(#pa-halo)"
        opacity={0.55}
      />
      <Path d="M70 640 C 160 590, 220 670, 320 625" fill="none" stroke="#9ED9C3" strokeWidth={3} strokeLinecap="round" />
      <Ellipse cx={150} cy={618} rx={11} ry={5} fill="#9ED9C3" transform="rotate(-30 150 618)" />
      <Ellipse cx={250} cy={640} rx={11} ry={5} fill="#9ED9C3" transform="rotate(25 250 640)" />
      <Path d="M520 660 C 570 620, 610 670, 650 630" fill="none" stroke="#F2C9B8" strokeWidth={3} strokeLinecap="round" />
      <Flower x={110} y={120} rx={8} ry={12} color="#F29BAE" center="#DC5A74" />
      <Flower x={615} y={560} rx={10} ry={15} color="#5FA98C" center="#D6A24E" />
      <Flower x={95} y={520} rx={6} ry={8} color="#E89A6B" center="#FFFFFF" />
      <Circle cx={640} cy={160} r={4} fill="#D6A24E" />
      <Circle cx={80} cy={330} r={4} fill="#9ED9C3" />
      <Circle cx={630} cy={420} r={3.5} fill="#F2A0AE" />
      <Circle cx={360} cy={680} r={3.5} fill="#D6A24E" />

      <G transform="rotate(8 545 330)">
        <Rect x={480} y={238} width={130} height={230} rx={24} fill="rgba(192,78,104,0.08)" />
        <Rect x={480} y={230} width={130} height={230} rx={24} fill="#FFFFFF" stroke="#F2E6E1" strokeWidth={3} />
        <Rect x={525} y={242} width={40} height={7} rx={3.5} fill="#F2E6E1" />
        <Circle cx={545} cy={290} r={20} fill="#F6E6CC" />
        <SvgText x={545} y={297} textAnchor="middle" fontSize={18} fontFamily={BOLD} fill="#A9663D">
          T
        </SvgText>
        <Rect x={500} y={325} width={40} height={38} rx={10} fill="#FFF0F2" stroke="#DC5A74" strokeWidth={2} />
        <Rect x={550} y={325} width={40} height={38} rx={10} fill="#FBF6F4" stroke="#F2E6E1" strokeWidth={2} />
        <Rect x={500} y={370} width={40} height={38} rx={10} fill="#FBF6F4" stroke="#F2E6E1" strokeWidth={2} />
        <Rect x={550} y={370} width={40} height={38} rx={10} fill="#FFF0F2" stroke="#DC5A74" strokeWidth={2} />
        <Heart x={511} y={334} scale={0.75} fill="#DC5A74" />
        <Heart x={561} y={379} scale={0.75} fill="#DC5A74" />
        <Rect x={500} y={420} width={90} height={22} rx={11} fill="#DC5A74" />
        <SvgText x={545} y={435} textAnchor="middle" fontSize={10} fontFamily={BOLD} fill="#FFFFFF">
          SEND ♡
        </SvgText>
      </G>

      <Path d={TRAIL} fill="none" stroke="#F2A0AE" strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" />
      {TRAVELLERS.map(h => (
        <Traveller key={h.color} {...h} reduceMotion={reduceMotion} />
      ))}

      <G transform="translate(400 140)">
        <AnimatedG scale={beat.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] })}>
          <Circle r={34} fill="url(#pa-badge)" />
          <Heart x={-18} y={-19} scale={1.5} fill="#FFFFFF" />
        </AnimatedG>
      </G>

      <G transform="rotate(-6 210 360)">
        <Rect x={110} y={208} width={200} height={350} rx={32} fill="rgba(192,78,104,0.08)" />
        <Rect x={110} y={200} width={200} height={350} rx={32} fill="#FFFFFF" stroke="#F2D0D8" strokeWidth={3} />
        <Rect x={180} y={215} width={60} height={9} rx={4.5} fill="#F2E6E1" />
        <Circle cx={210} cy={262} r={20} fill="#FCE0DE" />
        <SvgText x={210} y={269} textAnchor="middle" fontSize={18} fontFamily={BOLD} fill="#C04E68">
          A
        </SvgText>
        <Circle cx={210} cy={360} r={52} fill="none" stroke="#F2E6E1" strokeWidth={13} />
        <Circle
          cx={210}
          cy={360}
          r={52}
          fill="none"
          stroke="url(#pa-ring)"
          strokeWidth={13}
          strokeLinecap="round"
          strokeDasharray="230 327"
          transform="rotate(-90 210 360)"
        />
        <Heart x={192} y={340} scale={1.5} fill="#DC5A74" />
        <Circle cx={152} cy={458} r={9} fill="#FCE0DE" />
        <Circle cx={178} cy={458} r={9} fill="#FCE0DE" />
        <Circle cx={204} cy={458} r={9} fill="#DC5A74" />
        <Circle cx={230} cy={458} r={9} fill="#E7F2EB" />
        <Circle cx={256} cy={458} r={9} fill="#F6E6CC" />
      </G>

      <AnimatedG translateY={bob1.interpolate({ inputRange: [0, 1], outputRange: [6, -4] })}>
        <Card x={180} y={490} w={350} h={86} r={24} />
        <Circle cx={226} cy={533} r={25} fill="#FFF0F2" />
        <Heart x={214} y={521} fill="#DC5A74" />
        <SvgText x={264} y={526} fontSize={18} fontFamily={BOLD} fill="#2E2429">
          A promise from Tunde ♡
        </SvgText>
        <SvgText x={264} y={552} fontSize={14.5} fontFamily={MEDIUM} fill="#6E6066">
          {'Tea & treats · Back rub'}
        </SvgText>
      </AnimatedG>
      <AnimatedG translateY={bob2.interpolate({ inputRange: [0, 1], outputRange: [-4, 6] })}>
        <Card x={240} y={592} w={320} h={74} r={22} />
        <Circle cx={280} cy={629} r={22} fill="#FFF6E5" />
        <SvgText x={280} y={637} textAnchor="middle" fontSize={22}>
          🤗
        </SvgText>
        <SvgText x={314} y={623} fontSize={16} fontFamily={BOLD} fill="#2E2429">
          Tunde sent you a hug
        </SvgText>
        <SvgText x={314} y={647} fontSize={13.5} fontFamily={MEDIUM} fill="#6E6066">
          Just because ♡
        </SvgText>
      </AnimatedG>
    </Svg>
  );
}
