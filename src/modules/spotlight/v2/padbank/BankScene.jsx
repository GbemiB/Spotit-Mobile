import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect, LinearGradient as SvgGradient, Stop, Path, Circle, G } from 'react-native-svg';
import { Text } from '../../../../shared/styles/index.js';
import { Bob } from '../../common/SpotlightFx.jsx';
import Character from '../Character.jsx';
import { HEART_PATH } from '../tokens.js';
import { ds, Sway, Travel, Blink, WaveOnce } from '../motion.jsx';

export const PACK_ART = { pink: ['#F2A0AE', '#DC5A74'], peach: ['#F7D49A', '#D6A24E'], rose: ['#E8708A', '#C04E68'], green: ['#A5D8BA', '#4E9E78'] };

export function packArt(color) {
  return PACK_ART[color] || PACK_ART.pink;
}

export function sceneColors(isDark) {
  return isDark
    ? { wall: '#2A2023', wallStripe: '#2E2327', frame: '#4A3438', sky1: '#1E1624', sky2: '#3A2630', street: '#2A2226', shopOut: '#3A2C30', shopOut2: '#4A3438', awn2: '#E2647C', winOut: '#F7C98A', ink: '#C7B8BD', floor: '#221A1D', shelf: '#7A5446', shelfDark: '#5E3E36', plant: '#4E9E78', pot: '#C28A33', sign: '#2A2023', signBorder: '#5E3E46', walker1: '#7A6C71', walker1b: '#5E3E46', walker2: '#7A6C71', walker2b: '#3E6B55', counterTop: '#8A604E', counterFront: '#5E3E36', counterLine: '#4A3028', shutter1: '#3A2C30', shutter2: '#2A2023' }
    : { wall: '#FFF3EE', wallStripe: '#FDEBE4', frame: '#E8C3BC', sky1: '#FFE3D4', sky2: '#FFF3EC', street: '#F3E6DE', shopOut: '#FFFFFF', shopOut2: '#FFF6EE', awn2: '#F2A0AE', winOut: '#FFF0F2', ink: '#6E6066', floor: '#F6E4DA', shelf: '#D9B08A', shelfDark: '#B98B66', plant: '#8FCBA9', pot: '#E2B86A', sign: '#FFFFFF', signBorder: '#F2D0D8', walker1: '#C7A592', walker1b: '#F2A0AE', walker2: '#8D5A3B', walker2b: '#8FCBA9', counterTop: '#E9C9A9', counterFront: '#DDB592', counterLine: '#CFA27C', shutter1: '#F2E6E1', shutter2: '#E3D2CB' };
}

function Bag({ fill, top, size = 26 }) {
  return (
    <Svg width={size} height={size * 1.15} viewBox="0 0 60 64">
      <Path d="M10 16 h40 l4 42 a4 4 0 0 1 -4 4 h-40 a4 4 0 0 1 -4 -4z" fill={fill} />
      <Path d="M10 16 h40 l-4 -10 h-32z" fill={top} />
      <Rect x={12} y={30} width={36} height={14} rx={4} fill="#FFFFFF" opacity={0.9} />
    </Svg>
  );
}

export function PackBag(props) {
  return <Bag {...props} />;
}

function Walker({ color, body, dress }) {
  return (
    <Svg width={18} height={44} viewBox="0 0 18 44">
      <Circle cx={9} cy={7} r={6} fill={color} />
      {dress ? <Path d="M3 14h12l2 22H1z" fill={body} /> : <Rect x={3} y={14} width={12} height={18} rx={6} fill={body} />}
      <Rect x={4.5} y={32} width={3} height={10} rx={1.5} fill={color} />
      <Rect x={10.5} y={32} width={3} height={10} rx={1.5} fill={color} />
    </Svg>
  );
}

export default function BankScene({ t, isDark, k, packs, stock, queue, peek, peekLook, ringKey, reduceMotion }) {
  const s = sceneColors(isDark);
  const W = 390 * k;
  const H = 470 * k;
  const bags = [];
  packs.forEach((p, i) => {
    const art = packArt(p.color);
    const row = i < 2 ? 0 : 1;
    const col = i % 2;
    for (let n = 0; n < p.stock; n += 1) {
      bags.push({ key: `${p.id}-${n}`, left: (26 + col * 120 + n * 24) * k, top: (row ? 200 : 120) * k, fill: art[0], top2: art[1], gone: (stock[p.id] ?? p.stock) <= n });
    }
  });
  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, overflow: 'hidden' }} pointerEvents="none">
      <Svg width={W} height={H} viewBox="0 0 390 470">
        <Defs>
          <Pattern id="pbWall" width={22} height={22} patternUnits="userSpaceOnUse">
            <Rect width={22} height={22} fill={s.wall} />
            <Rect width={11} height={22} fill={s.wallStripe} />
          </Pattern>
          <SvgGradient id="pbStreet" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={s.sky1} />
            <Stop offset="1" stopColor={s.sky2} />
          </SvgGradient>
        </Defs>
        <Rect x={0} y={0} width={390} height={470} fill="url(#pbWall)" />
        <Rect x={276} y={112} width={100} height={276} rx={8} fill={s.frame} />
        <Rect x={284} y={120} width={84} height={268} rx={5} fill="url(#pbStreet)" />
        <Rect x={284} y={300} width={84} height={88} fill={s.street} />
        <Rect x={296} y={160} width={30} height={60} rx={3} fill={s.shopOut} />
        <Path d="M292 164h38l-4-10h-30z" fill={s.awn2} />
        <Rect x={336} y={140} width={28} height={80} rx={3} fill={s.shopOut2} />
        {isDark ? <Circle cx={356} cy={132} r={6} fill="#F5EDE9" /> : null}
        <G transform="translate(298 318)">
          <Circle cx={8} cy={36} r={7} fill={s.ink} />
          <Circle cx={40} cy={36} r={7} fill={s.ink} />
          <Path d="M8 36h18l8-14h8l2 14" stroke={t.pink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Rect x={0} y={14} width={20} height={16} rx={3} fill={t.gold} />
        </G>
        <Rect x={0} y={388} width={390} height={82} fill={s.floor} />
        <Rect x={14} y={148} width={250} height={8} rx={3} fill={s.shelf} />
        <Rect x={14} y={228} width={250} height={8} rx={3} fill={s.shelf} />
        <Rect x={18} y={156} width={6} height={12} fill={s.shelfDark} />
        <Rect x={254} y={156} width={6} height={12} fill={s.shelfDark} />
        <Rect x={18} y={236} width={6} height={12} fill={s.shelfDark} />
        <Rect x={254} y={236} width={6} height={12} fill={s.shelfDark} />
        <Rect x={22} y={138} width={16} height={12} rx={3} fill={s.pot} />
        <Rect x={243} y={218} width={14} height={12} rx={3} fill={s.pot} />
      </Svg>
      <Blink reduceMotion={reduceMotion} style={{ position: 'absolute', left: 302 * k, top: 176 * k, width: 18 * k, height: 16 * k, borderRadius: 3 * k, backgroundColor: s.winOut }} />
      <Blink reduceMotion={reduceMotion} delay={1200} style={{ position: 'absolute', left: 342 * k, top: 152 * k, width: 16 * k, height: 14 * k, borderRadius: 3 * k, backgroundColor: s.winOut }} />
      <Sway reduceMotion={reduceMotion} deg={4} style={{ position: 'absolute', left: 18 * k, top: 118 * k }}>
        <Svg width={40 * k} height={32 * k} viewBox="18 118 40 32">
          <Path d="M30 148c-10-6-14-18-8-26 6 6 9 15 8 26zM30 148c6-10 16-14 24-10-4 8-13 12-24 10z" fill={s.plant} />
        </Svg>
      </Sway>
      <Sway reduceMotion={reduceMotion} deg={4} delay={1400} style={{ position: 'absolute', left: 242 * k, top: 202 * k }}>
        <Svg width={30 * k} height={28 * k} viewBox="242 202 30 28">
          <Path d="M250 228c-8-6-10-16-5-22 5 5 7 13 5 22zM250 228c5-8 13-11 19-8-3 6-10 9-19 8z" fill={s.plant} />
        </Svg>
      </Sway>
      <View style={{ position: 'absolute', left: 284 * k, top: 250 * k, width: 84 * k, height: 60 * k, overflow: 'hidden' }}>
        <Travel reduceMotion={reduceMotion} from={-40 * k} to={130 * k} duration={11000} style={{ position: 'absolute', left: 0, bottom: 0 }}>
          <Walker color={s.walker1} body={s.walker1b} />
        </Travel>
        <Travel reduceMotion={reduceMotion} from={130 * k} to={-40 * k} duration={14000} delay={4000} style={{ position: 'absolute', left: 0, bottom: 0 }}>
          <Walker color={s.walker2} body={s.walker2b} dress />
        </Travel>
      </View>
      {bags.map(b => (
        <View key={b.key} style={{ position: 'absolute', left: b.left, top: b.top, opacity: b.gone ? 0.12 : 1 }}>
          <Bag fill={b.fill} top={b.top2} size={26 * k} />
        </View>
      ))}
      <Sway reduceMotion={reduceMotion} deg={3} duration={3600} style={{ position: 'absolute', left: 92 * k, top: 100 * k, alignItems: 'center' }}>
        <Svg width={96 * k} height={14 * k} viewBox="0 0 96 14">
          <Path d="M20 0v14M76 0v14" stroke={s.shelfDark} strokeWidth={1.5} />
        </Svg>
        <View style={[styles.sign, { backgroundColor: s.sign, borderColor: s.signBorder }]}>
          <Svg width={10} height={10} viewBox="0 0 24 24">
            <Path d={HEART_PATH} fill={t.pink} />
          </Svg>
          <Text style={[styles.signText, { color: t.pinkInk }]}>PAD BANK</Text>
        </View>
      </Sway>
      {queue.length ? (
        <View style={{ position: 'absolute', right: 22 * k, top: 336 * k, alignItems: 'flex-end', gap: 3 }}>
          <View style={{ flexDirection: 'row' }}>
            {queue.map((look, i) => (
              <Bob key={`${look}-${i}`} distance={3} duration={2800} delay={i * 400} reduceMotion={reduceMotion}>
                <View style={[styles.face, { marginLeft: i ? -8 : 0, backgroundColor: t.surface, borderColor: t.surface }]}>
                  <Character name={look} size={34} style={{ marginBottom: -3 }} />
                </View>
              </Bob>
            ))}
          </View>
          <View style={[styles.queueTag, { backgroundColor: t.surface }]}>
            <Text style={[styles.queueText, { color: t.text2 }]}>{queue.length} more waiting</Text>
          </View>
        </View>
      ) : null}
      {peek ? (
        <Travel reduceMotion={reduceMotion} from={0} to={-10} duration={2600} style={{ position: 'absolute', left: 330 * k, top: 236 * k, width: 70 * k, height: 80 * k, overflow: 'hidden' }}>
          <Character name={peekLook} size={80 * k} />
        </Travel>
      ) : null}
      <View style={{ position: 'absolute', left: 0, right: 0, top: 372 * k, height: 16 * k, backgroundColor: s.counterTop, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
      <View style={{ position: 'absolute', left: 0, right: 0, top: 388 * k, height: 82 * k, backgroundColor: s.counterFront }}>
        <Svg width={W} height={82 * k} viewBox="0 0 390 82">
          <Path d="M0 30h390M0 62h390" stroke={s.counterLine} strokeWidth={1.5} />
          <Path d="M97 0v82M195 0v82M292 0v82" stroke={s.counterLine} strokeWidth={1.5} opacity={0.6} />
        </Svg>
      </View>
      <Bell key={ringKey} t={t} s={s} k={k} reduceMotion={reduceMotion} />
    </View>
  );
}

function Bell({ t, s, k, reduceMotion }) {
  return (
    <WaveOnce reduceMotion={reduceMotion} delay={900} style={{ position: 'absolute', left: 338 * k, top: 352 * k }}>
      <Svg width={30 * k} height={24 * k} viewBox="0 0 30 24">
        <Path d="M5 20a10 10 0 0 1 20 0z" fill={t.gold} />
        <Rect x={2} y={19} width={26} height={4} rx={2} fill={s.shelfDark} />
        <Circle cx={15} cy={8} r={2.5} fill={t.gold} />
      </Svg>
    </WaveOnce>
  );
}

const styles = StyleSheet.create({
  sign: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1.5 },
  signText: { fontSize: ds(10), fontWeight: '800', letterSpacing: 1.2 },
  face: { width: 30, height: 30, borderRadius: 15, overflow: 'hidden', borderWidth: 2, alignItems: 'center', justifyContent: 'flex-end' },
  queueTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  queueText: { fontSize: ds(9), fontWeight: '800' },
});
