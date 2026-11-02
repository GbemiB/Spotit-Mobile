import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, Ellipse, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../shared/styles/index.js';
import { Bob, Twinkle, Pop } from '../common/SpotlightFx.jsx';
import Character from './Character.jsx';
import { STAR_PATH } from './tokens.js';
import { ds, SlideIn, Pulse } from './motion.jsx';

const ART = { 'know-yourself': 'you', 'pad-bank-run': 'padbankGirl', 'give-day': 'mamaRonke' };

function Ways({ t, isDark, challenges, reduceMotion }) {
  const tiles = [t.pinkSoft, isDark ? 'rgba(214,162,78,0.18)' : '#FFE9DF', t.greenSoft];
  return (
    <View style={styles.row}>
      {challenges.slice(0, 3).map((c, i) => (
        <SlideIn key={c.id} reduceMotion={reduceMotion} delay={100 + i * 120} style={{ alignItems: 'center', gap: 6 }}>
          <Bob distance={4} duration={3200} delay={i * 500} reduceMotion={reduceMotion}>
            <View style={[styles.charTile, { backgroundColor: tiles[i % 3] }]}>
              <Character name={ART[c.id] || 'you'} size={70} style={{ marginBottom: -4 }} />
            </View>
          </Bob>
          <Text style={[styles.charName, { color: t.text }]}>{c.name}</Text>
        </SlideIn>
      ))}
    </View>
  );
}

function Free({ t, reduceMotion }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 346 188">
        <Ellipse cx={173} cy={168} rx={80} ry={10} fill={t.track} />
        <G>
          <Rect x={128} y={86} width={90} height={74} rx={10} fill={t.pink} />
          <Rect x={120} y={70} width={106} height={24} rx={8} fill={t.pinkInk} />
          <Rect x={166} y={70} width={14} height={90} fill={t.goldBar} />
          <Path d="M173 70c-10-22-34-16-26-2 4 6 18 4 26 2zM173 70c10-22 34-16 26-2-4 6-18 4-26 2z" fill={t.goldBar} />
        </G>
      </Svg>
      <Pop delay={500} reduceMotion={reduceMotion} style={{ position: 'absolute', left: '56.6%', top: '59.5%' }}>
        <View style={[styles.freeTag, { backgroundColor: t.green }]}>
          <Text style={styles.freeText}>FREE</Text>
        </View>
      </Pop>
      <Bob distance={4} duration={3200} reduceMotion={reduceMotion} style={{ position: 'absolute', left: '23.4%', top: '29%' }}>
        <Svg width={32} height={32} viewBox="0 0 32 32">
          <Circle cx={16} cy={16} r={15} fill={t.goldSoft} stroke={t.gold} strokeWidth={2.5} />
          <Path d="M16 8l2.2 4.6 5 .6-3.7 3.4 1 5-4.5-2.6-4.5 2.6 1-5-3.7-3.4 5-.6z" fill={t.gold} />
        </Svg>
      </Bob>
      <Twinkle size={18} color={t.spark} reduceMotion={reduceMotion} style={{ left: '73%', top: '24%' }} />
      <Twinkle size={14} color={t.spark} delay={1000} reduceMotion={reduceMotion} style={{ left: '19%', top: '62%' }} />
    </View>
  );
}

function Ladder({ t, ranks, reduceMotion }) {
  return (
    <View style={styles.ladder}>
      {ranks.map((r, i) => {
        const on = i === 0;
        return (
          <SlideIn key={r.id} reduceMotion={reduceMotion} delay={100 + i * 100} style={{ alignItems: 'center', gap: 5 }}>
            <Pulse reduceMotion={reduceMotion || !on} scale={1.08}>
              <View style={[styles.badge, { backgroundColor: on ? t.pink : t.surface, borderColor: on ? t.pink : t.goldBar }]}>
                <Svg width={18} height={18} viewBox="0 0 24 24">
                  <Path d={STAR_PATH} fill={on ? '#FFFFFF' : t.gold} />
                </Svg>
              </View>
            </Pulse>
            <View style={[styles.step, { height: 34 + i * 16, backgroundColor: on ? t.pinkSoft : t.goldSoft }]}>
              <Text style={[styles.stepName, { color: on ? t.pinkInk : t.goldInk }]}>{r.name}</Text>
              <Text style={[styles.stepNeed, { color: t.text3 }]}>{r.minStars ? `${r.minStars} stars` : 'start'}</Text>
            </View>
          </SlideIn>
        );
      })}
    </View>
  );
}

export default function GuideArtV2({ step, t, isDark, challenges, ranks, reduceMotion }) {
  return (
    <View style={[styles.box, { borderColor: t.border }]}>
      <LinearGradient colors={t.heroBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {step === 'ways' ? <Ways t={t} isDark={isDark} challenges={challenges} reduceMotion={reduceMotion} /> : null}
      {step === 'free' ? <Free t={t} reduceMotion={reduceMotion} /> : null}
      {step === 'stars' ? <Ladder t={t} ranks={ranks} reduceMotion={reduceMotion} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { height: 188, alignSelf: 'stretch', borderRadius: 24, borderWidth: 1, overflow: 'hidden', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 14 },
  charTile: { width: 72, height: 72, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  charName: { fontSize: ds(10), fontWeight: '800' },
  freeTag: { paddingHorizontal: 12, height: 26, borderRadius: 13, justifyContent: 'center' },
  freeText: { color: '#FFFFFF', fontSize: ds(12), fontWeight: '800' },
  ladder: { position: 'absolute', left: 0, right: 0, bottom: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 10 },
  badge: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  step: { width: 64, borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, alignItems: 'center', paddingTop: 6 },
  stepName: { fontSize: ds(9), fontWeight: '800' },
  stepNeed: { fontSize: ds(8.5), fontWeight: '600', marginTop: 1 },
});
