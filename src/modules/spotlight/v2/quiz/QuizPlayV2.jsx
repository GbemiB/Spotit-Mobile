import { Modal, View, ScrollView, StyleSheet } from 'react-native';
import { useEffect, useReducer, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Text, FONT } from '../../../../shared/styles/index.js';
import { PressScale, Pop } from '../../common/SpotlightFx.jsx';
import { initialPlay, playReducer, resultTitle, friendlyError } from '../../quiz/quizLogic.js';
import Character from '../Character.jsx';
import { ds, SlideIn, Breathe } from '../motion.jsx';
import { Confetti, StarRow, HeartIcon, Shake } from '../fx.jsx';
import { CircleButton, Glow, PinkButton, GhostButton } from '../ui.jsx';
import { CLOSE, HINT, MYTH_ICON, FACT_ICON } from './quizArt.js';

function buzz(right) {
  const type = right ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error;
  Haptics.notificationAsync(type).catch(() => {});
}

function titleFor(settings, cleared, stars) {
  const titles = settings?.titles;
  if (!cleared) return titles?.lost || 'Out of hearts';
  if (stars >= 3) return titles?.perfect || resultTitle(stars);
  return titles?.won || resultTitle(stars);
}

function Choice({ t, label, icon, soft, border, ink, onPress, disabled }) {
  return (
    <PressScale onPress={onPress} disabled={disabled} accessibilityLabel={label} style={{ flex: 1 }}>
      <View style={[styles.choice, { backgroundColor: soft, borderColor: border, opacity: disabled ? 0.6 : 1 }]}>
        <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
          <Path d={icon} stroke={ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={[styles.choiceText, { color: ink }]}>{label}</Text>
      </View>
    </PressScale>
  );
}

function Result({ t, state, level, topic, hasNext, settings, balance, reduceMotion, onReplay, onNextLevel, onClose }) {
  const cleared = state.phase === 'cleared';
  const stars = cleared ? state.stars : 0;
  const answered = (state.results || []).length;
  const right = (state.results || []).filter(Boolean).length;
  const stats = [
    { value: `${right}/${cleared ? state.total : answered}`, label: 'right', ink: t.greenInk },
    { value: stars, label: stars === 1 ? 'star' : 'stars', ink: t.goldInk },
    { value: balance, label: 'SP left', ink: t.pinkInk },
  ];
  const primary = cleared ? (hasNext ? 'Next level' : 'Back to levels') : 'Try again';
  const onPrimary = cleared ? (hasNext ? onNextLevel : onClose) : onReplay;
  return (
    <View style={{ flex: 1 }}>
      {cleared && stars >= 3 ? <Confetti colors={[t.pink, t.gold, t.green, t.pinkInk, t.goldSoft]} reduceMotion={reduceMotion} /> : null}
      <View style={{ alignItems: 'center', paddingTop: 40, paddingHorizontal: 24 }}>
        <Pop reduceMotion={reduceMotion}>
          <Breathe reduceMotion={reduceMotion}>
            <Character name={cleared ? 'youHappy' : 'you'} size={150} />
          </Breathe>
        </Pop>
        <View style={{ marginTop: 4 }}>
          <StarRow t={t} count={stars} reduceMotion={reduceMotion} />
        </View>
        <SlideIn reduceMotion={reduceMotion} delay={500}>
          <Text style={[styles.resultTitle, { color: t.text }]}>{titleFor(settings, cleared, stars)}</Text>
        </SlideIn>
        <SlideIn reduceMotion={reduceMotion} delay={600}>
          <Text style={[styles.resultSub, { color: t.text2 }]}>
            {level.name} · {topic.name}
          </Text>
        </SlideIn>
      </View>
      <View style={styles.statRow}>
        {stats.map((s, i) => (
          <SlideIn key={s.label} reduceMotion={reduceMotion} delay={700 + i * 80} style={[styles.stat, { backgroundColor: t.surface, borderColor: t.border }]}>
            <Text style={[styles.statValue, { color: s.ink }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: t.text2 }]}>{s.label}</Text>
          </SlideIn>
        ))}
      </View>
      <View style={{ marginTop: 'auto', paddingHorizontal: 18, gap: 8 }}>
        <PinkButton t={t} label={primary} reduceMotion={reduceMotion} onPress={onPrimary} />
        <GhostButton t={t} label="Back to levels" onPress={onClose} />
      </View>
    </View>
  );
}

export default function QuizPlayV2({ t, open, topic, level, hasNext, settings, balance, api, reduceMotion, onClose, onFinish, onNextLevel }) {
  const insets = useSafeAreaInsets();
  const [state, dispatch] = useReducer(playReducer, undefined, initialPlay);
  const reported = useRef(false);
  const started = useRef(false);

  useEffect(() => {
    if (open) {
      dispatch({ type: 'restart' });
      reported.current = false;
      started.current = false;
    }
  }, [open, level?.n, topic?.id]);

  useEffect(() => {
    if (!open || !api || state.phase !== 'intro' || started.current) return;
    started.current = true;
    dispatch({ type: 'loading' });
    api
      .start()
      .then(attempt => dispatch({ type: 'started', attempt }))
      .catch(e => dispatch({ type: 'failed', message: friendlyError(e) }));
  }, [open, api, state.phase]);

  useEffect(() => {
    if (state.phase === 'countdown') dispatch({ type: 'go' });
    if (state.phase === 'feedback') buzz(state.feedback?.right);
    if ((state.phase === 'cleared' || state.phase === 'out') && !reported.current) {
      reported.current = true;
      onFinish({ cleared: state.phase === 'cleared', stars: state.stars, nextLevel: state.nextLevel });
    }
  }, [state.phase, state.feedback, state.stars, state.nextLevel, onFinish]);

  if (!topic || !level) return null;
  const hintCost = state.hintCost ?? settings?.hintCost;
  const lives = state.startLives || level.lives || settings?.lives || 3;
  const rounds = state.total || settings?.rounds || 5;
  const round = state.attempt?.rounds?.[state.round];
  const answered = state.phase === 'feedback';
  const right = state.feedback?.right;
  const done = state.phase === 'cleared' || state.phase === 'out';
  const canHint = !state.hinted && !state.busy && balance >= hintCost;
  const results = state.results || [];
  const isLast = state.round + 1 >= state.total || state.lives <= 0;

  function choose(choice) {
    if (state.busy || !state.attempt) return;
    dispatch({ type: 'loading' });
    api
      .answer(state.attempt.attemptId, state.round, choice)
      .then(result => dispatch({ type: 'answered', result }))
      .catch(e => dispatch({ type: 'failed', message: friendlyError(e) }));
  }
  function takeHint() {
    if (!canHint) return;
    dispatch({ type: 'loading' });
    api
      .hint(state.attempt.attemptId, state.round)
      .then(res => dispatch({ type: 'hinted', hint: res.hint || 'No hint for this one, sorry!' }))
      .catch(e => dispatch({ type: 'failed', message: friendlyError(e) }));
  }
  function retryStart() {
    started.current = false;
    dispatch({ type: 'restart' });
  }

  const answerWord = state.feedback?.answer === 'myth' ? 'It’s a myth' : 'It’s a fact';
  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.screen, { backgroundColor: t.bg, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 18 }]}>
        <Glow t={t} />
        {done ? (
          <Result
            t={t}
            state={state}
            level={level}
            topic={topic}
            hasNext={hasNext}
            settings={settings}
            balance={balance}
            reduceMotion={reduceMotion}
            onReplay={retryStart}
            onNextLevel={onNextLevel}
            onClose={onClose}
          />
        ) : (
          <View style={{ flex: 1 }}>
            <View style={styles.top}>
              <CircleButton t={t} icon={CLOSE} iconSize={16} color={t.text2} label="Stop playing" onPress={onClose} />
              <View style={styles.bars}>
                {Array.from({ length: rounds }, (_, i) => (
                  <View
                    key={i}
                    style={[styles.bar, { backgroundColor: i < results.length ? (results[i] ? t.green : t.red) : i === state.round ? t.pink : t.track }]}
                  />
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel={`${state.attempt ? state.lives : lives} hearts left`}>
                {Array.from({ length: lives }, (_, i) => (
                  <HeartIcon key={i} t={t} alive={i < (state.attempt ? state.lives : lives)} lost={answered && !right && i === state.lives} reduceMotion={reduceMotion} />
                ))}
              </View>
            </View>
            <View style={styles.sub}>
              <Text style={[styles.round, { color: t.pinkInk }]}>{state.attempt ? `Round ${state.round + 1} of ${state.total}` : 'Getting ready…'}</Text>
              <Text style={[styles.level, { color: t.text3 }]}>
                Level {level.n} · {level.name}
              </Text>
            </View>

            {round ? (
              <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 }} showsVerticalScrollIndicator={false}>
                <SlideIn key={state.round} reduceMotion={reduceMotion} distance={24}>
                  <Shake trigger={answered && !right ? state.round + 1 : 0} reduceMotion={reduceMotion}>
                    <View style={[styles.card, { backgroundColor: t.surface, borderColor: answered ? (right ? t.green : t.pink) : t.border, shadowColor: t.cardShadow }]}>
                      {answered ? (
                        <Pop reduceMotion={reduceMotion} style={[styles.verdict, { backgroundColor: right ? t.green : t.pink }]}>
                          <Text style={styles.verdictText}>
                            {right ? 'Right! ' : 'Not quite. '}
                            {answerWord}
                          </Text>
                        </Pop>
                      ) : null}
                      <Text style={[styles.statement, { color: t.text }]}>“{round.statement}”</Text>
                      {state.hint ? (
                        <SlideIn reduceMotion={reduceMotion} style={[styles.hint, { backgroundColor: t.goldSoft }]}>
                          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginTop: 1 }}>
                            <Path d={HINT} stroke={t.goldInk} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                          <Text style={[styles.hintText, { color: t.goldInk }]}>{state.hint}</Text>
                        </SlideIn>
                      ) : null}
                      {answered ? (
                        <>
                          <SlideIn reduceMotion={reduceMotion}>
                            <Text style={[styles.why, { color: t.text2 }]}>{state.feedback?.explanation}</Text>
                          </SlideIn>
                          {state.feedback?.funFact ? (
                            <SlideIn reduceMotion={reduceMotion} delay={150} style={[styles.fun, { backgroundColor: t.pinkSoft }]}>
                              <Text style={[styles.funText, { color: t.text }]}>
                                <Text style={{ fontWeight: '800', color: t.pinkInk, fontSize: ds(11.5) }}>Did you know? </Text>
                                {state.feedback.funFact}
                              </Text>
                            </SlideIn>
                          ) : null}
                        </>
                      ) : null}
                    </View>
                  </Shake>
                </SlideIn>
              </ScrollView>
            ) : (
              <View style={{ flex: 1 }} />
            )}

            {state.error ? <Text style={[styles.error, { color: t.pinkInk }]}>{state.error}</Text> : null}
            <View style={{ paddingHorizontal: 16 }}>
              {!state.attempt && state.error ? <PinkButton t={t} label="Try again" reduceMotion={reduceMotion} onPress={retryStart} /> : null}
              {round && !answered ? (
                <View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Choice t={t} label="Myth" icon={MYTH_ICON} soft={t.pinkSoft} border={t.pinkBorder} ink={t.pinkInk} disabled={state.busy} onPress={() => choose('myth')} />
                    <Choice t={t} label="Fact" icon={FACT_ICON} soft={t.greenSoft} border={t.greenBorder} ink={t.greenInk} disabled={state.busy} onPress={() => choose('fact')} />
                  </View>
                  <PressScale onPress={takeHint} disabled={!canHint} accessibilityLabel={state.hinted ? 'Hint used' : `Need a hint? ${hintCost} SP`}>
                    <View style={styles.hintBtn}>
                      <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
                        <Path d={HINT} stroke={state.hinted ? t.text3 : t.goldInk} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                      <Text style={[styles.hintLabel, { color: state.hinted ? t.text3 : t.goldInk }]}>{state.hinted ? 'Hint used' : `Need a hint? ${hintCost} SP`}</Text>
                    </View>
                  </PressScale>
                </View>
              ) : null}
              {answered ? (
                <Pop reduceMotion={reduceMotion}>
                  <PinkButton t={t} label={isLast ? 'See how you did' : 'Next question'} reduceMotion={reduceMotion} onPress={() => dispatch({ type: 'next' })} />
                </Pop>
              ) : null}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  bars: { flex: 1, flexDirection: 'row', gap: 5 },
  bar: { flex: 1, height: 7, borderRadius: 999 },
  sub: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 20, paddingTop: 18 },
  round: { fontSize: ds(10), fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  level: { fontSize: ds(10.5), fontWeight: '600' },
  card: { minHeight: 200, paddingVertical: 22, paddingHorizontal: 20, borderRadius: 28, borderWidth: 1.5, marginTop: 12, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 18 },
  verdict: { position: 'absolute', top: -13, left: 20, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 },
  verdictText: { color: '#FFFFFF', fontSize: ds(11), fontWeight: '800', letterSpacing: 0.5 },
  statement: { fontFamily: FONT.serif, fontSize: 23, lineHeight: 30 },
  hint: { marginTop: 12, paddingVertical: 9, paddingHorizontal: 11, borderRadius: 14, flexDirection: 'row', gap: 8 },
  hintText: { flex: 1, fontSize: ds(12), fontWeight: '600', lineHeight: 17 },
  why: { marginTop: 12, fontSize: ds(13), lineHeight: 20 },
  fun: { marginTop: 10, paddingVertical: 9, paddingHorizontal: 11, borderRadius: 14 },
  funText: { fontSize: ds(11.5), lineHeight: 17 },
  choice: { height: 96, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 6 },
  choiceText: { fontSize: 16, fontWeight: '800' },
  hintBtn: { height: 44, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  hintLabel: { fontSize: ds(12.5), fontWeight: '700' },
  error: { textAlign: 'center', fontSize: ds(12), marginBottom: 10, paddingHorizontal: 20 },
  resultTitle: { fontFamily: FONT.serif, fontSize: 30, lineHeight: 36, textAlign: 'center', marginTop: 10 },
  resultSub: { fontSize: ds(13), textAlign: 'center', marginTop: 6 },
  statRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingTop: 20 },
  stat: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 18, borderWidth: 1, alignItems: 'center' },
  statValue: { fontFamily: FONT.serif, fontSize: 26, lineHeight: 28 },
  statLabel: { fontSize: ds(10), fontWeight: '700', marginTop: 4 },
});
