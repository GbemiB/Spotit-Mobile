import { useEffect } from 'react';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle, Path, G, Line, Text as SvgText } from 'react-native-svg';
import { FONT } from '../../shared/styles/typography.js';
import { useAnimatedValue } from '../dashboard/HeroCardFx.jsx';
import { AnimatedG, AnimatedCircle, Flower, useLoop, useCycle } from './artFx.jsx';
const DAYS = Array.from({ length: 28 }, (_, i) => i + 1);
const BLOOM_DAYS = [17, 18, 19, 20, 21];
const COLS = [150, 216, 282, 348, 414, 480, 546];
const ROWS = [275, 333, 391, 449];
const REST = 0.6;
function dayPos(day) {
  return [COLS[(day - 1) % 7], ROWS[Math.floor((day - 1) / 7)]];
}
function Bloom({ day, index, cycle }) {
  const [x, y] = dayPos(day);
  const a = 0.05 + index * 0.08;
  return (
    <G transform={`translate(${x} ${y - 6})`}>
      <AnimatedG scale={cycle.interpolate({ inputRange: [0, a, a + 0.07, a + 0.11, 0.88, 1], outputRange: [0, 0, 1.18, 1, 1, 0] })}>
        {[0, 60, 120, 180, 240, 300].map(r => (
          <Circle key={r} cx={0} cy={-14} r={11} fill="#F29BAE" transform={`rotate(${r})`} />
        ))}
        <Circle r={13} fill="#FFFFFF" />
        <SvgText y={5} textAnchor="middle" fontSize={14} fontFamily={FONT.extraBold} fill="#C0264E">
          {String(day)}
        </SvgText>
      </AnimatedG>
    </G>
  );
}
function Twinkle({ cx, cy, r, delay, reduceMotion }) {
  const v = useAnimatedValue(0);
  useLoop(v, { duration: 1100, delay, reduceMotion });
  return <AnimatedCircle cx={cx} cy={cy} r={r} fill="#FFFFFF" opacity={v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] })} />;
}
export default function RhythmArt({ reduceMotion }) {
  const cycle = useAnimatedValue(0);
  const hour = useAnimatedValue(0);
  const spin = useAnimatedValue(0);
  const bob = useAnimatedValue(0);
  const bob2 = useAnimatedValue(0);
  const disc = useAnimatedValue(0);
  useCycle(cycle, { duration: 6000, reduceMotion });
  useCycle(hour, { duration: 72000, reduceMotion });
  useCycle(spin, { duration: 18000, reduceMotion });
  useLoop(bob, { duration: 2000, reduceMotion });
  useLoop(bob2, { duration: 2200, delay: 600, reduceMotion });
  useLoop(disc, { duration: 2500, reduceMotion });
  useEffect(() => {
    if (reduceMotion) cycle.setValue(REST);
  }, [reduceMotion, cycle]);
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 700 840"
      preserveAspectRatio="xMidYMid slice"
      accessibilityLabel="A menstrual calendar where period days bloom into flowers, a ticking clock, and a reminder that the period starts in 2 days"
    >
      <Defs>
        <RadialGradient id="rh-disc" cx="50%" cy="45%" r="55%">
          <Stop offset="0" stopColor="#EF8DA2" />
          <Stop offset="0.75" stopColor="#E06C86" />
          <Stop offset="1" stopColor="#E06C86" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <AnimatedCircle cx={350} cy={420} r={disc.interpolate({ inputRange: [0, 1], outputRange: [330, 345] })} fill="url(#rh-disc)" />

      <AnimatedG translateY={bob.interpolate({ inputRange: [0, 1], outputRange: [0, -10] })}>
        <G transform="rotate(-18 115 90)">
          <Path d="M70 60 h90 l-12 62 a32 32 0 0 1 -66 0 z" fill="#F06283" opacity={0.95} />
          <Path d="M86 70 h18 l-6 44 a12 12 0 0 1 -6 0 z" fill="#FFFFFF" opacity={0.4} />
        </G>
      </AnimatedG>

      <G transform="rotate(-3 350 315)">
        <Rect x={112} y={158} width={480} height={330} rx={24} fill="rgba(0,0,0,0.08)" />
        <Rect x={105} y={148} width={480} height={330} rx={24} fill="#FFFFFF" />
        <SvgText x={345} y={208} textAnchor="middle" fontFamily={FONT.serif} fontStyle="italic" fontSize={40} fill="#C0264E">
          Menstrual Calendar
        </SvgText>
        <Rect x={135} y={224} width={420} height={2} rx={1} fill="#F2D0D8" />
        {DAYS.map(day => {
          const [x, y] = dayPos(day);
          return (
            <SvgText key={day} x={x} y={y} textAnchor="middle" fontSize={17} fontFamily={FONT.bold} fill="#8A6E77">
              {String(day)}
            </SvgText>
          );
        })}
        {BLOOM_DAYS.map((day, i) => (
          <Bloom key={day} day={day} index={i} cycle={cycle} />
        ))}
      </G>

      <AnimatedG
        opacity={cycle.interpolate({ inputRange: [0, 0.45, 0.55, 0.9, 1], outputRange: [0, 0, 1, 1, 0] })}
        translateX={cycle.interpolate({ inputRange: [0, 0.45, 0.55, 1], outputRange: [80, 80, 0, 0] })}
      >
        <Rect x={318} y={512} width={330} height={70} rx={22} fill="rgba(0,0,0,0.08)" />
        <Rect x={312} y={504} width={330} height={70} rx={22} fill="#FFFFFF" />
        <Circle cx={350} cy={539} r={22} fill="#FFF0F2" />
        <Path
          d="M342 545 v-9 a8 8 0 0 1 16 0 v9 l2 3 h-20 z M347 550 a3 3 0 0 0 6 0"
          fill="none"
          stroke="#C04E68"
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
        <SvgText x={384} y={533} fontSize={15} fontFamily={FONT.extraBold} fill="#2E2429">
          Period reminder
        </SvgText>
        <SvgText x={384} y={556} fontSize={14} fontFamily={FONT.semiBold} fill="#6E6066">
          Your period starts in 2 days
        </SvgText>
      </AnimatedG>

      <G transform="translate(250 690)">
        <Circle r={78} fill="#E8476A" />
        <Circle r={62} fill="#FFFFFF" />
        <Line x1={0} y1={-52} x2={0} y2={-44} stroke="#F2A0AE" strokeWidth={4} strokeLinecap="round" />
        <Line x1={0} y1={44} x2={0} y2={52} stroke="#F2A0AE" strokeWidth={4} strokeLinecap="round" />
        <Line x1={-52} y1={0} x2={-44} y2={0} stroke="#F2A0AE" strokeWidth={4} strokeLinecap="round" />
        <Line x1={44} y1={0} x2={52} y2={0} stroke="#F2A0AE" strokeWidth={4} strokeLinecap="round" />
        <AnimatedG rotation={cycle.interpolate({ inputRange: [0, 1], outputRange: [0, 360] })}>
          <Line x1={0} y1={0} x2={0} y2={-40} stroke="#C0264E" strokeWidth={6} strokeLinecap="round" />
        </AnimatedG>
        <AnimatedG rotation={hour.interpolate({ inputRange: [0, 1], outputRange: [0, 360] })}>
          <Line x1={0} y1={0} x2={22} y2={0} stroke="#C0264E" strokeWidth={7} strokeLinecap="round" />
        </AnimatedG>
        <Circle r={7} fill="#C0264E" />
      </G>

      <AnimatedG translateY={bob2.interpolate({ inputRange: [0, 1], outputRange: [0, -12] })}>
        <G transform="rotate(-8 470 690)">
          <Rect x={430} y={610} width={80} height={160} rx={40} fill="#FFFFFF" stroke="#F2C9D2" strokeWidth={3} />
          <Rect x={388} y={650} width={46} height={70} rx={20} fill="#FFFFFF" stroke="#F2C9D2" strokeWidth={3} />
          <Rect x={506} y={650} width={46} height={70} rx={20} fill="#FFFFFF" stroke="#F2C9D2" strokeWidth={3} />
          <Rect x={455} y={640} width={30} height={100} rx={15} fill="#FCE0E5" />
          <G transform="translate(470 690)">
            <Circle cx={0} cy={-8} r={7} fill="#F29BAE" />
            <Circle cx={8} cy={0} r={7} fill="#F29BAE" />
            <Circle cx={0} cy={8} r={7} fill="#F29BAE" />
            <Circle cx={-8} cy={0} r={7} fill="#F29BAE" />
            <Circle r={5} fill="#D6A24E" />
          </G>
        </G>
      </AnimatedG>

      <G transform="translate(470 92)">
        <AnimatedG rotation={spin.interpolate({ inputRange: [0, 1], outputRange: [0, 360] })}>
          <Flower x={0} y={0} rx={9} ry={13} color="#F0943E" center="#FBE7B8" />
        </AnimatedG>
      </G>
      <Flower x={128} y={760} rx={9} ry={13} color="#F0943E" center="#FBE7B8" />
      <Flower x={600} y={560} rx={7} ry={10} color="#F6C1CC" center="#D6A24E" />
      <Path d="M380 125 C 420 90, 440 60, 470 40" fill="none" stroke="#E7B65A" strokeWidth={3} strokeLinecap="round" />
      <Path d="M40 555 C 90 525, 130 520, 180 488" fill="none" stroke="#8FCFB5" strokeWidth={3} strokeLinecap="round" />
      <Twinkle cx={640} cy={300} r={5} delay={0} reduceMotion={reduceMotion} />
      <Twinkle cx={520} cy={828} r={5} delay={500} reduceMotion={reduceMotion} />
      <Twinkle cx={60} cy={300} r={4} delay={900} reduceMotion={reduceMotion} />
    </Svg>
  );
}
