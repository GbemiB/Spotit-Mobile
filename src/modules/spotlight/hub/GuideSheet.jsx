import { useEffect, useMemo, useState } from 'react';
import { Animated, PanResponder, Pressable, View, StyleSheet } from 'react-native';
import { useAnimatedValue } from '../../dashboard/HeroCardFx.jsx';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet from '../../../components/ui/BottomSheet.jsx';
import { useTheme, Text, FONT } from '../../../shared/styles/index.js';
import { GradientButton, PressScale, Icon } from '../common/SpotlightFx.jsx';
import { quizColors } from '../common/theme.js';
import GuideArt from './GuideArt.jsx';
import { freeLevelsText } from '../common/wording.js';

export function guideSteps({ topicCount, lives, hintCost, freeLevels }) {
  return [
    {
      key: 'topics',
      title: 'Pick a topic',
      body: topicCount
        ? `Choose from ${topicCount} topics, from your cycle to skin, sleep and more.`
        : 'Choose a topic you’re curious about, from your cycle to skin, sleep and more.',
    },
    {
      key: 'levels',
      title: 'Free to start',
      body: `${freeLevelsText(freeLevels)} Higher levels cost SP to unlock.`,
    },
    {
      key: 'play',
      title: 'Hearts, hints and stars',
      body: `You start with ${lives === 1 ? '1 heart' : `${lives} hearts`}. A hint costs ${hintCost} SP. Finish with hearts left to win stars.`,
    },
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
const STEP_COUNT = guideSteps({}).length;

const BACK = 'M15 5l-7 7 7 7';
const NEXT = 'M9 5l7 7-7 7';

function RoundButton({ label, icon, onPress, filled }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  return (
    <PressScale onPress={onPress} accessibilityLabel={label}>
      {filled ? (
        <LinearGradient colors={q.button} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.round}>
          <Icon d={icon} size={20} color="#FFFFFF" width={2.4} />
        </LinearGradient>
      ) : (
        <View style={[styles.round, { borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface }]}>
          <Icon d={icon} size={20} color={c.primaryDark} width={2.4} />
        </View>
      )}
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

export default function GuideSheet({ open, topicCount, settings, reduceMotion, onDone }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const pos = useAnimatedValue(0);
  const steps = guideSteps({ topicCount, lives: settings?.lives, hintCost: settings?.hintCost, freeLevels: settings?.freeLevels });
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
        {last ? null : (
          <PressScale onPress={onDone} accessibilityLabel="Skip">
            <Text style={[styles.skip, { color: c.textMuted }]}>Skip</Text>
          </PressScale>
        )}
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
                <GuideArt step={step.key} active={open && i === index} reduceMotion={reduceMotion} freeLevels={settings?.freeLevels} />
                <Text style={[styles.kicker, { color: c.primaryDark }]}>
                  How Spotlight works · {i + 1} of {steps.length}
                </Text>
                <Text style={[styles.title, { color: c.textPrimary }]}>{step.title}</Text>
                <Text style={[styles.body, { color: c.textSecondary }]}>{step.body}</Text>
              </View>
            ))}
          </Animated.View>
        ) : null}
      </View>
      <View style={styles.nav}>
        <View style={[styles.side, { alignItems: 'flex-start' }]}>
          {first ? null : <RoundButton label="Back" icon={BACK} onPress={() => go(index - 1)} />}
        </View>
        <View style={styles.dots}>
          {steps.map((step, i) => (
            <Pressable
              key={step.key}
              onPress={() => go(i)}
              hitSlop={{ top: 14, bottom: 14, left: 4, right: 4 }}
              accessibilityRole="button"
              accessibilityLabel={`Step ${i + 1} of ${steps.length}`}
              accessibilityState={{ selected: i === index }}
            >
              <View style={[styles.dot, { width: i === index ? 18 : 6, backgroundColor: i === index ? c.primary : c.border }]} />
            </Pressable>
          ))}
        </View>
        <View style={[styles.side, { alignItems: 'flex-end' }]}>
          {last ? (
            <GradientButton
              small
              colors={q.button}
              reduceMotion={reduceMotion}
              onPress={onDone}
              label={<Text style={styles.btnTx}>Let’s go</Text>}
            />
          ) : (
            <RoundButton filled label="Next" icon={NEXT} onPress={() => go(index + 1)} />
          )}
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  viewport: { overflow: 'hidden' },
  kicker: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginTop: 14 },
  title: { fontFamily: FONT.serif, fontSize: 26, lineHeight: 32, textAlign: 'center', marginTop: 6 },
  body: { fontSize: 11.5, lineHeight: 18, textAlign: 'center', marginTop: 8, minHeight: 36 },
  skipRow: { height: 28, flexDirection: 'row', justifyContent: 'flex-end', marginTop: -6 },
  skip: { fontSize: 12, fontWeight: '600', paddingVertical: 6, paddingHorizontal: 4 },
  nav: { flexDirection: 'row', alignItems: 'center', marginTop: 22, marginBottom: 10 },
  side: { width: 104 },
  round: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  dots: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  dot: { height: 6, borderRadius: 3 },
  btnTx: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
