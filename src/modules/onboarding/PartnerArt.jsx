import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Circle, Ellipse, Path, G, Text as SvgText } from 'react-native-svg';
import { FONT } from '../../shared/styles/typography.js';
import { useAnimatedValue } from '../dashboard/HeroCardFx.jsx';
import { AnimatedG, AnimatedCircle, Flower, Card, useLoop } from './artFx.jsx';
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
function Person({ cx, cy, color }) {
  return (
    <G>
      <Circle cx={cx} cy={cy - 5} r={6.5} fill={color} />
      <Path d={`M${cx - 11} ${cy + 12}c0-6.5 5-10.5 11-10.5s11 4 11 10.5`} fill={color} />
    </G>
  );
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
      viewBox="0 0 700 840"
      preserveAspectRatio="xMidYMid slice"
      accessibilityLabel="His phone sends hearts to her phone. Her phone shows a promise of tea and a back rub, and a hug."
    >
      <Defs>
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
      <G transform="translate(350 420) scale(0.87) translate(-360 -400)">
        <AnimatedCircle
          cx={400}
          cy={190}
          r={halo.interpolate({ inputRange: [0, 1], outputRange: [160, 180] })}
          fill="url(#pa-halo)"
          opacity={0.55}
        />
      </G>
      <G transform="translate(0 70)">
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
      </G>

      <G transform="translate(350 420) scale(0.87) translate(-360 -400)">
        <G transform="rotate(8 545 330)">
          <Rect x={480} y={238} width={130} height={230} rx={24} fill="rgba(192,78,104,0.08)" />
          <Rect x={480} y={230} width={130} height={230} rx={24} fill="#FFFFFF" stroke="#F2E6E1" strokeWidth={4} />
          <Rect x={525} y={242} width={40} height={7} rx={3.5} fill="#F2E6E1" />
          <Circle cx={545} cy={290} r={20} fill="#F6E6CC" />
          <Person cx={545} cy={290} color="#A9663D" />
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

        <Path d={TRAIL} fill="none" stroke="#F2A0AE" strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />
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
          <Rect x={110} y={200} width={200} height={350} rx={32} fill="#FFFFFF" stroke="#F2D0D8" strokeWidth={4} />
          <Rect x={180} y={215} width={60} height={9} rx={4.5} fill="#F2E6E1" />
          <Circle cx={210} cy={262} r={20} fill="#FCE0DE" />
          <Person cx={210} cy={262} color="#C04E68" />
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
          <Card x={170} y={490} w={390} h={86} r={24} />
          <Circle cx={216} cy={533} r={25} fill="#FFF0F2" />
          <Heart x={204} y={521} fill="#DC5A74" />
          <SvgText x={254} y={526} fontSize={17} fontFamily={BOLD} fill="#2E2429">
            A promise from your partner ♡
          </SvgText>
          <SvgText x={254} y={552} fontSize={14.5} fontFamily={MEDIUM} fill="#6E6066">
            {'Tea & treats · Back rub'}
          </SvgText>
        </AnimatedG>
        <AnimatedG translateY={bob2.interpolate({ inputRange: [0, 1], outputRange: [-4, 6] })}>
          <Card x={220} y={592} w={360} h={74} r={22} />
          <Circle cx={260} cy={629} r={22} fill="#FFF6E5" />
          <SvgText x={260} y={637} textAnchor="middle" fontSize={22}>
            🤗
          </SvgText>
          <SvgText x={294} y={623} fontSize={16} fontFamily={BOLD} fill="#2E2429">
            Your partner sent you a hug
          </SvgText>
          <SvgText x={294} y={647} fontSize={13.5} fontFamily={MEDIUM} fill="#6E6066">
            A little love for you ♡
          </SvgText>
        </AnimatedG>
      </G>
    </Svg>
  );
}
