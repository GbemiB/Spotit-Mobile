import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
  const steps = guideSteps({ topicCount, lives: settings?.lives ?? 3, hintCost: settings?.hintCost ?? 5 });
  const step = steps[index];
  const last = index === steps.length - 1;
  return (
    <BottomSheet open={open} onClose={onDone}>
      <Pop reduceMotion={reduceMotion} trigger={step.key} style={{ alignItems: 'center' }}>
        <StepArt step={step.key} />
      </Pop>
      <Text style={[styles.kicker, { color: q.gold }]}>
        How Spotlight works · {index + 1} of {steps.length}
      </Text>
      <Text style={[styles.title, { color: c.textPrimary }]}>{step.title}</Text>
      <Text style={[styles.body, { color: c.textSecondary }]}>{step.body}</Text>
      <View style={styles.dots}>
        {steps.map((s, i) => (
          <View key={s.key} style={[styles.dot, { width: i === index ? 18 : 6, backgroundColor: i === index ? c.primary : c.border }]} />
        ))}
      </View>
      <GradientButton
        colors={q.button}
        reduceMotion={reduceMotion}
        onPress={() => (last ? onDone() : setIndex(index + 1))}
        label={<Text style={styles.btnTx}>{last ? 'Let’s go' : 'Next'}</Text>}
      />
      {last ? (
        <View style={styles.skip} />
      ) : (
        <PressScale onPress={onDone} accessibilityLabel="Skip">
          <View style={styles.skip}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: c.textMuted }}>Skip</Text>
          </View>
        </PressScale>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  badge: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badgeTx: { fontSize: 15, fontWeight: '800' },
  kicker: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginTop: 14 },
  title: { fontFamily: FONT.serif, fontSize: 26, lineHeight: 32, textAlign: 'center', marginTop: 6 },
  body: { fontSize: 11.5, lineHeight: 18, textAlign: 'center', marginTop: 8, minHeight: 36 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 18, marginBottom: 18 },
  dot: { height: 6, borderRadius: 3 },
  btnTx: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  skip: { height: 46, alignItems: 'center', justifyContent: 'center' },
});
