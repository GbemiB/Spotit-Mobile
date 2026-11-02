import { useEffect, useMemo, useState } from 'react';
import { Animated, PanResponder, Pressable, View, StyleSheet } from 'react-native';
import { useAnimatedValue } from '../../dashboard/HeroCardFx.jsx';
import BottomSheet from '../../../components/ui/BottomSheet.jsx';
import { useTheme, Text, FONT } from '../../../shared/styles/index.js';
import { PressScale, Icon } from '../common/SpotlightFx.jsx';
import GuideArtV2 from '../v2/GuideArtV2.jsx';
import { spotTokens } from '../v2/tokens.js';
import { ds } from '../v2/motion.jsx';

function listWords(names) {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function countWord(n) {
  return ['no', 'one', 'two', 'three', 'four', 'five'][n] || String(n);
}

export function guideSteps({ freeLevels, freeTries, games = [], ranks = [] }) {
  const ways = countWord(games.length + 1);
  const gameText = games.length ? `, and ${countWord(games.length)} pretend ${games.length === 1 ? 'game' : 'games'}: ${listWords(games)}` : '';
  const levels = freeLevels > 0 ? (freeLevels === 1 ? 'Level 1 of every quiz topic is free' : `Levels 1 to ${freeLevels} of every quiz topic are free`) : 'Every quiz level costs SP';
  const tries = freeTries > 0 ? `, and each game gives you ${countWord(freeTries)} free ${freeTries === 1 ? 'try' : 'tries'}` : '';
  const rankNames = ranks.map(r => r.name);
  const ladder = rankNames.length > 1 ? ` Collect them to grow from ${rankNames[0]} to ${listWords(rankNames.slice(1))}.` : '';
  return [
    { key: 'ways', title: `${ways.charAt(0).toUpperCase()}${ways.slice(1)} ${games.length ? 'ways' : 'way'} to play`, body: `A myth-or-fact quiz about your body${gameText}.` },
    { key: 'free', title: 'Free to start', body: `${levels}${tries}. After that, you use SpotPoints.` },
    { key: 'stars', title: 'Win stars, level up', body: `Every win earns stars.${ladder}` },
  ];
}

export function moveStep(index, delta, count) {
  return Math.max(0, Math.min(count - 1, index + delta));
}

export const SWIPE_SHARE = 0.25;
export const FLICK_SPEED = 0.5;
export const EDGE_PULL = 0.3;

export function dragOffset(index, dx, count) {
  const pastEdge = (index === 0 && dx > 0) || (index === count - 1 && dx < 0);
  return pastEdge ? dx * EDGE_PULL : dx;
}

export function releaseTarget(index, dx, vx, width, count) {
  const far = Math.abs(dx) > width * SWIPE_SHARE || (Math.abs(vx) > FLICK_SPEED && Math.abs(dx) > 20);
  return far ? moveStep(index, dx < 0 ? 1 : -1, count) : index;
}
const STEP_COUNT = 3;

const BACK = 'M15 5l-7 7 7 7';
const NEXT = 'M9 5l7 7-7 7';

function RoundButton({ t, label, icon, onPress, filled, faded, text }) {
  return (
    <PressScale onPress={onPress} accessibilityLabel={label} disabled={faded}>
      <View
        style={[
          styles.round,
          filled ? { backgroundColor: t.pink, paddingHorizontal: text ? 16 : 0, minWidth: 48 } : { borderWidth: 1.5, borderColor: t.border },
          faded && { opacity: 0.35 },
        ]}
      >
        {text ? <Text style={styles.btnTx}>{text}</Text> : null}
        <Icon d={icon} size={18} color={filled ? '#FFFFFF' : t.pinkInk} width={2.4} />
      </View>
    </PressScale>
  );
}

function makeSwipe(now, pos, setIndex) {
  const { index: at, width: w, reduceMotion: still } = now;
  const sideways = (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2;
  const finish = (_, g) => {
    const target = releaseTarget(at, g.dx, g.vx, w, STEP_COUNT);
    if (target !== at) {
      setIndex(target);
      return;
    }
    if (still) pos.setValue(-at * w);
    else Animated.spring(pos, { toValue: -at * w, speed: 16, bounciness: 6, useNativeDriver: true }).start();
  };
  return PanResponder.create({
    onMoveShouldSetPanResponderCapture: sideways,
    onMoveShouldSetPanResponder: sideways,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => pos.stopAnimation(),
    onPanResponderMove: (_, g) => {
      pos.setValue(-at * w + dragOffset(at, g.dx, STEP_COUNT));
    },
    onPanResponderRelease: finish,
    onPanResponderTerminate: finish,
  });
}

export default function GuideSheet({ open, settings, challenges = [], ranks = [], reduceMotion, onDone }) {
  const { isDark } = useTheme();
  const t = spotTokens(isDark);
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const pos = useAnimatedValue(0);
  const games = challenges.filter(c => c.kind !== 'quiz');
  const freeTries = games.length ? Math.min(...games.map(g => g.freePlaysLeft || 0)) : 0;
  const steps = guideSteps({ freeLevels: settings?.freeLevels, freeTries, games: games.map(g => g.name), ranks });
  const first = index === 0;
  const last = index === steps.length - 1;

  useEffect(() => {
    if (!width) return undefined;
    const to = -index * width;
    if (reduceMotion) {
      pos.setValue(to);
      return undefined;
    }
    const anim = Animated.spring(pos, { toValue: to, speed: 16, bounciness: 4, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [index, width, reduceMotion, pos]);

  function go(target) {
    setIndex(moveStep(target, 0, STEP_COUNT));
  }

  const swipe = useMemo(() => makeSwipe({ index, width, reduceMotion }, pos, setIndex), [index, width, reduceMotion, pos]);

  return (
    <BottomSheet open={open} onClose={onDone}>
      <View style={styles.skipRow}>
        <PressScale onPress={onDone} accessibilityLabel="Skip">
          <Text style={[styles.skip, { color: t.text3 }]}>Skip</Text>
        </PressScale>
      </View>
      <View style={styles.viewport} onLayout={e => setWidth(e.nativeEvent.layout.width)} {...swipe.panHandlers}>
        {width ? (
          <Animated.View style={{ flexDirection: 'row', width: width * steps.length, transform: [{ translateX: pos }] }}>
            {steps.map((step, i) => (
              <View
                key={step.key}
                style={{ width, alignItems: 'center' }}
                accessibilityElementsHidden={i !== index}
                importantForAccessibility={i === index ? 'auto' : 'no-hide-descendants'}
              >
                {open && Math.abs(i - index) <= 1 ? (
                  <GuideArtV2 step={step.key} t={t} isDark={isDark} challenges={challenges} ranks={ranks} reduceMotion={reduceMotion || i !== index} />
                ) : (
                  <View style={{ height: 188 }} />
                )}
                <Text style={[styles.title, { color: t.text }]}>{step.title}</Text>
                <Text style={[styles.body, { color: t.text2 }]}>{step.body}</Text>
              </View>
            ))}
          </Animated.View>
        ) : null}
      </View>
      <View style={styles.nav}>
        <RoundButton t={t} label="Back" icon={BACK} faded={first} onPress={() => go(index - 1)} />
        <View style={styles.dots}>
          {steps.map((step, i) => (
            <Pressable
              key={step.key}
              onPress={() => go(i)}
              style={styles.dotHit}
              accessibilityRole="button"
              accessibilityLabel={`Step ${i + 1} of ${steps.length}`}
              accessibilityState={{ selected: i === index }}
            >
              <View style={[styles.dot, { width: i === index ? 22 : 7, backgroundColor: i === index ? t.pink : t.track }]} />
            </Pressable>
          ))}
        </View>
        {last ? (
          <RoundButton t={t} filled label="Close the guide and start" icon={NEXT} text="Let’s play" onPress={onDone} />
        ) : (
          <RoundButton t={t} filled label="Next" icon={NEXT} onPress={() => go(index + 1)} />
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  viewport: { overflow: 'hidden', marginTop: 8 },
  title: { fontFamily: FONT.serif, fontSize: 26, lineHeight: 32, textAlign: 'center', marginTop: 14 },
  body: { fontSize: ds(12), lineHeight: 19, textAlign: 'center', marginTop: 6, minHeight: 38, paddingHorizontal: 4 },
  skipRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: -8 },
  skip: { fontSize: ds(12), fontWeight: '700', paddingVertical: 6, paddingHorizontal: 4 },
  nav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 10 },
  round: { height: 48, minWidth: 48, borderRadius: 24, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  dotHit: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  dot: { height: 7, borderRadius: 999 },
  btnTx: { color: '#FFFFFF', fontSize: ds(13), fontWeight: '800' },
});
