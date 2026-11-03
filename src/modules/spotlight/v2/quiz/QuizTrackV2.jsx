import { View, ScrollView, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text, FONT } from '../../../../shared/styles/index.js';
import { PressScale } from '../../common/SpotlightFx.jsx';
import BottomSheet from '../../../../components/ui/BottomSheet.jsx';
import { toneOf } from '../tokens.js';
import { ds, SlideIn, Pulse } from '../motion.jsx';
import { CircleButton, AnimIcon, Glow, PinkButton } from '../ui.jsx';
import { topicIcon, BACK, LOCK, CLOSE } from './quizArt.js';

const STEP = 110;
const LEFT = 0;
const RIGHT = 150;

function pathFor(count) {
  const pts = Array.from({ length: count }, (_, i) => [(i % 2 ? RIGHT : LEFT) + 31, 10 + i * STEP + 31]);
  return pts.reduce((d, [x, y], i) => {
    if (!i) return `M${x} ${y}`;
    const [px, py] = pts[i - 1];
    return `${d} C${px + (x > px ? 90 : -90)} ${py + 10}, ${x + (x > px ? -90 : 90)} ${y - 10}, ${x} ${y}`;
  }, '');
}

export function levelLook(level, settings) {
  const cleared = level.state === 'cleared';
  const open = cleared || level.state === 'current';
  const lives = level.lives || settings?.lives || 3;
  return {
    cleared,
    open,
    locked: !open,
    lives,
    price: cleared ? `${'★'.repeat(Math.max(0, level.stars || 0))} won`.trim() : level.cost ? `${level.cost} SP` : 'Free',
    paid: !cleared && level.cost > 0,
  };
}

export default function QuizTrackV2({ t, insets, topic, group, tone, levels, settings, reduceMotion, onBack, onPlayLevel }) {
  const icon = topicIcon(topic.icon);
  const [bg, ink] = toneOf(t, tone);
  const height = 10 + levels.length * STEP + 30;
  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Glow t={t} />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <CircleButton t={t} icon={BACK} label="Back to topics" onPress={onBack} />
          <View style={[styles.iconTile, { backgroundColor: bg }]}>
            <AnimIcon d={icon[0]} kind={icon[1]} color={ink} reduceMotion={reduceMotion} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.kicker, { color: ink }]}>{group}</Text>
            <Text style={[styles.title, { color: t.text }]}>{topic.name}</Text>
          </View>
        </View>
        <View style={{ marginHorizontal: 26, marginTop: 22, height }}>
          <Svg width={338} height={height} style={StyleSheet.absoluteFill}>
            <Path d={pathFor(levels.length)} stroke={t.track} strokeWidth={10} fill="none" strokeLinecap="round" />
            <Path
              d={pathFor(levels.length)}
              stroke={t.pink}
              strokeWidth={3}
              strokeDasharray="2 10"
              strokeLinecap="round"
              fill="none"
              opacity={0.6}
            />
          </Svg>
          {levels.map((level, i) => {
            const look = levelLook(level, settings);
            const isNext = level.state === 'current';
            return (
              <SlideIn
                key={level.n}
                reduceMotion={reduceMotion}
                delay={100 + i * 80}
                style={{ position: 'absolute', left: i % 2 ? RIGHT : LEFT, top: 10 + i * STEP }}
              >
                <PressScale onPress={() => onPlayLevel(level)} accessibilityLabel={`Level ${level.n}, ${level.name}, ${look.price}`}>
                  <View style={styles.levelRow}>
                    <Pulse reduceMotion={reduceMotion || !isNext} scale={1.06} duration={2000}>
                      <View
                        style={[
                          styles.node,
                          {
                            backgroundColor: look.cleared ? t.pink : look.locked ? t.surface : t.pinkSoft,
                            borderColor: look.locked ? t.border : t.pink,
                          },
                        ]}
                      >
                        {look.locked ? (
                          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Path d={LOCK} stroke={t.text3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                        ) : (
                          <Text style={[styles.nodeNum, { color: look.cleared ? '#FFFFFF' : t.pinkInk }]}>{level.n}</Text>
                        )}
                      </View>
                    </Pulse>
                    <View style={[styles.bubble, { backgroundColor: t.surface, borderColor: t.border, shadowColor: t.cardShadow }]}>
                      <Text style={[styles.levelName, { color: t.text }]}>{level.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <View style={[styles.price, { backgroundColor: look.paid ? t.goldSoft : t.greenSoft }]}>
                          <Text style={[styles.priceText, { color: look.paid ? t.goldInk : t.greenInk }]}>{look.price}</Text>
                        </View>
                        <Text style={[styles.hearts, { color: t.text3 }]}>{look.lives === 1 ? '1 heart' : `${look.lives} hearts`}</Text>
                      </View>
                    </View>
                  </View>
                </PressScale>
              </SlideIn>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export function LevelSheetV2({ t, open, level, topic, balance, settings, reduceMotion, onClose, onStart }) {
  if (!level || !topic) return <BottomSheet open={false} onClose={onClose} />;
  const look = levelLook(level, settings);
  const cost = level.cost || 0;
  const afford = balance >= cost;
  const blocked = look.locked || (cost > 0 && !afford);
  const facts = [
    { value: settings?.rounds ?? '', label: 'rounds', bg: t.pinkSoft, ink: t.pinkInk },
    { value: look.lives, label: look.lives === 1 ? 'heart' : 'hearts', bg: t.pinkSoft, ink: t.pinkInk },
    {
      value: cost ? cost : 'Free',
      label: cost ? 'SP to play' : 'to play',
      bg: cost ? t.goldSoft : t.greenSoft,
      ink: cost ? t.goldInk : t.greenInk,
    },
  ];
  const note = look.locked
    ? `Win level ${level.n - 1} first to open this one.`
    : cost && !afford
      ? `You need ${cost - balance} more SP. Check in daily to earn more.`
      : `Answer myth or fact. A hint costs ${settings?.hintCost ?? ''} SP. Finish with hearts left to win stars.`;
  const label = look.locked
    ? 'Locked for now'
    : cost
      ? afford
        ? `${look.cleared ? 'Play again' : 'Play'} for ${cost} SP`
        : 'Not enough SP'
      : look.cleared
        ? 'Play again'
        : 'Play free';
  return (
    <BottomSheet open={open} onClose={onClose}>
      <View style={styles.sheetHead}>
        <View style={[styles.sheetBadge, { backgroundColor: t.pinkSoft, borderColor: t.pink }]}>
          <Text style={[styles.sheetNum, { color: t.pinkInk }]}>{level.n}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.kicker, { color: t.pinkInk }]}>{topic.name}</Text>
          <Text style={[styles.sheetTitle, { color: t.text }]}>{level.name}</Text>
        </View>
        <CircleButton t={t} icon={CLOSE} size={38} iconSize={14} color={t.text2} label="Close" onPress={onClose} />
      </View>
      <View style={styles.facts}>
        {facts.map(f => (
          <View key={f.label} style={[styles.fact, { backgroundColor: f.bg }]}>
            <Text style={[styles.factValue, { color: f.ink }]}>{f.value}</Text>
            <Text style={[styles.factLabel, { color: t.text2 }]}>{f.label}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.note, { color: t.text2 }]}>{note}</Text>
      <PinkButton
        t={t}
        label={label}
        disabled={blocked}
        reduceMotion={reduceMotion}
        onPress={onStart}
        style={{ marginTop: 14, marginBottom: 10 }}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  iconTile: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  kicker: { fontSize: ds(9.5), fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontFamily: FONT.serif, fontSize: 22, lineHeight: 25 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  node: { width: 62, height: 62, borderRadius: 31, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  nodeNum: { fontFamily: FONT.serif, fontSize: 26 },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 190,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 18,
  },
  levelName: { fontSize: ds(12), fontWeight: '700' },
  price: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  priceText: { fontSize: ds(9.5), fontWeight: '800' },
  hearts: { fontSize: ds(9.5), fontWeight: '600' },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sheetBadge: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  sheetNum: { fontFamily: FONT.serif, fontSize: 26 },
  sheetTitle: { fontFamily: FONT.serif, fontSize: 22, lineHeight: 26 },
  facts: { flexDirection: 'row', gap: 8, marginTop: 16 },
  fact: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 16, alignItems: 'center' },
  factValue: { fontFamily: FONT.serif, fontSize: 22, lineHeight: 24 },
  factLabel: { fontSize: ds(9.5), fontWeight: '700', marginTop: 3 },
  note: { fontSize: ds(12), lineHeight: 18, textAlign: 'center', marginTop: 12 },
});
