import { Modal, View, ScrollView, Animated, Easing, StyleSheet } from 'react-native';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme, Text, FONT } from '../../shared/styles/index.js';
import LivingBackground from '../../components/ui/LivingBackground.jsx';
import { useAnimatedValue } from '../dashboard/HeroCardFx.jsx';
import { GradientButton, PressScale, Icon, Pop, Rise, Flicker, Blob, Twinkle, HEART, STAR, FLAME, SPARKLE } from './SpotlightFx.jsx';
import { quizColors } from './quizTheme.js';
import { initialPlay, playReducer, starsFor, resultTitle, feedbackTitle } from './quizLogic.js';
import { HINT_COST, START_LIVES } from './sampleQuiz.js';

const BURST = Array.from({ length: 14 }, (_, i) => ({
  angle: (i / 14) * Math.PI * 2,
  dist: 70 + (i % 3) * 22,
  size: 6 + (i % 3) * 2,
  color: ['#F2A0AE', '#E2B86A', '#DC5A74', '#9CC5A8'][i % 4],
  round: i % 2 === 0,
}));

function buzz(kind) {
  const type = kind === 'right' ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error;
  Haptics.notificationAsync(type).catch(() => {});
}

function Burst({ reduceMotion }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [v, reduceMotion]);
  if (reduceMotion) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {BURST.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '45%',
            width: p.size,
            height: p.round ? p.size : p.size * 1.8,
            borderRadius: p.round ? p.size : 2,
            backgroundColor: p.color,
            opacity: v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(p.angle) * p.dist] }) },
              { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(p.angle) * p.dist + 30] }) },
              { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${i * 40}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

function Heart({ alive, justLost, color, faded, reduceMotion }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (!justLost || reduceMotion) return undefined;
    v.setValue(0);
    const anim = Animated.timing(v, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [justLost, v, reduceMotion]);
  return (
    <View style={{ width: 18, height: 18 }}>
      <Icon d={HEART} size={18} color={alive ? color : faded} fill />
      {justLost && !reduceMotion && (
        <Animated.View
          style={{
            position: 'absolute',
            opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            transform: [
              { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) },
              { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
            ],
          }}
        >
          <Icon d={HEART} size={18} color={color} fill />
        </Animated.View>
      )}
    </View>
  );
}

function FloatTag({ text, color, trigger, reduceMotion }) {
  const v = useAnimatedValue(1);
  useEffect(() => {
    if (!trigger || reduceMotion) return undefined;
    v.setValue(0);
    const anim = Animated.timing(v, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [trigger, v, reduceMotion]);
  return (
    <Animated.Text
      pointerEvents="none"
      style={{
        position: 'absolute',
        right: 0,
        top: 34,
        fontFamily: FONT.extraBold,
        fontSize: 12,
        color,
        opacity: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -26] }) }],
      }}
    >
      {text}
    </Animated.Text>
  );
}

const COUNT_LABELS = ['3', '2', '1', 'Go!'];

function Countdown({ onDone, reduceMotion, color }) {
  const v = useAnimatedValue(0);
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduceMotion) {
      onDone();
      return undefined;
    }
    v.setValue(0);
    const anim = Animated.timing(v, { toValue: 1, duration: 650, easing: Easing.out(Easing.back(2)), useNativeDriver: true });
    anim.start(({ finished }) => {
      if (!finished) return;
      if (step >= COUNT_LABELS.length - 1) onDone();
      else setStep(step + 1);
    });
    return () => anim.stop();
  }, [step, reduceMotion, v, onDone]);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.Text
        style={{
          fontFamily: FONT.serif,
          fontSize: 96,
          color,
          opacity: v.interpolate({ inputRange: [0, 0.3, 0.85, 1], outputRange: [0, 1, 1, 0.2] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.1] }) }],
        }}
      >
        {COUNT_LABELS[step]}
      </Animated.Text>
    </View>
  );
}

function StatementCard({ question, state, reduceMotion }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  const enter = useAnimatedValue(reduceMotion ? 1 : 0);
  const shake = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    enter.setValue(0);
    const anim = Animated.spring(enter, { toValue: 1, speed: 12, bounciness: 8, useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [state.round, enter, reduceMotion]);
  useEffect(() => {
    if (state.phase !== 'feedback' || state.right || reduceMotion) return;
    shake.setValue(0);
    Animated.sequence(
      [1, -1, 0.7, -0.7, 0.3, 0].map(toValue => Animated.timing(shake, { toValue, duration: 60, useNativeDriver: true })),
    ).start();
  }, [state.phase, state.right, shake, reduceMotion]);
  const feedback = state.phase === 'feedback';
  const border = feedback ? (state.right ? q.green : q.gold) : c.border;
  const tagColor = question.answer === 'myth' ? q.goldDeep : c.primaryDark;
  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [
          { translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-12, 12] }) },
          { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
          { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
        ],
      }}
    >
      <View style={[styles.statement, { backgroundColor: c.surface, borderColor: border, borderWidth: feedback ? 2.5 : 1.5 }]}>
        <Blob size={150} color={q.blobA} reduceMotion={reduceMotion} style={{ top: -60, right: -50 }} />
        <Blob size={130} color={q.blobB} delay={1500} reduceMotion={reduceMotion} style={{ bottom: -60, left: -40 }} />
        {feedback && (
          <Pop reduceMotion={reduceMotion} style={{ alignSelf: 'center', marginBottom: 10 }}>
            <Text style={[styles.answerTag, { color: tagColor, backgroundColor: question.answer === 'myth' ? q.goldSoft : c.primarySoft }]}>
              {question.answer === 'myth' ? 'MYTH' : 'FACT'}
            </Text>
          </Pop>
        )}
        <Text style={[styles.statementTx, { color: c.textPrimary }]}>{question.statement}</Text>
        {state.hinted && !feedback && (
          <Pop reduceMotion={reduceMotion} style={[styles.hintBox, { backgroundColor: q.goldSoft }]}>
            <Icon d={SPARKLE} size={14} color={q.gold} fill />
            <Text style={{ flex: 1, fontSize: 11, lineHeight: 16, color: c.textSecondary }}>{question.hint}</Text>
          </Pop>
        )}
        {feedback && state.right && <Burst key={state.round} reduceMotion={reduceMotion} />}
      </View>
    </Animated.View>
  );
}

function ChoiceButton({ label, colors, onPress, disabled, dim, reduceMotion }) {
  return (
    <View style={{ flex: 1, opacity: dim ? 0.45 : 1 }}>
      <GradientButton
        colors={colors}
        reduceMotion={reduceMotion}
        onPress={onPress}
        disabled={disabled}
        style={{ width: '100%' }}
        label={<Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 }}>{label}</Text>}
      />
    </View>
  );
}

function Feedback({ state, question, isLast, reduceMotion, onNext }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  return (
    <Rise reduceMotion={reduceMotion} style={[styles.panel, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={[styles.fbTitle, { color: state.right ? q.green : c.textPrimary }]}>{feedbackTitle(state.right, state.streak)}</Text>
        {state.right && state.streak >= 2 && (
          <Flicker reduceMotion={reduceMotion}>
            <Icon d={FLAME} size={20} color={q.peach} fill />
          </Flicker>
        )}
      </View>
      {!state.right && (
        <Text style={{ fontSize: 11, fontWeight: '600', color: c.primaryDark, marginTop: 2 }}>You lost a heart · {state.lives} left</Text>
      )}
      <Text style={[styles.explain, { color: c.textSecondary }]}>{question.explain}</Text>
      <View style={[styles.dyk, { backgroundColor: q.goldSoft }]}>
        <Text style={{ fontSize: 9, fontWeight: '800', letterSpacing: 1, color: q.goldDeep }}>DID YOU KNOW?</Text>
        <Text style={{ fontSize: 11, lineHeight: 16, color: c.textSecondary, marginTop: 3 }}>{question.fact}</Text>
      </View>
      <GradientButton
        colors={q.button}
        reduceMotion={reduceMotion}
        onPress={onNext}
        label={<Text style={styles.btnTx}>{state.lives <= 0 ? 'See how you did' : isLast ? 'See my result' : 'Next round'}</Text>}
      />
    </Rise>
  );
}

function Result({ state, level, topic, reduceMotion, onReplay, onNextLevel, onClose }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  const cleared = state.phase === 'cleared';
  const stars = starsFor(state);
  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 10, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
      <View style={{ width: 200, height: 120, alignItems: 'center', justifyContent: 'center' }}>
        <Twinkle size={16} color={q.gold} reduceMotion={reduceMotion} style={{ left: 10, top: 10 }} />
        <Twinkle size={12} color={c.primary} delay={700} reduceMotion={reduceMotion} style={{ right: 16, top: 24 }} />
        <Twinkle size={10} color={q.gold} delay={1400} reduceMotion={reduceMotion} style={{ right: 40, bottom: 4 }} />
        {cleared ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
            {[1, 2, 3].map(i => (
              <Pop key={i} delay={300 + i * 260} reduceMotion={reduceMotion} style={{ marginBottom: i === 2 ? 18 : 0 }}>
                <Icon d={STAR} size={i === 2 ? 64 : 48} color={i <= stars ? q.gold : c.border} fill />
              </Pop>
            ))}
          </View>
        ) : (
          <Pop reduceMotion={reduceMotion}>
            <View style={[styles.outBadge, { backgroundColor: q.goldSoft }]}>
              <Icon d={HEART} size={40} color={q.gold} fill />
            </View>
          </Pop>
        )}
      </View>
      <Rise index={2} reduceMotion={reduceMotion} style={{ alignItems: 'center' }}>
        <Text style={[styles.kicker, { color: q.gold }]}>
          {topic.name} · Level {level.n}
        </Text>
        <Text style={[styles.resultTitle, { color: c.textPrimary }]}>{cleared ? resultTitle(stars) : 'Out of hearts'}</Text>
        <Text style={[styles.explain, { color: c.textSecondary, textAlign: 'center' }]}>
          {cleared ? `You cleared ${level.name}.` : 'Every round teaches you something. Have another go when you are ready.'}
        </Text>
      </Rise>
      <Rise index={3} reduceMotion={reduceMotion} style={[styles.scoreRow, { borderColor: c.border, backgroundColor: c.surface }]}>
        {[
          { v: `${state.correct}/${state.total}`, l: 'right' },
          { v: state.best, l: 'best streak' },
          { v: state.lives, l: 'hearts left' },
        ].map(x => (
          <View key={x.l} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: c.textPrimary }}>{x.v}</Text>
            <Text style={{ fontSize: 9.5, color: c.textMuted }}>{x.l}</Text>
          </View>
        ))}
      </Rise>
      {cleared && level.n < 10 && (
        <Rise index={4} reduceMotion={reduceMotion}>
          <Text style={[styles.unlocked, { color: q.green, backgroundColor: q.greenSoft }]}>Level {level.n + 1} is now open</Text>
        </Rise>
      )}
      <Rise index={5} reduceMotion={reduceMotion} style={{ width: '100%', gap: 4, marginTop: 18 }}>
        {cleared && level.n < 10 ? (
          <GradientButton
            colors={q.button}
            reduceMotion={reduceMotion}
            onPress={onNextLevel}
            label={<Text style={styles.btnTx}>Play level {level.n + 1}</Text>}
          />
        ) : (
          <GradientButton
            colors={q.button}
            reduceMotion={reduceMotion}
            onPress={onReplay}
            label={<Text style={styles.btnTx}>Play again</Text>}
          />
        )}
        {cleared && stars < 3 && (
          <PressScale onPress={onReplay} accessibilityLabel="Go for 3 stars">
            <View style={[styles.secondary, { borderColor: c.border, backgroundColor: c.surface }]}>
              <Text style={{ fontSize: 12.5, fontWeight: '700', color: c.primaryDark }}>Go for 3 stars</Text>
            </View>
          </PressScale>
        )}
        <PressScale onPress={onClose} accessibilityLabel="Back to Spotlight">
          <View style={{ height: 46, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: c.textMuted }}>Back to Spotlight</Text>
          </View>
        </PressScale>
      </Rise>
    </ScrollView>
  );
}

export default function QuizPlay({ open, topic, level, questions, balance, reduceMotion, onClose, onFinish, onNextLevel, onHint }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  const insets = useSafeAreaInsets();
  const [state, dispatch] = useReducer(playReducer, questions, initialPlay);
  const reported = useRef(false);
  useEffect(() => {
    if (open) {
      dispatch({ type: 'restart' });
      reported.current = false;
    }
  }, [open, level?.n, topic?.id]);
  const justLost = state.phase === 'feedback' && !state.right ? state.lives : -1;
  useEffect(() => {
    if (state.phase === 'intro') reported.current = false;
    if (state.phase === 'feedback') buzz(state.right ? 'right' : 'wrong');
    if ((state.phase === 'cleared' || state.phase === 'out') && !reported.current) {
      reported.current = true;
      onFinish({ cleared: state.phase === 'cleared', stars: starsFor(state) });
    }
  }, [state.phase]);
  const go = useCallback(() => dispatch({ type: 'go' }), []);
  const question = questions[state.round];
  const playing = state.phase === 'question' || state.phase === 'feedback';
  const done = state.phase === 'cleared' || state.phase === 'out';
  const s = useMemo(() => createStyles(c), [c]);
  if (!topic || !level) return null;
  const spLeft = balance;
  const takeHint = () => {
    if (state.hinted || spLeft < HINT_COST) return;
    dispatch({ type: 'hint' });
    onHint(HINT_COST);
  };
  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[s.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
        <LivingBackground />
        <View style={s.topBar}>
          <PressScale onPress={onClose} accessibilityLabel="Close quiz">
            <View style={[s.close, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Icon d="M6 6l12 12M18 6L6 18" size={16} color={c.textPrimary} width={2.2} />
            </View>
          </PressScale>
          <View style={s.segments}>
            {Array.from({ length: state.total }, (_, i) => {
              const filled = i < state.round || (i === state.round && (state.phase === 'feedback' || done));
              return <View key={i} style={[s.segment, { backgroundColor: filled ? c.primary : c.border }]} />;
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: 3 }} accessibilityLabel={`${state.lives} hearts left`}>
            {Array.from({ length: START_LIVES }, (_, i) => (
              <Heart
                key={i}
                alive={i < state.lives}
                justLost={i === justLost}
                color={c.primary}
                faded={c.border}
                reduceMotion={reduceMotion}
              />
            ))}
          </View>
        </View>
        <View style={s.subBar}>
          <Text style={s.round}>{playing ? `Round ${state.round + 1} of ${state.total}` : `${topic.name} · Level ${level.n}`}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {state.streak >= 2 && playing && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Flicker reduceMotion={reduceMotion}>
                  <Icon d={FLAME} size={14} color={q.peach} fill />
                </Flicker>
                <Text style={{ fontSize: 11, fontWeight: '800', color: q.peach }}>{state.streak}</Text>
              </View>
            )}
            <Text style={{ fontSize: 11, fontWeight: '700', color: c.textSecondary }}>{spLeft} SP</Text>
          </View>
          <FloatTag text={`−${HINT_COST} SP`} color={q.gold} trigger={state.hintsSpent} reduceMotion={reduceMotion} />
        </View>

        {state.phase === 'intro' && (
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
            <Rise reduceMotion={reduceMotion} style={[s.introCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Blob size={160} color={q.blobA} reduceMotion={reduceMotion} style={{ top: -60, right: -50 }} />
              <Blob size={140} color={q.blobB} delay={1500} reduceMotion={reduceMotion} style={{ bottom: -60, left: -40 }} />
              <Pop delay={200} reduceMotion={reduceMotion} style={[s.levelBadge, { backgroundColor: c.primarySoft }]}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: c.primaryDark }}>{level.n}</Text>
              </Pop>
              <Text style={[styles.kicker, { color: q.gold }]}>{topic.name}</Text>
              <Text style={[styles.resultTitle, { color: c.textPrimary }]}>{level.name}</Text>
              <View style={s.introStats}>
                <Text style={s.introStat}>{state.total} rounds</Text>
                <Text style={s.dot}>·</Text>
                <Text style={s.introStat}>{START_LIVES} hearts</Text>
                <Text style={s.dot}>·</Text>
                <Text style={s.introStat}>up to 3 stars</Text>
              </View>
            </Rise>
            <View style={{ height: 20 }} />
            <GradientButton
              colors={q.button}
              reduceMotion={reduceMotion}
              onPress={() => dispatch({ type: 'start' })}
              label={<Text style={styles.btnTx}>I’m ready</Text>}
            />
          </View>
        )}

        {state.phase === 'countdown' && <Countdown color={c.primary} reduceMotion={reduceMotion} onDone={go} />}

        {playing && question && (
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 12, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={s.prompt}>Myth or fact?</Text>
            <StatementCard question={question} state={state} reduceMotion={reduceMotion} />
            {state.phase === 'question' ? (
              <View style={{ marginTop: 'auto', paddingTop: 22 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <ChoiceButton
                    label="MYTH"
                    colors={q.goldButton}
                    reduceMotion={reduceMotion}
                    onPress={() => dispatch({ type: 'answer', choice: 'myth', answer: question.answer })}
                  />
                  <ChoiceButton
                    label="FACT"
                    colors={q.button}
                    reduceMotion={reduceMotion}
                    onPress={() => dispatch({ type: 'answer', choice: 'fact', answer: question.answer })}
                  />
                </View>
                <PressScale onPress={takeHint} disabled={state.hinted || spLeft < HINT_COST} accessibilityLabel={`Hint for ${HINT_COST} SP`}>
                  <View style={[s.hintBtn, { opacity: state.hinted || spLeft < HINT_COST ? 0.45 : 1 }]}>
                    <Icon d={SPARKLE} size={14} color={q.gold} fill />
                    <Text style={{ fontSize: 11.5, fontWeight: '700', color: c.textSecondary }}>
                      {state.hinted ? 'Hint used' : `Hint · ${HINT_COST} SP`}
                    </Text>
                  </View>
                </PressScale>
              </View>
            ) : (
              <View style={{ marginTop: 16 }}>
                <Feedback
                  state={state}
                  question={question}
                  isLast={state.round + 1 >= state.total}
                  reduceMotion={reduceMotion}
                  onNext={() => dispatch({ type: 'next' })}
                />
              </View>
            )}
          </ScrollView>
        )}

        {done && (
          <Result
            state={state}
            level={level}
            topic={topic}
            reduceMotion={reduceMotion}
            onReplay={() => dispatch({ type: 'restart' })}
            onNextLevel={onNextLevel}
            onClose={onClose}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  statement: { borderRadius: 28, padding: 24, minHeight: 200, justifyContent: 'center', overflow: 'hidden' },
  statementTx: { fontFamily: FONT.serif, fontSize: 26, lineHeight: 34, textAlign: 'center' },
  answerTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    overflow: 'hidden',
  },
  hintBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, marginTop: 16 },
  panel: { borderRadius: 24, borderWidth: 1.5, padding: 18, gap: 4 },
  fbTitle: { fontFamily: FONT.serif, fontSize: 26, lineHeight: 32 },
  explain: { fontSize: 11.5, lineHeight: 18, marginTop: 6 },
  dyk: { borderRadius: 14, padding: 12, marginTop: 10, marginBottom: 14 },
  btnTx: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  kicker: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginTop: 14 },
  resultTitle: { fontFamily: FONT.serif, fontSize: 30, lineHeight: 36, textAlign: 'center', marginTop: 4 },
  outBadge: { width: 88, height: 88, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  scoreRow: { flexDirection: 'row', width: '100%', borderWidth: 1.5, borderRadius: 20, paddingVertical: 14, marginTop: 18 },
  unlocked: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    overflow: 'hidden',
    marginTop: 14,
  },
  secondary: { height: 50, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
});

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20 },
    close: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    segments: { flex: 1, flexDirection: 'row', gap: 4 },
    segment: { flex: 1, height: 6, borderRadius: 99 },
    subBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginTop: 14 },
    round: { fontSize: 11, fontWeight: '700', color: c.textMuted },
    prompt: {
      fontSize: 9,
      fontWeight: '700',
      color: c.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      textAlign: 'center',
      marginBottom: 10,
    },
    introCard: { borderRadius: 28, borderWidth: 1.5, padding: 24, alignItems: 'center', overflow: 'hidden' },
    levelBadge: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    introStats: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    introStat: { fontSize: 11, color: c.textSecondary, fontWeight: '600' },
    dot: { fontSize: 11, color: c.textMuted },
    hintBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 46, marginTop: 8 },
  });
}
