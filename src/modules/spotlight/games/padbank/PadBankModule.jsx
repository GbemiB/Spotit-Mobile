import { Animated, BackHandler, Easing, Platform, Pressable, ScrollView, View, StyleSheet, useWindowDimensions } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Rect, Circle, Text as SvgText, SvgXml } from 'react-native-svg';
import { useApp } from '../../../../shared/store/AppContext.jsx';
import { A } from '../../../../shared/store/actions.js';
import { useTheme, Text, FONT } from '../../../../shared/styles/index.js';
import * as padbankApi from '../../../../shared/api/padbank.js';
import { useAnimatedValue } from '../../../dashboard/HeroCardFx.jsx';
import { Icon, HEART, STAR } from '../../common/SpotlightFx.jsx';
import { tone } from '../../common/theme.js';
import { friendlyError } from '../../quiz/quizLogic.js';
import { avatarXml } from './avatars.js';
import { PACK_MARKS, RESULTS, CLUE_TONES, moodFor, clueIcon, packColor, endTitle, goalLabels, nextLabel, canPick } from './padbankLogic.js';

const BACK = 'M15 5l-7 7 7 7';
const HAND =
  'M7 11V7a1.5 1.5 0 0 1 3 0v3m0-1V5.5a1.5 1.5 0 0 1 3 0V10m0-1a1.5 1.5 0 0 1 3 0v2m0 0a1.5 1.5 0 0 1 3 0v3a6.5 6.5 0 0 1-13 0v-3';
const SCOOTER = 'M6 17a2 2 0 1 0 0-.1M18 17a2 2 0 1 0 0-.1M8 17h8M4 13l3-5h5l1 5M13 13h5l2 4M15 8h3l1 5';
const COIN = 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 7.5v9M9.5 9.5h4a1.75 1.75 0 0 1 0 3.5h-3a1.75 1.75 0 0 0 0 3.5h4';
const BAG = 'M27 12a3 3 0 0 1 6 0v6';

function feel(kind) {
  let done;
  if (kind === 'good') done = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else if (kind === 'bad') done = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  else if (Platform.OS === 'android') done = Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Virtual_Key);
  else done = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  Promise.resolve(done).catch(() => {});
}

function Chunky({ onPress, disabled, colors, shadow, style, children, label }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {({ pressed }) => (
        <View style={[{ borderRadius: 18, backgroundColor: shadow, paddingBottom: pressed ? 1 : 5, marginTop: pressed ? 4 : 0 }, style]}>
          <LinearGradient colors={colors} style={styles.chunkyFace}>
            {children}
          </LinearGradient>
        </View>
      )}
    </Pressable>
  );
}

function Scene({ width, height }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 390 300" preserveAspectRatio="xMidYMax slice" style={StyleSheet.absoluteFill}>
      <Circle cx={318} cy={70} r={34} fill="#FFE3B0" opacity={0.9} />
      <Rect x={0} y={120} width={120} height={120} rx={6} fill="#F6D3C2" />
      <Rect x={14} y={140} width={26} height={30} rx={4} fill="#FFF6EE" />
      <Rect x={54} y={140} width={26} height={30} rx={4} fill="#FFF6EE" />
      <Rect x={130} y={96} width={130} height={144} rx={6} fill="#F8C7D1" />
      <Rect x={146} y={108} width={98} height={22} rx={6} fill="#FFFFFF" />
      <SvgText x={195} y={124} fontSize={12} fontWeight="800" fill="#4E9E78" textAnchor="middle">
        PHARMACY
      </SvgText>
      <Path d="M195 140v18M186 149h18" stroke="#4E9E78" strokeWidth={5} strokeLinecap="round" />
      <Rect x={150} y={176} width={40} height={64} rx={4} fill="#FFF6EE" />
      <Rect x={272} y={128} width={118} height={112} rx={6} fill="#E7F2EB" />
      <Rect x={290} y={146} width={28} height={30} rx={4} fill="#FFFFFF" />
      <Rect x={334} y={146} width={28} height={30} rx={4} fill="#FFFFFF" />
      <Rect x={0} y={236} width={390} height={64} fill="#E9DED8" />
      <Path d="M0 262h390" stroke="#FFFFFF" strokeWidth={4} strokeDasharray="22 18" />
    </Svg>
  );
}

function Counter({ width }) {
  return (
    <View style={[styles.counter, { width }]} pointerEvents="none">
      <LinearGradient colors={['#E6B98F', '#C98D62']} style={styles.counterTop} />
      <View style={styles.counterFront}>
        <View style={styles.counterSign}>
          <Text style={styles.counterSignTx}>PAD BANK</Text>
        </View>
      </View>
    </View>
  );
}

function Bag({ pack, size = 60, lifted }) {
  const c = packColor(pack.color);
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60">
      <Path d={BAG} stroke={c.dark} strokeWidth={2.6} strokeLinecap="round" fill="none" />
      <Path d="M14 18h32l-3 32a4 4 0 0 1-4 3.6H21a4 4 0 0 1-4-3.6z" fill={c.bag} />
      <Path d="M14 18h32l-3 32a4 4 0 0 1-4 3.6H21a4 4 0 0 1-4-3.6z" stroke={c.dark} strokeWidth={2.2} fill="none" strokeLinejoin="round" />
      <Path d="M18 24l1.5 16" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      <Path
        d={PACK_MARKS[pack.id] || PACK_MARKS.starter}
        stroke={c.dark}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {lifted ? <Circle cx={30} cy={34} r={26} fill="#FFE2A0" opacity={0.18} /> : null}
    </Svg>
  );
}

export default function PadBankModule({ insets, reduceMotion, challenge, onExit, onChanged }) {
  const { state, dispatch } = useApp();
  const { colors: c, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const token = state.accessToken;
  const balance = state.femPoints || 0;
  const cost = challenge?.cost ?? 0;
  const [phase, setPhase] = useState('intro');
  const [run, setRun] = useState(null);
  const [round, setRound] = useState(0);
  const [pack, setPack] = useState(null);
  const [route, setRoute] = useState(null);
  const [res, setRes] = useState(null);
  const [stock, setStock] = useState({});
  const [hearts, setHearts] = useState(0);
  const [budget, setBudget] = useState(0);
  const [served, setServed] = useState(0);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const timers = useRef([]);
  const walk = useAnimatedValue(0);
  const react = useAnimatedValue(0);
  const scooter = useAnimatedValue(0);
  const sceneH = Math.round(Math.min(380, width * 0.92));

  const later = useCallback(
    (fn, ms) => {
      timers.current.push(setTimeout(fn, reduceMotion ? 0 : ms));
    },
    [reduceMotion],
  );
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onExit();
      return true;
    });
    return () => sub.remove();
  }, [onExit]);

  const animateWalk = useCallback(
    (from, to, ms) => {
      if (reduceMotion) {
        walk.setValue(to);
        return;
      }
      walk.setValue(from);
      Animated.timing(walk, { toValue: to, duration: ms, easing: Easing.out(Easing.back(1.1)), useNativeDriver: true }).start();
    },
    [reduceMotion, walk],
  );

  const visitorIn = useCallback(() => {
    setPhase('walk');
    animateWalk(1, 0, 750);
    later(() => setPhase('ask'), 800);
  }, [animateWalk, later]);

  async function play() {
    feel('tap');
    setError(null);
    setPhase('loading');
    try {
      const data = await padbankApi.startRun(1, token);
      if (typeof data.balance === 'number') dispatch({ type: A.POINTS_SPENT, newBalance: data.balance });
      const s = {};
      data.packs.forEach(p => {
        s[p.id] = p.stock;
      });
      setRun(data);
      setStock(s);
      setHearts(data.hearts);
      setBudget(data.budget);
      setServed(0);
      setResults([]);
      setRound(0);
      setPack(null);
      setRoute(null);
      setRes(null);
      visitorIn();
    } catch (e) {
      setError(friendlyError(e));
      setPhase('intro');
    }
  }

  function pickPack(id) {
    if (!canPick(phase, stock[id] ?? 0)) return;
    feel('tap');
    setPack(id);
    setPhase('route');
  }

  async function chooseRoute(way) {
    if (phase !== 'route' || !pack) return;
    feel('tap');
    setRoute(way);
    setPhase('act');
    if (way === 'delivery' && !reduceMotion) {
      scooter.setValue(0);
      Animated.timing(scooter, { toValue: 1, duration: 1000, easing: Easing.in(Easing.quad), useNativeDriver: true }).start();
    }
    try {
      const out = await padbankApi.serve(run.runId, round, pack, way, token);
      later(
        () => {
          setRes(out);
          setStock(out.stock);
          setHearts(out.hearts);
          setBudget(out.budget);
          setServed(out.served);
          setResults(r => [...r, out.result]);
          setPhase('result');
          feel(out.result === 'oops' ? 'bad' : 'good');
          if (!reduceMotion) {
            react.setValue(0);
            Animated.timing(react, { toValue: 1, duration: 600, easing: Easing.linear, useNativeDriver: true }).start();
          }
        },
        way === 'delivery' ? 1100 : 600,
      );
    } catch (e) {
      setError(friendlyError(e));
      setPhase('route');
    }
  }

  function next() {
    feel('tap');
    if (res?.finished) {
      setPhase('done');
      onChanged?.();
      return;
    }
    setPhase('leave');
    animateWalk(0, -1, 500);
    later(() => {
      setRound(r => r + 1);
      setPack(null);
      setRoute(null);
      setRes(null);
      visitorIn();
    }, 520);
  }

  const visitor = run?.visitors?.[Math.min(round, (run?.visitors?.length ?? 1) - 1)];
  const total = run?.visitors?.length ?? 3;
  const mood = moodFor(phase, res?.result);
  const result = res ? RESULTS[res.result] || RESULTS.great : null;
  const showVisitor = run && phase !== 'intro' && phase !== 'loading' && phase !== 'done';
  const reactStyle =
    phase === 'result' && res
      ? res.result === 'oops'
        ? { transform: [{ translateX: react.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [0, -8, 8, -5, 3, 0] }) }] }
        : { transform: [{ scale: react.interpolate({ inputRange: [0, 0.35, 0.7, 1], outputRange: [1, 1.08, 0.98, 1] }) }] }
      : null;
  const pink = tone('pink', isDark);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={{ height: sceneH + insets.top, overflow: 'hidden' }}>
        <LinearGradient colors={isDark ? ['#3A2A33', '#4A3640'] : ['#FFE9DE', '#FCD7DD']} style={StyleSheet.absoluteFill} />
        <Scene width={width} height={sceneH + insets.top} />
        {showVisitor && visitor ? (
          <Animated.View
            style={[
              styles.visitor,
              { left: width / 2 - 95 },
              { transform: [{ translateX: walk.interpolate({ inputRange: [-1, 0, 1], outputRange: [-width, 0, width] }) }] },
            ]}
            accessible
            accessibilityLabel={`Visitor: ${visitor.who}${mood === 'happy' ? ', smiling' : mood === 'sad' ? ', looking sad' : ''}`}
          >
            <Animated.View style={reactStyle}>
              <SvgXml xml={avatarXml(visitor.look, mood)} width={190} height={190} />
            </Animated.View>
          </Animated.View>
        ) : null}
        <Counter width={width} />
        {route === 'delivery' && (phase === 'act' || phase === 'result') ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.scooter,
              { transform: [{ translateX: scooter.interpolate({ inputRange: [0, 1], outputRange: [0, width * 0.7] }) }] },
            ]}
          >
            <Icon d={SCOOTER} size={40} color="#2F7454" width={2.2} />
          </Animated.View>
        ) : null}
        {(phase === 'ask' || phase === 'route') && visitor ? (
          <View
            style={[styles.thought, { backgroundColor: c.surface }]}
            accessible
            accessibilityLabel={`${visitor.who}: ${visitor.clues.map(cl => cl.text).join(', ')}`}
          >
            <Text style={[styles.who, { color: c.textMuted }]}>{visitor.who}</Text>
            {visitor.clues.map((cl, i) => {
              const t = tone(CLUE_TONES[i % CLUE_TONES.length], isDark);
              return (
                <View key={`${cl.icon}-${i}`} style={styles.clue}>
                  <View style={[styles.clueIcon, { backgroundColor: t.bg, borderColor: t.line }]}>
                    <Icon d={clueIcon(cl.icon)} size={16} color={t.ink} width={2} />
                  </View>
                  <Text style={[styles.clueTx, { color: c.textPrimary }]}>{cl.text}</Text>
                </View>
              );
            })}
          </View>
        ) : null}
        {phase === 'result' && res ? (
          <View style={[styles.speech, { backgroundColor: c.surface }]}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: res.result === 'oops' ? '#8E3A2E' : c.textPrimary }}>{res.speech}</Text>
          </View>
        ) : null}
        <View style={[styles.topBar, { top: insets.top + 8 }]}>
          <Pressable
            onPress={onExit}
            accessibilityRole="button"
            accessibilityLabel="Back to Spotlight"
            style={[styles.round, { backgroundColor: c.surface }]}
          >
            <Icon d={BACK} size={18} color={c.primaryDark} width={2.4} />
          </Pressable>
          {run && phase !== 'intro' ? (
            <>
              <View style={[styles.pill, { backgroundColor: c.surface }]} accessibilityLabel={`${hearts} hearts left`}>
                {Array.from({ length: run.hearts }, (_, i) => (
                  <Icon key={i} d={HEART} size={14} color={i < hearts ? c.primary : c.border} fill />
                ))}
              </View>
              <View style={[styles.pill, { backgroundColor: c.surface }]} accessibilityLabel={`Bank budget ${budget}`}>
                <Icon d={COIN} size={15} color={pink.ink} width={2} />
                <Text style={[styles.pillTx, { color: c.textPrimary }]}>{budget}</Text>
              </View>
              <View style={styles.dots} accessibilityLabel={`Visitor ${Math.min(round, total - 1) + 1} of ${total}`}>
                {Array.from({ length: total }, (_, i) => {
                  const r = results[i];
                  const bg = r ? RESULTS[r].bg : i === round ? c.primary : 'rgba(255,255,255,0.7)';
                  return <View key={i} style={[styles.dot, { width: i === round && !r ? 22 : 9, backgroundColor: bg }]} />;
                })}
              </View>
            </>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.panel, { paddingBottom: insets.bottom + 110 }]} showsVerticalScrollIndicator={false}>
        {error ? <Text style={[styles.error, { color: '#C9604F' }]}>{error}</Text> : null}

        {(phase === 'intro' || phase === 'loading') && (
          <View style={styles.center}>
            <Text style={[styles.title, { color: c.textPrimary }]}>Open the bank!</Text>
            <Text style={[styles.body, { color: c.textSecondary }]}>
              Read each visitor’s clues, pick the right pack from the shelf, then hand it over or send it by scooter. Every visitor counts.
            </Text>
            <Chunky
              onPress={play}
              disabled={phase === 'loading' || balance < cost}
              colors={[c.primaryDark, c.primary]}
              shadow="#8E3048"
              style={{ marginTop: 18, minWidth: 220 }}
              label={cost ? `Play for ${cost} SP` : 'Play'}
            >
              <Text style={styles.chunkyTx}>{phase === 'loading' ? 'Opening…' : cost ? `PLAY · ${cost} SP` : 'PLAY'}</Text>
            </Chunky>
            {balance < cost ? (
              <Text style={[styles.fine, { color: c.textMuted }]}>You need {cost - balance} more SP. Keep logging to earn it.</Text>
            ) : (
              <Text style={[styles.fine, { color: c.textMuted }]}>Pretend only: no real products or money change hands.</Text>
            )}
          </View>
        )}

        {(phase === 'ask' || phase === 'route' || phase === 'walk' || phase === 'act' || phase === 'leave') && run && (
          <>
            <Text style={[styles.label, { color: c.primaryDark }]}>{phase === 'route' ? 'How will she get it?' : 'Pick her pack'}</Text>
            <View style={styles.shelf}>
              {run.packs.map(p => {
                const left = stock[p.id] ?? 0;
                const on = pack === p.id;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => pickPack(p.id)}
                    disabled={!canPick(phase, left)}
                    accessibilityRole="button"
                    accessibilityLabel={`${p.name}, ${p.cost} budget, ${left} left`}
                    style={[
                      styles.packTile,
                      { backgroundColor: c.surface, borderColor: on ? c.primary : c.border, opacity: left <= 0 ? 0.4 : 1 },
                      on && { transform: [{ translateY: -6 }] },
                    ]}
                  >
                    <Bag pack={p} lifted={on} />
                    <Text style={[styles.packName, { color: c.textPrimary }]} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={{ fontSize: 10, color: c.textMuted }}>{p.cost} budget</Text>
                    <View style={[styles.stock, { backgroundColor: left <= 0 ? c.textMuted : left === 1 ? '#C9604F' : '#2E2429' }]}>
                      <Text style={styles.stockTx}>{left}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            {phase === 'route' && (
              <View style={styles.routes}>
                <Chunky
                  onPress={() => chooseRoute('pickup')}
                  colors={['#F8CDB5', '#EE9C76']}
                  shadow="#B85A33"
                  style={{ flex: 1 }}
                  label="Hand it over for pickup, free"
                >
                  <Icon d={HAND} size={22} color="#FFFFFF" width={2.2} />
                  <Text style={styles.chunkyTx}>Pickup · FREE</Text>
                </Chunky>
                <View style={{ width: 12 }} />
                <Chunky
                  onPress={() => chooseRoute('delivery')}
                  colors={['#A5D8BA', '#4E9E78']}
                  shadow="#2F7454"
                  style={{ flex: 1 }}
                  label={`Send it by scooter, ${run.deliveryCost} budget`}
                >
                  <Icon d={SCOOTER} size={22} color="#FFFFFF" width={2.2} />
                  <Text style={styles.chunkyTx}>Scooter · {run.deliveryCost}</Text>
                </Chunky>
              </View>
            )}
          </>
        )}

        {phase === 'result' && res && result && (
          <View style={styles.center}>
            <View style={[styles.burst, { backgroundColor: result.bg, borderBottomColor: result.shadow }]}>
              <Icon d={result.icon} size={20} color="#FFFFFF" width={3} />
              <Text style={styles.burstTx}>{result.word}</Text>
            </View>
            <Text style={[styles.body, { color: c.textSecondary }]}>{res.tip}</Text>
            <Chunky
              onPress={next}
              colors={[c.primaryDark, c.primary]}
              shadow="#8E3048"
              style={{ marginTop: 16, minWidth: 220 }}
              label={nextLabel(res.finished)}
            >
              <Text style={styles.chunkyTx}>{nextLabel(res.finished)}</Text>
            </Chunky>
          </View>
        )}

        {phase === 'done' && res && (
          <View style={styles.center}>
            <Text style={[styles.title, { color: c.textPrimary }]}>{endTitle(res.hearts, res.stars)}</Text>
            <View style={styles.stars} accessibilityLabel={`${res.stars} of 3 stars`}>
              {[0, 1, 2].map(i => (
                <Icon key={i} d={STAR} size={i === 1 ? 64 : 48} color={i < res.stars ? '#E6C48E' : c.border} fill />
              ))}
            </View>
            <View style={[styles.box, { backgroundColor: c.surface, borderColor: c.border }]}>
              {goalLabels(total, run.budgetGoal).map((g, i) => (
                <View key={g} style={styles.goal}>
                  <Icon
                    d={res.goals?.[i] ? 'M5 12.5l4.2 4.2L19 7' : 'M7 12h10'}
                    size={16}
                    color={res.goals?.[i] ? '#4E9E78' : c.textMuted}
                    width={2.4}
                  />
                  <Text style={{ fontSize: 12, color: c.textPrimary }}>{g}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.body, { color: c.textSecondary }]}>
              {served}/{total} packs out · {budget} budget left
            </Text>
            {res.badge ? (
              <View style={[styles.badge, { backgroundColor: pink.bg, borderColor: pink.line }]}>
                <Icon d={HEART} size={14} color={c.primary} fill />
                <Text style={{ fontSize: 12, fontWeight: '700', color: c.primaryDark }}>Never Turned Away</Text>
              </View>
            ) : null}
            <View style={[styles.routes, { marginTop: 18 }]}>
              <Chunky
                onPress={play}
                disabled={balance < cost}
                colors={['#FFFFFF', '#FFF0F2']}
                shadow={c.border}
                style={{ flex: 1 }}
                label={`Play again for ${cost} SP`}
              >
                <Text style={[styles.chunkyTx, { color: c.primaryDark }]}>{cost ? `Again · ${cost} SP` : 'Again'}</Text>
              </Chunky>
              <View style={{ width: 12 }} />
              <Chunky onPress={onExit} colors={['#A5D8BA', '#4E9E78']} shadow="#2F7454" style={{ flex: 1 }} label="Back to Spotlight">
                <Text style={styles.chunkyTx}>Done</Text>
              </Chunky>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  visitor: { position: 'absolute', bottom: 54, width: 190, height: 190 },
  counter: { position: 'absolute', bottom: 0, left: 0, height: 66 },
  counterTop: { height: 12 },
  counterFront: { flex: 1, backgroundColor: '#B87A50', alignItems: 'center', justifyContent: 'center' },
  counterSign: { backgroundColor: '#FFF6EE', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10 },
  counterSignTx: { fontSize: 12, fontWeight: '800', color: '#C04E68', letterSpacing: 1.5 },
  scooter: { position: 'absolute', bottom: 70, left: 10 },
  thought: {
    position: 'absolute',
    right: 12,
    top: 64,
    maxWidth: 190,
    borderRadius: 18,
    padding: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  who: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  clue: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clueIcon: { width: 28, height: 28, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  clueTx: { flex: 1, fontSize: 11.5, fontWeight: '600', lineHeight: 15 },
  speech: { position: 'absolute', left: 16, top: 70, maxWidth: 200, borderRadius: 16, padding: 10, elevation: 3 },
  topBar: { position: 'absolute', left: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  round: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 32, paddingHorizontal: 10, borderRadius: 99 },
  pillTx: { fontSize: 12, fontWeight: '800' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto' },
  dot: { height: 9, borderRadius: 5 },
  panel: { padding: 16, gap: 12 },
  center: { alignItems: 'center' },
  title: { fontFamily: FONT.serif, fontSize: 30, lineHeight: 36, textAlign: 'center' },
  body: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 8, maxWidth: 320 },
  fine: { fontSize: 10.5, textAlign: 'center', marginTop: 10 },
  error: { fontSize: 12, textAlign: 'center' },
  label: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  shelf: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  packTile: { width: '48.5%', alignItems: 'center', borderWidth: 1.5, borderRadius: 18, paddingVertical: 10 },
  packName: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  stock: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockTx: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  routes: { flexDirection: 'row', alignSelf: 'stretch' },
  chunkyFace: {
    minHeight: 52,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  chunkyTx: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  burst: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    borderBottomWidth: 4,
  },
  burstTx: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  stars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 10 },
  box: { alignSelf: 'stretch', borderWidth: 1.5, borderRadius: 18, padding: 12, gap: 8, marginTop: 14 },
  goal: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },
});
