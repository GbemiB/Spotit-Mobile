import { useEffect } from 'react';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect, Circle, Ellipse, Path, G, Line, Text as SvgText } from 'react-native-svg';
import { FONT } from '../../shared/styles/typography.js';
import { useAnimatedValue } from '../dashboard/HeroCardFx.jsx';
import { AnimatedG, AnimatedCircle, AnimatedRect, Flower, useLoop, useCycle } from './artFx.jsx';
const COLS = [170, 232, 294, 356, 418, 480, 542];
const ROWS = [440, 500, 560];
const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const FERTILE = [
  { x: 356, y: 500, day: 11 },
  { x: 418, y: 500, day: 12 },
  { x: 480, y: 500, day: 13 },
  { x: 542, y: 500, day: 14 },
  { x: 170, y: 560, day: 15 },
];
const OVULATION = { x: 232, y: 560 };
const OV_START = 0.42;
const REST = 0.6;
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];
function Twinkle({ cx, cy, r, color, delay, reduceMotion }) {
  const v = useAnimatedValue(0);
  useLoop(v, { duration: 1100, delay, reduceMotion });
  return <AnimatedCircle cx={cx} cy={cy} r={r} fill={color} opacity={v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] })} />;
}
export default function FertilityArt({ reduceMotion }) {
  const cycle = useAnimatedValue(0);
  const rays = useAnimatedValue(0);
  const glow = useAnimatedValue(0);
  const ring = useAnimatedValue(0);
  const mercury = useAnimatedValue(0);
  const card = useAnimatedValue(0);
  const egg = useAnimatedValue(0);
  const sway = useAnimatedValue(0);
  useCycle(cycle, { duration: 6000, reduceMotion });
  useCycle(rays, { duration: 24000, reduceMotion });
  useCycle(ring, { duration: 1400, reduceMotion });
  useLoop(glow, { duration: 1500, reduceMotion });
  useLoop(mercury, { duration: 2000, reduceMotion });
  useLoop(card, { duration: 2500, reduceMotion });
  useLoop(egg, { duration: 2300, reduceMotion });
  useLoop(sway, { duration: 2500, reduceMotion });
  useEffect(() => {
    if (reduceMotion) cycle.setValue(REST);
  }, [reduceMotion, cycle]);
  const ovOpacity = cycle.interpolate({ inputRange: [0, OV_START, OV_START + 0.05, 0.88, 1], outputRange: [0, 0, 1, 1, 0] });
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 700 840"
      preserveAspectRatio="xMidYMid slice"
      accessibilityLabel="A fertile window calendar where fertile days light up green and ovulation glows gold, with a turning sun and a rising thermometer"
    >
      <Defs>
        <RadialGradient id="fe-glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#E3F3EA" stopOpacity="0.95" />
          <Stop offset="1" stopColor="#E3F3EA" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="fe-head" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#3DA275" />
          <Stop offset="1" stopColor="#22865C" />
        </LinearGradient>
      </Defs>
      <Circle cx={350} cy={430} r={330} fill="url(#fe-glow)" />

      <G transform="translate(170 175)">
        <AnimatedCircle r={glow.interpolate({ inputRange: [0, 1], outputRange: [64, 78] })} fill="#FBE7B8" opacity={0.35} />
        <AnimatedG rotation={rays.interpolate({ inputRange: [0, 1], outputRange: [0, 360] })}>
          {RAYS.map(a => (
            <Line
              key={a}
              x1={0}
              y1={-78}
              x2={0}
              y2={-108}
              stroke="#F7D98A"
              strokeWidth={12}
              strokeLinecap="round"
              transform={`rotate(${a})`}
            />
          ))}
        </AnimatedG>
        <Circle r={56} fill="#FBDF92" />
      </G>

      <AnimatedG translateY={card.interpolate({ inputRange: [0, 1], outputRange: [0, -6] })}>
        <G transform="rotate(3 345 440)">
          <Rect x={140} y={292} width={430} height={370} rx={26} fill="rgba(0,0,0,0.07)" />
          <Rect x={132} y={282} width={430} height={370} rx={26} fill="#FFFFFF" />
          <Path d="M132 308 a26 26 0 0 1 26 -26 h378 a26 26 0 0 1 26 26 v60 h-430 z" fill="url(#fe-head)" />
          {[210, 300, 390, 480].map(cx => (
            <Circle key={cx} cx={cx} cy={282} r={11} fill="#FFFFFF" stroke="#22865C" strokeWidth={5} />
          ))}
          <SvgText x={347} y={340} textAnchor="middle" fontSize={26} fontFamily={FONT.extraBold} fill="#FFFFFF" letterSpacing={1}>
            FERTILE WINDOW
          </SvgText>
          {WEEK.map((d, i) => (
            <SvgText key={i} x={COLS[i]} y={398} textAnchor="middle" fontSize={13} fontFamily={FONT.bold} fill="#7DBA9E">
              {d}
            </SvgText>
          ))}
          {ROWS.map(y => COLS.map(x => <Circle key={`${x}-${y}`} cx={x} cy={y} r={22} fill="#E3F3EA" />))}
          {FERTILE.map((d, i) => {
            const a = 0.05 + i * 0.07;
            return (
              <G key={d.day}>
                <AnimatedCircle
                  cx={d.x}
                  cy={d.y}
                  r={22}
                  fill="#4E9E78"
                  opacity={cycle.interpolate({ inputRange: [0, a, a + 0.05, 0.88, 1], outputRange: [0, 0, 1, 1, 0] })}
                />
                <SvgText x={d.x} y={d.y + 5} textAnchor="middle" fontSize={13} fontFamily={FONT.extraBold} fill="#2E2429">
                  {String(d.day)}
                </SvgText>
              </G>
            );
          })}
          <AnimatedG opacity={ovOpacity}>
            <Circle cx={OVULATION.x} cy={OVULATION.y} r={22} fill="#F2B33D" />
            <AnimatedCircle
              cx={OVULATION.x}
              cy={OVULATION.y}
              r={ring.interpolate({ inputRange: [0, 1], outputRange: [22, 34] })}
              fill="none"
              stroke="#F2B33D"
              strokeWidth={4}
              opacity={ring.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] })}
            />
            <Circle cx={OVULATION.x} cy={OVULATION.y} r={9} fill="#FFFFFF" />
          </AnimatedG>
          <Rect x={200} y={606} width={300} height={30} rx={15} fill="#FFF6E5" />
          <Circle cx={222} cy={621} r={7} fill="#F2B33D" />
          <SvgText x={240} y={626} fontSize={13} fontFamily={FONT.extraBold} fill="#A9663D">
            Ovulation · day 16
          </SvgText>
        </G>
      </AnimatedG>

      <G transform="translate(590 230) rotate(18)">
        <Rect x={-20} y={-110} width={40} height={190} rx={20} fill="#FFFFFF" stroke="#F2C9D2" strokeWidth={4} />
        <Circle cx={0} cy={96} r={30} fill="#E8476A" stroke="#FFFFFF" strokeWidth={6} />
        <AnimatedRect
          x={-8}
          y={mercury.interpolate({ inputRange: [0, 1], outputRange: [20, -80] })}
          width={16}
          height={mercury.interpolate({ inputRange: [0, 1], outputRange: [70, 170] })}
          rx={8}
          fill="#E8476A"
        />
      </G>

      <AnimatedG translateY={egg.interpolate({ inputRange: [0, 1], outputRange: [0, -14] })}>
        <Path
          d="M555 700 C 520 700, 505 770, 540 800 C 570 825, 620 805, 615 760 C 610 720, 585 700, 555 700 z"
          fill="#FFF3D9"
          stroke="#F7D98A"
          strokeWidth={4}
        />
        <Ellipse cx={548} cy={735} rx={10} ry={14} fill="#FFFFFF" opacity={0.8} />
      </AnimatedG>

      <G transform="translate(120 700)">
        <AnimatedG rotation={sway.interpolate({ inputRange: [0, 1], outputRange: [0, 20] })}>
          <Flower x={0} y={0} rx={11} ry={16} color="#5FA98C" center="#D6A24E" />
        </AnimatedG>
      </G>
      <G transform="translate(470 120)">
        <AnimatedG rotation={sway.interpolate({ inputRange: [0, 1], outputRange: [0, -20] })}>
          <Flower x={0} y={0} rx={8} ry={12} color="#F29BAE" center="#DC5A74" />
        </AnimatedG>
      </G>
      <Path d="M60 620 C 120 600, 170 640, 230 610" fill="none" stroke="#8FCFB5" strokeWidth={3} strokeLinecap="round" />
      <Ellipse cx={120} cy={608} rx={10} ry={4.5} fill="#8FCFB5" transform="rotate(-25 120 608)" />
      <Path d="M380 110 C 420 80, 450 120, 510 90" fill="none" stroke="#F2C9B8" strokeWidth={3} strokeLinecap="round" />
      <Twinkle cx={640} cy={560} r={4.5} color="#9ED9C3" delay={0} reduceMotion={reduceMotion} />
      <Twinkle cx={80} cy={420} r={4} color="#F2A0AE" delay={500} reduceMotion={reduceMotion} />
      <Twinkle cx={330} cy={780} r={4} color="#D6A24E" delay={900} reduceMotion={reduceMotion} />
    </Svg>
  );
}
