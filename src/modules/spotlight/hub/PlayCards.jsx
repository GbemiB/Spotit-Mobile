import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../shared/styles/index.js';
import { Bob, PressScale, Twinkle } from '../common/motion/effects.jsx';
import Character from '../common/characters/Character.jsx';
import { STAR_PATH } from '../common/style/tokens.js';
import { ds, Breathe, Sway, Drift, Blink, FlipCard, SlideIn, Pulse } from '../common/motion/motion.jsx';

function scenePalette(isDark) {
  return isDark
    ? {
        sky: ['#2A1E2A', '#3A2630'],
        quizSky: ['#2E1E26', '#3A2630'],
        giveSky: ['#1E2A26', '#23342C'],
        ground: '#2E2226',
        giveGround: '#2A3A31',
        cloud: 'rgba(255,255,255,0.10)',
        wall: '#4A3438',
        window: '#F7C98A',
        door: '#5E3E46',
        awning: '#F2A0AE',
        sun: '#F5EDE9',
        path: '#4A3A34',
        tree: '#3E6B55',
        glow: 'rgba(247,201,138,0.22)',
        counter: '#5E3E46',
      }
    : {
        sky: ['#FFE9DF', '#FFF6F0'],
        quizSky: ['#FFF0F2', '#FFE6EA'],
        giveSky: ['#EAF6EF', '#DCEFE2'],
        ground: '#F6DCD3',
        giveGround: '#CFE8D7',
        cloud: '#FFFFFF',
        wall: '#FFFFFF',
        window: '#FFF0F2',
        door: '#E8C3BC',
        awning: '#FFFFFF',
        sun: '#FBE3B0',
        path: '#F3DCC3',
        tree: '#A5D8BA',
        glow: '#FFFFFF',
        counter: '#E8C3BC',
      };
}

function Tile({ colors, size, children }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 18, overflow: 'hidden' }}>
      <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}

function QuizScene({ t, p, size, reduceMotion }) {
  const k = size / 84;
  return (
    <Tile colors={p.quizSky} size={size}>
      <Svg width={size} height={size} viewBox="0 0 84 84" style={StyleSheet.absoluteFill}>
        <Circle cx={58} cy={50} r={30} fill={p.glow} opacity={0.7} />
        <Rect x={0} y={72} width={84} height={12} fill={p.ground} />
      </Svg>
      <Bob distance={4} duration={3200} reduceMotion={reduceMotion} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Svg width={size} height={size} viewBox="0 0 84 84">
          <Circle cx={22} cy={20} r={11} fill={t.surface} />
          <Circle cx={33} cy={31} r={2.6} fill={t.surface} />
          <Circle cx={37} cy={36} r={1.6} fill={t.surface} />
          <Path
            d="M18.8 17.6a3.3 3.3 0 1 1 4.4 3.1c-.7.3-1.1.9-1.1 1.6v.7M22.1 26.3h.01"
            stroke={t.pinkInk}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </Bob>
      <Twinkle size={9 * k} color={t.spark} reduceMotion={reduceMotion} style={{ left: 39 * k, top: 10 * k }} />
      <Breathe reduceMotion={reduceMotion} style={{ position: 'absolute', right: -8 * k, bottom: -4 * k }}>
        <Character name="you" size={70 * k} asViewer />
      </Breathe>
      <FlipCard
        reduceMotion={reduceMotion}
        style={{ position: 'absolute', left: 6 * k, bottom: 8 * k, width: 38 * k, height: 26 * k }}
        front={
          <View style={[styles.flipFace, { backgroundColor: t.pink }]}>
            <Text style={styles.flipText}>MYTH</Text>
          </View>
        }
        back={
          <View style={[styles.flipFace, { backgroundColor: t.green }]}>
            <Text style={styles.flipText}>FACT</Text>
          </View>
        }
      />
    </Tile>
  );
}

function BankScene({ t, p, size, reduceMotion }) {
  const k = size / 84;
  return (
    <Tile colors={p.sky} size={size}>
      <Drift reduceMotion={reduceMotion} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Svg width={size} height={size} viewBox="0 0 84 84">
          <Path d="M8 14a5 5 0 0 1 9-3 6 6 0 0 1 11 2 4 4 0 0 1 0 8H10a4 4 0 0 1-2-7z" fill={p.cloud} />
        </Svg>
      </Drift>
      <Svg width={size} height={size} viewBox="0 0 84 84" style={StyleSheet.absoluteFill}>
        <Rect x={6} y={30} width={72} height={44} rx={4} fill={p.wall} />
        <Path d="M2 30h80l-4-10H6z" fill={t.pink} />
        <Path d="M2 30q6.7 6 13.3 0q6.7 6 13.3 0q6.7 6 13.3 0q6.7 6 13.3 0q6.7 6 13.3 0q6.7 6 13.3 0" fill={p.awning} />
        <Rect x={0} y={74} width={84} height={10} fill={p.ground} />
      </Svg>
      <Blink
        reduceMotion={reduceMotion}
        style={{
          position: 'absolute',
          left: 10 * k,
          top: 40 * k,
          width: 26 * k,
          height: 20 * k,
          borderRadius: 3 * k,
          backgroundColor: p.window,
        }}
      />
      <Bob
        distance={3}
        duration={3000}
        reduceMotion={reduceMotion}
        style={{ position: 'absolute', left: 13 * k, top: 47 * k, flexDirection: 'row', gap: 2 * k }}
      >
        <View style={{ width: 7 * k, height: 10 * k, borderRadius: 2 * k, backgroundColor: t.pink }} />
        <View style={{ width: 7 * k, height: 9 * k, marginTop: k, borderRadius: 2 * k, backgroundColor: t.green }} />
      </Bob>
      <Breathe reduceMotion={reduceMotion} style={{ position: 'absolute', right: -8 * k, bottom: 2 * k }}>
        <Character name="padbankGirl" size={64 * k} asViewer />
      </Breathe>
      <View
        style={{
          position: 'absolute',
          left: 4 * k,
          right: 4 * k,
          bottom: 6 * k,
          height: 10 * k,
          borderRadius: 3 * k,
          backgroundColor: p.counter,
        }}
      />
    </Tile>
  );
}

function GiveScene({ t, p, size, reduceMotion }) {
  const k = size / 84;
  return (
    <Tile colors={p.giveSky} size={size}>
      <Svg width={size} height={size} viewBox="0 0 84 84" style={StyleSheet.absoluteFill}>
        <Circle cx={70} cy={14} r={6} fill={p.sun} />
        <Path d="M0 60 Q42 50 84 60 V84 H0 Z" fill={p.giveGround} />
        <Path d="M30 84 Q38 70 46 62" stroke={p.path} strokeWidth={6} strokeLinecap="round" fill="none" />
        <Rect x={4} y={38} width={30} height={24} rx={3} fill={p.wall} />
        <Path d="M0 40 L19 26 L38 40 Z" fill={t.pink} />
        <Rect x={15} y={48} width={9} height={14} rx={2} fill={p.door} />
        <Rect x={7} y={44} width={6} height={6} rx={1} fill={p.window} />
        <Circle cx={8} cy={70} r={5} fill={p.tree} />
      </Svg>
      <Bob distance={4} duration={3200} delay={600} reduceMotion={reduceMotion} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Svg width={size} height={size} viewBox="0 0 84 84">
          <G>
            <Path d="M48 26c0 0-8-4.5-8-10a4.5 4.5 0 0 1 8-2.3 4.5 4.5 0 0 1 8 2.3c0 5.5-8 10-8 10z" fill={t.pink} />
            <Path d="M48 26 V34" stroke={t.pink} strokeWidth={2} />
          </G>
        </Svg>
      </Bob>
      <Sway reduceMotion={reduceMotion} deg={3} duration={3200} style={{ position: 'absolute', right: -6 * k, bottom: -2 * k }}>
        <Character name="mamaRonke" size={62 * k} asViewer />
      </Sway>
    </Tile>
  );
}

const SCENES = { 'know-yourself': QuizScene, 'pad-bank-run': BankScene, 'give-day': GiveScene };

export function priceFor(c, freeLevels, isNew) {
  if (c.kind === 'quiz' || c.cost == null) {
    return { label: freeLevels > 0 ? `Levels 1–${freeLevels} free` : 'Play', after: '', free: true };
  }
  if (c.freeUpTo > 0) {
    return { label: c.freeUpTo === 1 ? 'Level 1 free' : `Levels 1–${c.freeUpTo} free`, after: '', free: true };
  }
  if (!c.cost) return { label: 'Free to play', after: '', free: true };
  if (c.freePlaysLeft > 0) {
    if (isNew || c.plays === 0) return { label: 'Free try waiting', after: `then ${c.cost} SP`, free: true };
    return { label: `${c.freePlaysLeft} free ${c.freePlaysLeft === 1 ? 'try' : 'tries'} · then ${c.cost} SP`, after: '', free: false };
  }
  return { label: `${c.costFrom ? 'from ' : ''}${c.cost} SP`, after: '', free: false };
}

function PlayCard({ t, isDark, challenge, index, isNew, freeLevels, hot, reduceMotion, onOpen }) {
  const p = scenePalette(isDark);
  const Scene = SCENES[challenge.id] || QuizScene;
  const size = isNew ? 76 : 84;
  const price = priceFor(challenge, freeLevels, isNew);
  const tag = isNew ? (challenge.kind === 'quiz' ? 'START HERE' : null) : challenge.kind !== 'quiz' && challenge.plays === 0 ? 'NEW' : null;
  const stars = Math.min(3, challenge.stars || 0);
  return (
    <SlideIn reduceMotion={reduceMotion} delay={240 + index * 90} distance={22}>
      <PressScale onPress={() => onOpen(challenge)} accessibilityLabel={`${challenge.name}. ${challenge.blurb || ''}. ${price.label}`}>
        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border, shadowColor: t.cardShadow }]}>
          <View>
            <Scene t={t} p={p} size={size} reduceMotion={reduceMotion} />
            {tag ? (
              <View style={[styles.tag, { backgroundColor: isNew ? t.pink : t.surface }]}>
                <Text style={[styles.tagText, { color: isNew ? '#FFFFFF' : t.greenInk }]}>{tag}</Text>
              </View>
            ) : null}
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.name, { color: t.text }]}>{challenge.name}</Text>
            {challenge.blurb ? <Text style={[styles.sub, { color: t.text2 }]}>{challenge.blurb}</Text> : null}
            <View style={styles.metaRow}>
              <View style={[styles.chip, { backgroundColor: price.free ? t.greenSoft : t.goldSoft }]}>
                <Text style={[styles.chipText, { color: price.free ? t.greenInk : t.goldInk }]}>{price.label}</Text>
              </View>
              {isNew ? (
                price.after ? (
                  <Text style={[styles.after, { color: t.text3 }]}>{price.after}</Text>
                ) : null
              ) : (
                <View style={{ flexDirection: 'row', gap: 1 }} accessibilityLabel={`${stars} of 3 stars`}>
                  {[0, 1, 2].map(i => (
                    <Svg key={i} width={12} height={12} viewBox="0 0 24 24">
                      <Path d={STAR_PATH} fill={i < stars ? t.gold : t.starOff} />
                    </Svg>
                  ))}
                </View>
              )}
            </View>
          </View>
          <Pulse reduceMotion={reduceMotion || !hot} scale={1.08}>
            <View style={[styles.go, { backgroundColor: hot ? t.pink : t.pinkSoft }]}>
              <Svg width={13} height={13} viewBox="0 0 24 24">
                <Path d="M8 5v14l11-7z" fill={hot ? '#FFFFFF' : t.pinkInk} />
              </Svg>
            </View>
          </Pulse>
        </View>
      </PressScale>
    </SlideIn>
  );
}

export default function PlayCards({ t, isDark, challenges, isNew, freeLevels, reduceMotion, onOpen }) {
  const hotId = isNew ? challenges.find(c => c.kind === 'quiz')?.id : challenges.find(c => c.kind !== 'quiz' && c.freePlaysLeft > 0)?.id;
  return (
    <View style={{ marginHorizontal: 20, gap: 10 }}>
      {challenges.map((c, i) => (
        <PlayCard
          key={c.id}
          t={t}
          isDark={isDark}
          challenge={c}
          index={i}
          isNew={isNew}
          freeLevels={freeLevels}
          hot={c.id === hotId}
          reduceMotion={reduceMotion}
          onOpen={onOpen}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 8,
    paddingRight: 12,
    borderRadius: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 18,
  },
  flipFace: { flex: 1, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  flipText: { color: '#FFFFFF', fontSize: ds(8.5), fontWeight: '800', letterSpacing: 0.6 },
  tag: { position: 'absolute', left: 5, top: 5, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  tagText: { fontSize: ds(8), fontWeight: '800', letterSpacing: 0.4 },
  name: { fontSize: ds(14), lineHeight: 19, fontWeight: '500' },
  sub: { fontSize: ds(11), lineHeight: 16, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 9, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  chipText: { fontSize: ds(10), fontWeight: '800' },
  after: { fontSize: ds(10), fontWeight: '600' },
  go: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
