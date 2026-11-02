import { useEffect, useState } from 'react';
import { Animated, Easing, PanResponder, Pressable, View, StyleSheet } from 'react-native';
import { useAnimatedValue } from '../dashboard/HeroCardFx.jsx';
import { LinearGradient } from 'expo-linear-gradient';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
import { useTheme, Text, FONT } from '../../shared/styles/index.js';
import { GradientButton, PressScale, Icon, Pop, HEART, SPARKLE, STAR } from './SpotlightFx.jsx';
import { GROUP_ICONS, quizColors } from './quizTheme.js';

export function guideSteps({ topicCount, lives, hintCost }) {
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
      body: 'Levels 1 to 3 of every topic are free. Higher levels cost SP to unlock.',
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

export const SWIPE_MIN = 40;
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

function StepArt({ step }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  if (step === 'topics') {
    return (
      <View style={[styles.badge, { backgroundColor: c.primarySoft }]}>
        <Icon d={GROUP_ICONS.body} size={28} color={c.primary} />
      </View>
    );
  }
  if (step === 'levels') {
    return (
      <View style={[styles.badge, { backgroundColor: q.greenSoft }]}>
        <Text style={[styles.badgeTx, { color: q.green }]}>1·2·3</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, { backgroundColor: q.goldSoft, flexDirection: 'row', gap: 3 }]}>
      <Icon d={HEART} size={18} color={c.primary} fill />
      <Icon d={SPARKLE} size={18} color={q.gold} fill />
      <Icon d={STAR} size={18} color={q.gold} fill />
    </View>
  );
}

export default function GuideSheet({ open, topicCount, settings, reduceMotion, onDone }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const slide = useAnimatedValue(1);
  const steps = guideSteps({ topicCount, lives: settings?.lives ?? 3, hintCost: settings?.hintCost ?? 5 });
  const step = steps[index];
  const first = index === 0;
  const last = index === steps.length - 1;

  function go(target) {
    if (target === index) return;
    setDir(target > index ? 1 : -1);
    setIndex(moveStep(target, 0, STEP_COUNT));
  }

  useEffect(() => {
    if (reduceMotion) {
      slide.setValue(1);
      return undefined;
    }
    slide.setValue(0);
    const anim = Animated.timing(slide, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [index, reduceMotion, slide]);

  const [swipe] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderRelease: (_, g) => {
        if (Math.abs(g.dx) < SWIPE_MIN) return;
        const delta = g.dx < 0 ? 1 : -1;
        setDir(delta);
        setIndex(i => moveStep(i, delta, STEP_COUNT));
      },
    }),
  );

  const moving = {
    opacity: slide,
    transform: [{ translateX: slide.interpolate({ inputRange: [0, 1], outputRange: [dir * 28, 0] }) }],
  };

  return (
    <BottomSheet open={open} onClose={onDone}>
      <View style={styles.skipRow}>
        {last ? null : (
          <PressScale onPress={onDone} accessibilityLabel="Skip">
            <Text style={[styles.skip, { color: c.textMuted }]}>Skip</Text>
          </PressScale>
        )}
      </View>
      <View {...swipe.panHandlers}>
        <Animated.View style={moving}>
          <Pop reduceMotion={reduceMotion} trigger={step.key} style={{ alignItems: 'center' }}>
            <StepArt step={step.key} />
          </Pop>
          <Text style={[styles.kicker, { color: q.gold }]}>
            How Spotlight works · {index + 1} of {steps.length}
          </Text>
          <Text style={[styles.title, { color: c.textPrimary }]}>{step.title}</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>{step.body}</Text>
        </Animated.View>
      </View>
      <View style={styles.nav}>
        <View style={[styles.side, { alignItems: 'flex-start' }]}>
          {first ? null : <RoundButton label="Back" icon={BACK} onPress={() => go(index - 1)} />}
        </View>
        <View style={styles.dots}>
          {steps.map((s, i) => (
            <Pressable
              key={s.key}
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
  badge: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badgeTx: { fontSize: 15, fontWeight: '800' },
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
