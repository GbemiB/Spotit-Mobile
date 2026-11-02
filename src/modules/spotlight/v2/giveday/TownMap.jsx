import { Animated, Easing, View, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import Svg, { Defs, LinearGradient as SvgGradient, RadialGradient, Stop, Rect, Path, Circle, Ellipse, G, Text as SvgText } from 'react-native-svg';
import { Text } from '../../../../shared/styles/index.js';
import { Bob, PressScale, Twinkle } from '../../common/SpotlightFx.jsx';
import { useAnimatedValue } from '../../../dashboard/HeroCardFx.jsx';
import Character from '../Character.jsx';
import { STAR_PATH } from '../tokens.js';
import { ds, Sway, Travel, Blink, Drift, Pulse } from '../motion.jsx';

export const PLACE_KINDS = {
  'hope-house': 'home',
  'bright-school': 'school',
  'hope-camp': 'camp',
  'girls-fc': 'pitch',
  'oshodi-road': 'stop',
  'balogun-market': 'market',
  'my-kit': 'pharmacy',
  'ikire-village': 'village',
};

const ROADS = 'M14 217 H376 M14 317 H376 M14 517 H376 M150 627 H376 M195 140 V517 M258 517 V627';
const LINES = 'M20 217 H180 M210 217 H370 M20 317 H180 M210 317 H370 M20 517 H180 M210 517 H243 M273 517 H370 M156 627 H243 M273 627 H370 M195 150 V202 M195 232 V302 M195 332 V390 M195 444 V502 M258 532 V612';

export function mapColors(isDark) {
  return isDark
    ? { hill: '#26302A', park: '#22302A', waterLine: 'rgba(255,255,255,0.2)', pave: '#2E2A28', zebra: 'rgba(255,255,255,0.35)', bench: '#5E3E36', lampPost: '#7A6C71', lamp: '#FFD98A', bird: '#C7B8BD', car1: '#E2647C', car2: '#6BBF9B', carGlass: '#8FB8D6', tyre: '#120C0E', keke: '#E0B564', person1: '#C7A592', person1b: '#E2647C', person2: '#8D5A3B', person2b: '#6BBF9B', trunk: '#7A5446', fence: '#5E3E36', flower: '#F2A0AE', tank: '#5E6E7A', pitch: '#2F5A44', sign: '#2A2023', crate: '#7A5446', thatch: '#9A7A4E', sky1: '#1E1624', sky2: '#2A1E2A', ground: '#1C2420', road: '#3A322C', roadLine: 'rgba(255,255,255,0.18)', water: '#2E4A5A', tree: '#2E4D3E', treeDot: '#3E6B55', sun: '#F5EDE9', cloud: 'rgba(255,255,255,0.08)', shadow: 'rgba(0,0,0,0.35)', window: '#F7C98A', fountainTop: '#8FB8D6', meBg: '#3A2C30' }
    : { hill: '#D2E8D9', park: '#D6EBDD', waterLine: '#FFFFFF', pave: '#EDE2DA', zebra: '#FFFFFF', bench: '#C79A72', lampPost: '#9A8B90', lamp: '#FFF1C4', bird: '#9A8B90', car1: '#E8708A', car2: '#8FCBA9', carGlass: '#CFE6F2', tyre: '#2E2429', keke: '#E2B86A', person1: '#C7A592', person1b: '#F2A0AE', person2: '#8D5A3B', person2b: '#8FCBA9', trunk: '#B98B66', fence: '#D9B08A', flower: '#F2A0AE', tank: '#A8C5DA', pitch: '#9FD3B4', sign: '#FFFFFF', crate: '#D9B08A', thatch: '#D9B887', sky1: '#FFE3D4', sky2: '#FFF3EC', ground: '#E6F2E9', road: '#D9CFC8', roadLine: '#FFFFFF', water: '#CFE6F2', tree: '#A5D8BA', treeDot: '#8FCBA9', sun: '#FBE3B0', cloud: '#FFFFFF', shadow: 'rgba(47,116,84,0.18)', window: '#FFF6EE', fountainTop: '#FFFFFF', meBg: '#FFE3C8' };
}

export function placeTones(isDark) {
  return isDark
    ? [['#4A3438', '#E2647C', '#5E3E46'], ['#3E3A2E', '#C28A33', '#5A4A30'], ['#2E3A34', '#6BBF9B', '#3E5246'], ['#3A3040', '#F2A0AE', '#4A3A44']]
    : [['#FFFFFF', '#F2A0AE', '#E8C3BC'], ['#FFF6EE', '#E2B86A', '#D9B68A'], ['#F3FAF5', '#8FCBA9', '#B7DFC8'], ['#FFF0F2', '#DC5A74', '#E8C3BC']];
}

export function Building({ kind, wall, roof, door, m, t, size }) {
  return (
    <Svg width={size} height={size * (70 / 84)} viewBox="0 0 84 70">
      <Ellipse cx={44} cy={66} rx={36} ry={4} fill={m.shadow} />
      {kind === 'school' ? (
        <G>
          <Path d="M66 26 L74 21 L74 58 L66 63 Z" fill={wall} />
          <Path d="M66 26 L74 21 L74 58 L66 63 Z" fill="#000" opacity={0.1} />
          <Rect x={10} y={26} width={56} height={37} fill={wall} />
          <Rect x={8} y={21} width={60} height={7} rx={1.5} fill={roof} />
          <Circle cx={38} cy={18} r={6} fill={m.window} stroke={roof} strokeWidth={2} />
          <Path d="M38 15 V18 H40.5" stroke={door} strokeWidth={1.2} fill="none" />
          <Rect x={15} y={33} width={9} height={8} rx={1.5} fill={m.window} />
          <Rect x={52} y={33} width={9} height={8} rx={1.5} fill={m.window} />
          <Rect x={31} y={44} width={14} height={19} rx={2} fill={door} />
          <Rect x={27} y={61} width={22} height={3} fill={m.pave} />
          <Rect x={3} y={4} width={1.6} height={60} fill={m.lampPost} />
          <Path d="M4.6 5 h12 l-3 4 l3 4 h-12 z" fill={t.green} />
        </G>
      ) : kind === 'camp' ? (
        <G>
          <Path d="M4 62 L19 34 L34 62 Z" fill={roof} />
          <Path d="M19 34 L19 62 L34 62 Z" fill="#000" opacity={0.12} />
          <Path d="M19 48 L16 62 H22 Z" fill={door} />
          <Path d="M26 62 L43 28 L60 62 Z" fill={wall} stroke={roof} strokeWidth={1.5} />
          <Path d="M43 46 L39 62 H47 Z" fill={door} />
          <Path d="M52 62 L66 38 L80 62 Z" fill={roof} />
          <Path d="M66 38 L66 62 L80 62 Z" fill="#000" opacity={0.12} />
          <Rect x={70} y={26} width={10} height={12} rx={2} fill={m.tank} />
          <Rect x={71} y={38} width={1.5} height={8} fill={m.lampPost} />
          <Rect x={77.5} y={38} width={1.5} height={8} fill={m.lampPost} />
        </G>
      ) : kind === 'pitch' ? (
        <G>
          <Path d="M6 34 H78 L82 62 H2 Z" fill={m.pitch} />
          <Path d="M6 34 H78 L82 62 H2 Z M42 34 V62" stroke="#FFFFFF" strokeWidth={1.4} fill="none" opacity={0.9} />
          <Ellipse cx={42} cy={48} rx={8} ry={5} stroke="#FFFFFF" strokeWidth={1.4} fill="none" opacity={0.9} />
          <Path d="M4 42 h5 v12 h-5 M80 42 h-5 v12 h5" stroke="#FFFFFF" strokeWidth={2} fill="none" />
          <Circle cx={54} cy={52} r={2.6} fill="#FFFFFF" stroke={m.tyre} strokeWidth={0.8} />
          <Path d="M10 18 h64 v12 h-64 z" fill={wall} />
          <Path d="M10 18 h64 l-4 -6 h-56 z" fill={roof} />
          <Path d="M16 24 h4 M24 24 h4 M32 24 h4 M48 24 h4 M56 24 h4 M64 24 h4" stroke={door} strokeWidth={3} strokeLinecap="round" />
        </G>
      ) : kind === 'stop' ? (
        <G>
          <Rect x={10} y={26} width={48} height={5} rx={2} fill={roof} />
          <Rect x={12} y={31} width={2.5} height={31} fill={m.lampPost} />
          <Rect x={54} y={31} width={2.5} height={31} fill={m.lampPost} />
          <Rect x={15} y={31} width={38} height={18} fill={m.carGlass} opacity={0.6} />
          <Rect x={18} y={52} width={32} height={4} rx={1.5} fill={m.bench} />
          <Circle cx={27} cy={42} r={3} fill={m.person1} />
          <Rect x={24} y={45} width={6} height={8} rx={3} fill={door} />
          <Circle cx={41} cy={42} r={3} fill={m.person2} />
          <Rect x={38} y={45} width={6} height={8} rx={3} fill={t.green} />
          <Rect x={68} y={20} width={2} height={42} fill={m.lampPost} />
          <Circle cx={69} cy={20} r={7} fill={m.sign} stroke={roof} strokeWidth={2} />
          <SvgText x={69} y={22.5} textAnchor="middle" fontSize={6.5} fontWeight="800" fill={roof}>
            BUS
          </SvgText>
        </G>
      ) : kind === 'market' ? (
        <G>
          <Path d="M4 34 a14 10 0 0 1 28 0 z" fill={roof} />
          <Path d="M11 34 a7 10 0 0 1 7 -10 v10 z" fill="#FFFFFF" opacity={0.6} />
          <Rect x={17} y={34} width={2} height={14} fill={m.lampPost} />
          <Rect x={6} y={46} width={26} height={8} rx={1.5} fill={door} />
          <Circle cx={12} cy={45} r={2.5} fill={m.flower} />
          <Circle cx={18} cy={45} r={2.5} fill={t.gold} />
          <Circle cx={24} cy={45} r={2.5} fill={t.green} />
          <Path d="M38 28 a16 11 0 0 1 32 0 z" fill={t.green} />
          <Path d="M46 28 a8 11 0 0 1 8 -11 v11 z" fill="#FFFFFF" opacity={0.6} />
          <Rect x={53} y={28} width={2} height={18} fill={m.lampPost} />
          <Rect x={40} y={44} width={30} height={9} rx={1.5} fill={wall} />
          <Rect x={44} y={40} width={8} height={5} fill={t.gold} />
          <Rect x={56} y={40} width={8} height={5} fill={roof} />
          <Rect x={70} y={52} width={10} height={10} rx={1} fill={m.crate} />
          <Rect x={4} y={56} width={10} height={7} rx={1} fill={m.crate} />
        </G>
      ) : kind === 'pharmacy' ? (
        <G>
          <Path d="M62 28 L70 23 L70 58 L62 63 Z" fill={wall} />
          <Path d="M62 28 L70 23 L70 58 L62 63 Z" fill="#000" opacity={0.1} />
          <Rect x={16} y={28} width={46} height={35} fill={wall} />
          <Path d="M14 38 h50 l-4 -8 h-42 z" fill={t.green} />
          <Path d="M14 38 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0" fill="#FFFFFF" opacity={0.8} />
          <Rect x={20} y={44} width={18} height={12} rx={2} fill={m.window} />
          <Rect x={44} y={44} width={12} height={19} rx={2} fill={door} />
          <Rect x={33} y={8} width={14} height={14} rx={3} fill={t.green} />
          <Path d="M40 11 v8 M36 15 h8" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" />
          <Rect x={39} y={22} width={2} height={6} fill={m.lampPost} />
        </G>
      ) : kind === 'village' ? (
        <G>
          <Rect x={10} y={42} width={24} height={21} rx={10} fill={wall} />
          <Path d="M6 44 L22 26 L38 44 Z" fill={m.thatch} />
          <Path d="M22 26 L38 44 L30 44 Z" fill="#000" opacity={0.12} />
          <Rect x={18} y={50} width={8} height={13} rx={3} fill={door} />
          <Rect x={40} y={46} width={20} height={17} rx={8} fill={wall} />
          <Path d="M37 48 L50 33 L63 48 Z" fill={m.thatch} />
          <Rect x={46} y={53} width={7} height={10} rx={3} fill={door} />
          <Path d="M71 62 Q73 40 71 22" stroke={m.trunk} strokeWidth={3} fill="none" />
          <Path d="M71 22 q-10 -6 -18 2 M71 22 q10 -6 16 3 M71 22 q-6 -10 -2 -16 M71 22 q-12 2 -14 12 M71 22 q12 2 12 12" stroke={m.tree} strokeWidth={4} fill="none" strokeLinecap="round" />
        </G>
      ) : (
        <G>
          <Circle cx={10} cy={48} r={9} fill={m.tree} />
          <Rect x={9} y={54} width={2} height={10} fill={m.trunk} />
          <Path d="M60 30 L70 24 L70 56 L60 62 Z" fill={wall} />
          <Path d="M60 30 L70 24 L70 56 L60 62 Z" fill="#000" opacity={0.1} />
          <Rect x={20} y={30} width={40} height={32} fill={wall} />
          <Path d="M16 32 L40 12 L64 32 Z" fill={roof} />
          <Path d="M40 12 L50 6 L74 26 L64 32 Z" fill={roof} />
          <Path d="M40 12 L50 6 L74 26 L64 32 Z" fill="#000" opacity={0.14} />
          <Rect x={50} y={10} width={5} height={9} fill={door} />
          <Rect x={35} y={46} width={10} height={16} rx={2} fill={door} />
          <Rect x={24} y={38} width={8} height={8} rx={1.5} fill={m.window} />
          <Rect x={48} y={38} width={8} height={8} rx={1.5} fill={m.window} />
          <Path d="M20 64 V58 M26 64 V58 M54 64 V58 M60 64 V58 M18 60 H62" stroke={m.fence} strokeWidth={1.6} />
          <Circle cx={30} cy={62} r={2} fill={m.flower} />
          <Circle cx={50} cy={62} r={2} fill={m.flower} />
        </G>
      )}
    </Svg>
  );
}

function Car({ color, glass, tyre, flip }) {
  return (
    <Svg width={30} height={16} viewBox="0 0 30 16" style={flip ? { transform: [{ scaleX: -1 }] } : null}>
      <Rect x={2} y={3} width={26} height={10} rx={4} fill={color} />
      <Rect x={16} y={5} width={7} height={6} rx={1.5} fill={glass} />
      <Circle cx={8} cy={14} r={2.4} fill={tyre} />
      <Circle cx={22} cy={14} r={2.4} fill={tyre} />
    </Svg>
  );
}

function Person({ head, body, flip }) {
  return (
    <Svg width={9} height={18} viewBox="0 0 9 18" style={flip ? { transform: [{ scaleX: -1 }] } : null}>
      <Circle cx={4.5} cy={3} r={2.8} fill={head} />
      <Rect x={1.5} y={6.5} width={6} height={7} rx={3} fill={body} />
      <Rect x={2} y={13} width={1.8} height={5} fill={head} />
      <Rect x={5.2} y={13} width={1.8} height={5} fill={head} />
    </Svg>
  );
}

export function Walker({ t, m, k, pos, walking, reduceMotion }) {
  const x = useAnimatedValue(pos.x);
  const y = useAnimatedValue(pos.y);
  useEffect(() => {
    if (reduceMotion) {
      x.setValue(pos.x);
      y.setValue(pos.y);
      return undefined;
    }
    const anim = Animated.parallel([
      Animated.timing(x, { toValue: pos.x, duration: 420, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(y, { toValue: pos.y, duration: 420, easing: Easing.linear, useNativeDriver: true }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [pos.x, pos.y, reduceMotion, x, y]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 3,
        transform: [{ translateX: Animated.multiply(Animated.add(x, -18), k) }, { translateY: Animated.multiply(Animated.add(y, -44), k) }],
      }}
    >
      <Bob distance={walking ? 5 : 0} duration={260} reduceMotion={reduceMotion || !walking}>
        <Pulse reduceMotion={reduceMotion} scale={1.04} duration={1800}>
          <View style={[styles.me, { backgroundColor: m.meBg, borderColor: t.pink }]}>
            <Character name="you" size={42} style={{ marginTop: -2, marginLeft: -5 }} />
          </View>
        </Pulse>
        <View style={[styles.pin, { borderTopColor: t.pink }]} />
      </Bob>
    </Animated.View>
  );
}

export default function TownMap({ t, isDark, k, height, spots, onSpot, selId, done, reduceMotion }) {
  const m = mapColors(isDark);
  const tones = placeTones(isDark);
  const W = 390 * k;
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width: W, height }}>
      <Svg width={W} height={844 * k} viewBox="0 0 390 844" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id="gdSky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={m.sky1} />
            <Stop offset="1" stopColor={m.sky2} />
          </SvgGradient>
          <RadialGradient id="gdLamp" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFD98A" stopOpacity={0.55} />
            <Stop offset="1" stopColor="#FFD98A" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={390} height={140} fill="url(#gdSky)" />
        <Circle cx={300} cy={120} r={14} fill={m.sun} />
        {isDark ? <Circle cx={306} cy={115} r={12} fill={m.sky1} /> : null}
        <Path d="M0 132 Q60 118 120 128 T250 122 T390 126 V844 H0 Z" fill={m.ground} />
        <Path d="M0 128 Q60 112 120 122 T250 116 T390 120" stroke={m.hill} strokeWidth={10} fill="none" opacity={0.7} />
        <Rect x={16} y={352} width={140} height={120} rx={20} fill={m.park} />
        <Rect x={234} y={352} width={140} height={120} rx={20} fill={m.park} />
        <Path d="M372 560 C 352 600, 392 640, 368 690 S 380 760, 360 844 H390 V560 Z" fill={m.water} />
        <Path d={ROADS} stroke={m.pave} strokeWidth={30} strokeLinecap="round" fill="none" />
        <Path d={ROADS} stroke={m.road} strokeWidth={20} strokeLinecap="round" fill="none" />
        <Path d={LINES} stroke={m.roadLine} strokeWidth={1.6} strokeDasharray="7 9" fill="none" />
        <G fill={m.zebra}>
          {[207, 307, 507].map(y => (
            <G key={y}>
              <Rect x={166} y={y} width={3} height={20} />
              <Rect x={172} y={y} width={3} height={20} />
              <Rect x={215} y={y} width={3} height={20} />
              <Rect x={221} y={y} width={3} height={20} />
            </G>
          ))}
        </G>
        <Circle cx={195} cy={417} r={34} fill={m.pave} />
        <Circle cx={195} cy={417} r={28} fill={m.road} />
        <Circle cx={195} cy={417} r={16} fill={m.park} />
        <Circle cx={195} cy={417} r={9} fill={m.water} />
        <Ellipse cx={44} cy={404} rx={14} ry={4} fill={m.shadow} />
        <Circle cx={44} cy={388} r={14} fill={m.tree} />
        <Circle cx={40} cy={383} r={6} fill={m.treeDot} />
        <Ellipse cx={120} cy={452} rx={12} ry={3.5} fill={m.shadow} />
        <Circle cx={120} cy={438} r={12} fill={m.tree} />
        <Ellipse cx={350} cy={400} rx={14} ry={4} fill={m.shadow} />
        <Circle cx={350} cy={384} r={14} fill={m.tree} />
        <Circle cx={346} cy={379} r={6} fill={m.treeDot} />
        <Ellipse cx={270} cy={452} rx={12} ry={3.5} fill={m.shadow} />
        <Circle cx={270} cy={438} r={12} fill={m.tree} />
        <Rect x={70} y={420} width={26} height={5} rx={2} fill={m.bench} />
        <Rect x={296} y={420} width={26} height={5} rx={2} fill={m.bench} />
        <Circle cx={40} cy={680} r={13} fill={m.tree} />
        <Circle cx={96} cy={700} r={10} fill={m.tree} />
        <Circle cx={120} cy={620} r={9} fill={m.tree} />
        {[160, 260, 462].map(y => (
          <G key={y}>
            <Rect x={207} y={y} width={2.5} height={26} fill={m.lampPost} />
            <Circle cx={208} cy={y - 1} r={3.5} fill={m.lamp} />
            {isDark ? <Circle cx={208} cy={y + 2} r={22} fill="url(#gdLamp)" /> : null}
          </G>
        ))}
      </Svg>
      <Twinkle size={7 * k} color={m.fountainTop} reduceMotion={reduceMotion} style={{ left: 191.5 * k, top: 410.5 * k }} />
      <Drift reduceMotion={reduceMotion} distance={200} duration={60000} style={{ position: 'absolute', top: 96 * k, left: 0 }}>
        <Svg width={80} height={30} viewBox="0 0 90 34">
          <Path d="M14 30 a12 12 0 0 1 4-22 a16 16 0 0 1 30-4 a13 13 0 0 1 24 8 a11 11 0 0 1 4 18 z" fill={m.cloud} />
        </Svg>
      </Drift>
      <Travel reduceMotion={reduceMotion} from={-50} to={W + 40} duration={20000} style={{ position: 'absolute', top: 112 * k, left: 0 }}>
        <Svg width={40} height={14} viewBox="0 0 40 14">
          <Path d="M2 6 q5 -5 10 0 q5 -5 10 0 M24 10 q4 -4 8 0 q4 -4 8 0" stroke={m.bird} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </Svg>
      </Travel>
      <Travel reduceMotion={reduceMotion} from={-40} to={W + 30} duration={12000} style={{ position: 'absolute', top: 307 * k, left: 0, zIndex: 2 }}>
        <Car color={m.car1} glass={m.carGlass} tyre={m.tyre} />
      </Travel>
      <Travel reduceMotion={reduceMotion} from={W + 30} to={-40} duration={15000} delay={3000} style={{ position: 'absolute', top: 507 * k, left: 0, zIndex: 2 }}>
        <Car color={m.car2} glass={m.carGlass} tyre={m.tyre} flip />
      </Travel>
      <Travel reduceMotion={reduceMotion} axis="y" from={130 * k} to={505 * k} duration={10000} delay={1000} style={{ position: 'absolute', left: 186 * k, top: 0, zIndex: 2 }}>
        <Svg width={18} height={24} viewBox="0 0 18 24">
          <Rect x={2} y={2} width={14} height={18} rx={5} fill={m.keke} />
          <Rect x={4} y={13} width={10} height={5} rx={1.5} fill={m.carGlass} />
          <Circle cx={9} cy={21} r={2.2} fill={m.tyre} />
        </Svg>
      </Travel>
      <Travel reduceMotion={reduceMotion} from={-12} to={W} duration={22000} style={{ position: 'absolute', top: 186 * k, left: 0 }}>
        <Person head={m.person1} body={m.person1b} />
      </Travel>
      <Travel reduceMotion={reduceMotion} from={W} to={-12} duration={26000} delay={5000} style={{ position: 'absolute', top: 516 * k, left: 0 }}>
        <Person head={m.person2} body={m.person2b} flip />
      </Travel>
      {spots.map((p, i) => {
        const tone = tones[i % tones.length];
        const stars = done[p.id];
        const isSel = selId === p.id;
        return (
          <PressScale key={p.id} onPress={() => onSpot(p)} accessibilityLabel={`${p.name}${stars != null ? ', done' : ''}`}>
            <View style={[styles.spot, { left: (p.x - 48) * k, top: (p.y - 76) * k }]}>
              <Sway reduceMotion={reduceMotion} deg={1.5} duration={4000} delay={i * 300}>
                {p.art === 'pharmacy' || p.art === 'school' ? (
                  <Blink reduceMotion={reduceMotion}>
                    <Building kind={p.art} wall={tone[0]} roof={tone[1]} door={tone[2]} m={m} t={t} size={76} />
                  </Blink>
                ) : (
                  <Building kind={p.art} wall={tone[0]} roof={tone[1]} door={tone[2]} m={m} t={t} size={76} />
                )}
              </Sway>
              <View style={[styles.chip, { backgroundColor: isSel ? t.pink : t.surface, borderColor: isSel ? t.pink : t.border }]}>
                <Text style={[styles.chipText, { color: isSel ? '#FFFFFF' : t.text }]}>{p.name}</Text>
              </View>
              {stars != null ? (
                <View style={[styles.done, { backgroundColor: t.surface, borderColor: t.border }]}>
                  {[0, 1, 2].map(n => (
                    <Svg key={n} width={9} height={9} viewBox="0 0 24 24">
                      <Path d={STAR_PATH} fill={n < stars ? t.gold : t.starOff} />
                    </Svg>
                  ))}
                </View>
              ) : null}
              {isSel ? (
                <Bob distance={4} duration={1600} reduceMotion={reduceMotion} style={styles.selPin}>
                  <Svg width={18} height={18} viewBox="0 0 24 24">
                    <Path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z" fill={t.pink} />
                    <Circle cx={12} cy={10} r={2.4} fill="#FFFFFF" />
                  </Svg>
                </Bob>
              ) : null}
            </View>
          </PressScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  spot: { position: 'absolute', width: 96, alignItems: 'center' },
  chip: { marginTop: -2, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  chipText: { fontSize: ds(9.5), fontWeight: '800' },
  done: { position: 'absolute', top: -4, right: 10, flexDirection: 'row', gap: 1, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 999, borderWidth: 1 },
  selPin: { position: 'absolute', top: -16, left: 39 },
  me: { width: 36, height: 36, borderRadius: 18, borderWidth: 2.5, overflow: 'hidden' },
  pin: { width: 0, height: 0, alignSelf: 'center', marginTop: -2, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
});
