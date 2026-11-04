import { Animated, BackHandler, Easing, Platform, View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useApp } from '../../../../shared/store/AppContext.jsx';
import { A } from '../../../../shared/store/actions.js';
import { useTheme, Text, FONT } from '../../../../shared/styles/index.js';
import * as padbankApi from '../../../../shared/api/padbank.js';
import { useAnimatedValue } from '../../../dashboard/HeroCardFx.jsx';
import { PressScale, Pop } from '../../common/SpotlightFx.jsx';
import { gameError } from '../../common/wording.js';
import { clueIcon, endTitle as fallbackTitle, goalLabels, visitPrice, togglePack, slipName } from '../../games/padbank/padbankLogic.js';
import Character from '../Character.jsx';
import { spotTokens, STAR_PATH } from '../tokens.js';
import { ds, SlideIn, Breathe, WaveOnce } from '../motion.jsx';
import { Confetti, StarRow, HeartIcon, Shake } from '../fx.jsx';
import { CircleButton, SpPill, PinkButton, GhostButton, COIN_STAR } from '../ui.jsx';
import BankScene, { PackBag, packArt, sceneColors } from './BankScene.jsx';

const BACK = 'M15 5l-7 7 7 7';
const HOME = 'M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z';
const SCOOT = 'M5 17a2 2 0 1 0 0 .1M18 17a2 2 0 1 0 0 .1M5 17h9l3-6h3M3 9h7v5H3z';
const BULB = 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z';
const TICK = 'M5 12.5l4.5 4.5L19 7.5';
const DASH = 'M6 12h12';
const LOOKS = {
  girl: ['padbankGirlCalm', 'padbankGirl'],
  woman: ['mama', 'mamaHappy'],
  student: ['coach', 'coach'],
  man: ['man', 'manHappy'],
  grandma: ['grandma', 'grandmaHappy'],
  teens: ['teens', 'teensHappy'],
  motherDaughter: ['motherDaughter', 'motherDaughterHappy'],
  fatherDaughter: ['fatherDaughter', 'fatherDaughterHappy'],
};

function lookOf(look, happy) {
  const pair = LOOKS[look] || ['you', 'youHappy'];
  return pair[happy ? 1 : 0];
}

function feel(kind) {
  let done;
  if (kind === 'good') done = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else if (kind === 'bad') done = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  else if (Platform.OS === 'android') done = Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Virtual_Key);
  else done = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  Promise.resolve(done).catch(() => {});
}

function Visitor({ k, name, entering, happy, reduceMotion }) {
  const v = useAnimatedValue(entering && !reduceMotion ? 0 : 1);
  useEffect(() => {
    if (!entering || reduceMotion) return undefined;
    v.setValue(0);
    const anim = Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.bezier(0.2, 0.8, 0.3, 1), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [entering, reduceMotion, v, name]);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 96 * k,
        top: 190 * k,
        opacity: v,
        transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [150, 0] }) }],
      }}
    >
      {happy ? (
        <WaveOnce reduceMotion={reduceMotion} delay={0}>
          <Character name={name} size={196 * k} />
        </WaveOnce>
      ) : (
        <Breathe reduceMotion={reduceMotion}>
          <Character name={name} size={196 * k} />
        </Breathe>
      )}
    </Animated.View>
  );
}

function Bubble({ t, k, visitor, reduceMotion }) {
  const tones = [
    [t.pinkSoft, t.pinkInk],
    [t.goldSoft, t.goldInk],
    [t.greenSoft, t.greenInk],
  ];
  return (
    <Pop
      delay={700}
      reduceMotion={reduceMotion}
      style={[styles.bubble, { left: 12 * k, top: 168 * k, width: 150 * k, backgroundColor: t.surface }]}
    >
      <Text style={[styles.bubbleWho, { color: t.pinkInk }]}>{visitor.who}</Text>
      <View style={{ gap: 4, marginTop: 5 }}>
        {visitor.clues.map((c, i) => (
          <SlideIn
            key={c.text}
            reduceMotion={reduceMotion}
            delay={900 + i * 120}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <View style={[styles.clueIcon, { backgroundColor: tones[i % 3][0] }]}>
              <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                <Path d={clueIcon(c.icon)} stroke={tones[i % 3][1]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
            <Text style={[styles.clueText, { color: t.text }]}>{c.text}</Text>
          </SlideIn>
        ))}
      </View>
    </Pop>
  );
}

function Flight({ k, from, art, kind, reduceMotion, t }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    v.setValue(0);
    const anim = Animated.timing(v, {
      toValue: 1,
      duration: kind === 'scooter' ? 1300 : 850,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [v, kind, reduceMotion]);
  if (reduceMotion) return null;
  if (kind === 'scooter') {
    return (
      <Animated.View
        style={{
          position: 'absolute',
          left: 150 * k,
          top: 318 * k,
          zIndex: 5,
          transform: [{ translateX: v.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, -6, 420] }) }],
        }}
      >
        <Svg width={110} height={70} viewBox="0 0 110 70">
          <Path d="M24 56h32l14-24h12l4 24" stroke={t.pink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <Path d="M13 56a11 11 0 1 0 22 0a11 11 0 1 0 -22 0M75 56a11 11 0 1 0 22 0a11 11 0 1 0 -22 0" fill={t.text} />
          <Path d="M10 29a5 5 0 0 1 5-5h24a5 5 0 0 1 5 5v16a5 5 0 0 1-5 5H15a5 5 0 0 1-5-5z" fill={t.gold} />
        </Svg>
      </Animated.View>
    );
  }
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: from,
        top: 404 * k,
        zIndex: 5,
        opacity: v.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
        transform: [
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, 170 * k - from] }) },
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -150 * k] }) },
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.75] }) },
        ],
      }}
    >
      <PackBag fill={art[0]} top={art[1]} size={46} />
    </Animated.View>
  );
}

export default function PadBankV2({ insets, reduceMotion, challenge, onExit, onChanged }) {
  const { state, dispatch } = useApp();
  const { isDark } = useTheme();
  const t = spotTokens(isDark);
  const sc = sceneColors(isDark);
  const { width } = useWindowDimensions();
  const k = width / 390;
  const token = state.accessToken;
  const cost = challenge?.cost ?? 0;
  const [freeLeft, setFreeLeft] = useState(challenge?.freePlaysLeft ?? 0);
  const [rules, setRules] = useState(null);
  const [phase, setPhase] = useState('intro');
  const [run, setRun] = useState(null);
  const [round, setRound] = useState(0);
  const [picks, setPicks] = useState([]);
  const [route, setRoute] = useState(null);
  const [fb, setFb] = useState(null);
  const [stock, setStock] = useState({});
  const [hearts, setHearts] = useState(0);
  const balance = state.femPoints || 0;
  const [spentToday, setSpentToday] = useState(0);
  const [served, setServed] = useState(0);
  const [rightPack, setRightPack] = useState(0);
  const [rightWay, setRightWay] = useState(0);
  const [end, setEnd] = useState(null);
  const [flight, setFlight] = useState(null);
  const [error, setError] = useState(null);
  const [rulesKey, setRulesKey] = useState(0);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    let alive = true;
    padbankApi
      .getRules(token)
      .then(r => alive && setRules(r))
      .catch(e => alive && setError(gameError(e)));
    return () => {
      alive = false;
    };
  }, [token, rulesKey]);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onExit();
      return true;
    });
    return () => sub.remove();
  }, [onExit]);

  const later = useCallback((fn, ms) => timers.current.push(setTimeout(fn, reduceMotion ? 0 : ms)), [reduceMotion]);

  async function open() {
    feel('tap');
    setError(null);
    setPhase('loading');
    try {
      const data = await padbankApi.startRun(null, token);
      if (typeof data.balance === 'number') dispatch({ type: A.POINTS_SPENT, newBalance: data.balance });
      if (data.cost === 0) setFreeLeft(n => Math.max(0, n - 1));
      const s = {};
      data.packs.forEach(p => {
        s[p.id] = p.stock;
      });
      setRun(data);
      setStock(s);
      setHearts(data.hearts);
      setSpentToday(data.cost || 0);
      setServed(0);
      setRightPack(0);
      setRightWay(0);
      setRound(0);
      setPicks([]);
      setRoute(null);
      setFb(null);
      setEnd(null);
      setPhase('serve');
    } catch (e) {
      setError(gameError(e));
      setPhase('intro');
    }
  }

  async function hand() {
    if (phase !== 'serve' || !ready || short) return;
    feel('tap');
    const first = run.packs.find(p => p.id === picks[0]);
    const index = Math.min(
      3,
      run.packs.findIndex(p => p.id === picks[0]),
    );
    const given = [...picks];
    setFlight({ kind: route === 'delivery' ? 'scooter' : 'fly', from: (20 + index * 92) * k, art: packArt(first.color) });
    setPhase('act');
    try {
      const out = await padbankApi.serve(run.runId, round, given, route, token);
      if (out.spent > 0 && typeof out.balance === 'number') dispatch({ type: A.POINTS_SPENT, newBalance: out.balance });
      later(
        () => {
          setFlight(null);
          setStock(out.stock);
          setHearts(out.hearts);
          setSpentToday(out.spentToday);
          setServed(out.served);
          setRightPack(out.rightPack);
          setRightWay(out.rightWay);
          setFb({ ...out, packs: given, first, route });
          if (out.finished) setEnd(out);
          setPhase('feedback');
          feel(out.result === 'oops' ? 'bad' : 'good');
        },
        route === 'delivery' ? 1300 : 850,
      );
    } catch (e) {
      setFlight(null);
      setError(gameError(e));
      setPhase('serve');
    }
  }

  async function closeForToday() {
    if (phase !== 'serve' || !run) return;
    feel('tap');
    setPhase('act');
    try {
      const out = await padbankApi.closeBank(run.runId, token);
      setServed(out.served);
      setSpentToday(out.spentToday);
      setEnd(out);
      setPhase('end');
      onChanged?.();
    } catch (e) {
      setError(gameError(e));
      setPhase('serve');
    }
  }

  function next() {
    feel('tap');
    if (end) {
      setPhase('end');
      onChanged?.();
      return;
    }
    setRound(r => r + 1);
    setPicks([]);
    setRoute(null);
    setFb(null);
    setPhase('serve');
  }

  function playAgain() {
    setRules(null);
    setRulesKey(n => n + 1);
    setPhase('intro');
    setRun(null);
    setEnd(null);
  }

  const total = run?.visitors?.length ?? rules?.visitors ?? 0;
  const visitors = run?.visitors || [];
  const visitor = visitors[Math.min(round, Math.max(0, visitors.length - 1))];
  const happy = phase === 'feedback' && fb && fb.result !== 'oops';
  const queue =
    phase === 'serve' || phase === 'act' || phase === 'feedback' ? visitors.slice(round + 1).map(v => lookOf(v.look, false)) : [];
  const shownPacks = run?.packs || [];
  const size = Math.max(1, visitor?.size || 1);
  const chosenList = picks.map(id => shownPacks.find(p => p.id === id)).filter(Boolean);
  const chosen = chosenList.length ? chosenList : null;
  const chosenUnique = chosenList.filter((p, i) => chosenList.indexOf(p) === i);
  const packsCost = chosenList.reduce((sum, p) => sum + p.cost, 0);
  const priceRules = run || rules;
  const freeVisitors = priceRules?.freeVisitors ?? 0;
  const visitorFee = priceRules?.visitorFee ?? 0;
  const deliveryCost = priceRules?.deliveryCost ?? 0;
  const freeNow = round < freeVisitors;
  const freeDay = !!priceRules?.freeDay;
  const onHouse = freeNow || freeDay;
  const orderCost = visitPrice(round, priceRules, chosen, route);
  const listCost = visitPrice(round, { ...priceRules, freeDay: false }, chosen, route);
  const strike = freeDay && !freeNow ? { textDecorationLine: 'line-through', color: t.disabledFg } : null;
  const short = !onHouse && orderCost > balance;
  const ready = picks.length === size && !!route;
  const kicker =
    phase === 'intro' || phase === 'loading'
      ? `Day ${rules?.day ?? 1}`
      : phase === 'end'
        ? `Day ${run?.day ?? 1} · closed`
        : `Visitor ${Math.min(round + 1, total)} of ${total}`;
  const heartTotal = run?.hearts ?? rules?.hearts ?? 3;
  const goals = goalLabels();
  const tracker = [
    { text: `Served ${served}/${total}`, done: served > 0 },
    { text: `Pack ${rightPack}/${total}`, done: rightPack > 0 },
    { text: `Way ${rightWay}/${total}`, done: rightWay > 0 },
  ];
  const priceNote = freeDay
    ? `Day ${priceRules?.day ?? 1} is free: nothing costs SP today. Prices still show so you can see them.`
    : `Your first ${freeVisitors} ${freeVisitors === 1 ? 'visitor is' : 'visitors are'} free. After that, each visitor costs ${visitorFee} SP plus the packs, and delivery is ${deliveryCost} SP.`;
  const openChip = cost > 0 ? (freeLeft > 0 ? 'Free try' : `${cost} SP`) : 'Free to open';
  const sp = n => (freeNow ? 'Free' : `${n} SP`);
  const nextLabel = end
    ? 'See your day'
    : freeDay || round + 1 < freeVisitors
      ? 'Next visitor · free'
      : `Next visitor · ${visitorFee} SP + packs`;
  const fbStyle = fb
    ? { great: [t.green, t.greenSoft], ok: [t.orange, t.orangeSoft], oops: [t.pink, t.redSoft] }[fb.result]
    : [t.pink, t.pinkSoft];
  const endStars = end ? end.stars : 0;
  const serverTitle = end ? (endStars === 3 ? run?.dayTitles?.perfect : hearts <= 0 ? run?.dayTitles?.lost : run?.dayTitles?.done) : '';
  const endTitle = serverTitle || (end ? fallbackTitle(hearts, endStars) : '');
  const servedFaces = visitors.slice(0, served).map(v => lookOf(v.look, true));

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <BankScene
        t={t}
        isDark={isDark}
        k={k}
        packs={shownPacks}
        stock={stock}
        queue={queue}
        peek={phase === 'intro' || phase === 'loading'}
        peekLook="outreach"
        ringKey={`${round}-${phase === 'serve' && !picks.length}`}
        reduceMotion={reduceMotion}
      />
      {visitor && (phase === 'serve' || phase === 'act' || phase === 'feedback') ? (
        <>
          <Visitor
            k={k}
            name={lookOf(visitor.look, happy)}
            entering={phase === 'serve' && !picks.length}
            happy={happy}
            reduceMotion={reduceMotion}
          />
          <Bubble key={visitor.id} t={t} k={k} visitor={visitor} reduceMotion={reduceMotion} />
        </>
      ) : null}
      {flight ? <Flight k={k} t={t} from={flight.from} art={flight.art} kind={flight.kind} reduceMotion={reduceMotion} /> : null}

      <View style={[styles.hud, { top: insets.top + 8 }]}>
        <CircleButton t={t} icon={BACK} label="Back to Spotlight" onPress={onExit} />
        <View style={[styles.titleBox, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Text style={[styles.kicker, { color: t.pinkInk }]}>{kicker}</Text>
          <Text style={[styles.hudTitle, { color: t.text }]}>Pad Bank Run</Text>
        </View>
        <View style={[styles.hearts, { backgroundColor: t.surface, borderColor: t.border }]} accessibilityLabel={`${hearts} hearts left`}>
          {Array.from({ length: heartTotal }, (_, i) => (
            <HeartIcon
              key={i}
              t={t}
              size={15}
              alive={i < (run ? hearts : heartTotal)}
              lost={fb?.result === 'oops' && i === hearts}
              reduceMotion={reduceMotion}
            />
          ))}
        </View>
        <SpPill t={t} balance={balance} reduceMotion={reduceMotion} height={34} />
      </View>

      {phase === 'intro' || phase === 'loading' ? (
        <SlideIn
          reduceMotion={reduceMotion}
          distance={300}
          style={[styles.sheet, { backgroundColor: t.surface, paddingBottom: insets.bottom + 24 }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <WaveOnce reduceMotion={reduceMotion} style={[styles.introFace, { backgroundColor: t.pinkSoft }]}>
              <Character name="padbankGirl" size={50} style={{ marginBottom: -5 }} />
            </WaveOnce>
            <View>
              <Text style={[styles.kicker, { color: t.pinkInk }]}>Day {rules?.day ?? 1} · pretend pad bank</Text>
              <Text style={[styles.sheetTitle, { color: t.text }]}>Open the bank!</Text>
            </View>
          </View>
          <Text style={[styles.introText, { color: t.text2 }]}>
            Visitors come to your counter. Read what each one needs, pick the right packs and the best way to get them there.
          </Text>
          {rules ? (
            <SlideIn reduceMotion={reduceMotion} delay={250} style={[styles.note, { backgroundColor: t.goldSoft }]}>
              <Svg width={16} height={16} viewBox="0 0 24 24" style={{ marginTop: 1 }}>
                <Circle cx={12} cy={12} r={9} fill={t.surface} stroke={t.gold} strokeWidth={1.8} />
                <Path d={COIN_STAR} fill={t.gold} />
              </Svg>
              <Text style={[styles.noteText, { color: t.goldInk }]}>{priceNote}</Text>
            </SlideIn>
          ) : null}
          <View style={styles.statRow}>
            {[
              { value: rules?.visitors ?? '', label: 'visitors today', bg: t.pinkSoft, ink: t.pinkInk },
              { value: rules?.freeDay ? 'All' : (rules?.freeVisitors ?? ''), label: 'free visitors', bg: t.greenSoft, ink: t.greenInk },
              { value: rules?.hearts ?? '', label: 'hearts', bg: t.pinkSoft, ink: t.pinkInk },
            ].map((s, i) => (
              <SlideIn key={s.label} reduceMotion={reduceMotion} delay={100 + i * 60} style={[styles.stat, { backgroundColor: s.bg }]}>
                <Text style={[styles.statValue, { color: s.ink }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: t.text2 }]}>{s.label}</Text>
              </SlideIn>
            ))}
          </View>
          <Text style={[styles.small, { color: t.text3 }]}>WIN A STAR FOR EACH</Text>
          <View style={{ gap: 5, marginTop: 6 }}>
            {goals.map((g, i) => (
              <SlideIn
                key={g}
                reduceMotion={reduceMotion}
                delay={300 + i * 80}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Svg width={15} height={15} viewBox="0 0 24 24">
                  <Path d={STAR_PATH} fill={t.gold} />
                </Svg>
                <Text style={[styles.goal, { color: t.text }]}>{g}</Text>
              </SlideIn>
            ))}
          </View>
          {error ? <Text style={[styles.error, { color: t.pinkInk }]}>{error}</Text> : null}
          <PinkButton
            t={t}
            label="Open the bank"
            disabled={phase === 'loading' || !rules}
            reduceMotion={reduceMotion}
            onPress={open}
            style={{ marginTop: 14 }}
          >
            <Text style={styles.btnText}>{phase === 'loading' ? 'Opening…' : 'Open the bank'}</Text>
            <View style={styles.btnChip}>
              <Text style={styles.btnChipText}>{openChip}</Text>
            </View>
          </PinkButton>
        </SlideIn>
      ) : null}

      {phase === 'serve' || phase === 'act' ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[styles.packRow, { top: 370 * k }]}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 10, paddingTop: 10 }}
          >
            {shownPacks.map(p => {
              const count = picks.filter(x => x === p.id).length;
              const on = count > 0;
              const left = (stock[p.id] ?? 0) - count;
              const art = packArt(p.color);
              return (
                <PressScale
                  key={p.id}
                  onPress={() => phase === 'serve' && setPicks(cur => togglePack(cur, p.id, size, stock[p.id] ?? 0))}
                  disabled={(stock[p.id] ?? 0) <= 0 || phase !== 'serve'}
                  accessibilityLabel={`${p.name}, ${onHouse ? 'free' : `${p.cost} SP`}, ${left} left${count ? `, ${count} picked` : ''}`}
                >
                  <View
                    style={[
                      styles.pack,
                      {
                        width: shownPacks.length > 4 ? 84 * k : (width - 44) / Math.max(1, shownPacks.length),
                        backgroundColor: on ? t.pinkSoft : t.surface,
                        borderColor: on ? t.pink : t.border,
                        opacity: (stock[p.id] ?? 0) > 0 ? 1 : 0.45,
                        transform: [{ translateY: on ? -10 : 0 }],
                      },
                    ]}
                  >
                    <PackBag fill={art[0]} top={art[1]} size={36} />
                    <Text style={[styles.packName, { color: t.text }]} numberOfLines={2}>
                      {p.name}
                    </Text>
                    <Text style={[styles.packCost, { color: t.goldInk }, strike]}>{sp(p.cost)}</Text>
                    <View style={[styles.stock, { backgroundColor: left > 0 ? t.text : t.disabledBg }]}>
                      <Text style={[styles.stockText, { color: left > 0 ? t.bg : t.disabledFg }]}>{left}</Text>
                    </View>
                    {count > 1 ? (
                      <View style={[styles.countBadge, { backgroundColor: t.pink }]}>
                        <Text style={styles.countText}>×{count}</Text>
                      </View>
                    ) : null}
                  </View>
                </PressScale>
              );
            })}
          </ScrollView>
          <ScrollView
            style={{ position: 'absolute', left: 0, right: 0, top: 494 * k, bottom: insets.bottom + 94 }}
            contentContainerStyle={{ paddingHorizontal: 14 }}
          >
            <View style={{ flexDirection: 'row', gap: 8, opacity: picks.length ? 1 : 0.45 }}>
              {[
                { id: 'pickup', label: 'Pickup', sub: 'Free', icon: HOME },
                {
                  id: 'delivery',
                  label: 'Delivery',
                  sub: freeNow ? 'Free today' : freeDay ? `${deliveryCost} SP · free today` : `${deliveryCost} SP`,
                  icon: SCOOT,
                },
              ].map(r => {
                const on = route === r.id;
                return (
                  <PressScale
                    key={r.id}
                    onPress={() => picks.length && phase === 'serve' && setRoute(r.id)}
                    disabled={!picks.length}
                    accessibilityLabel={`${r.label}, ${r.sub}`}
                    style={{ flex: 1 }}
                  >
                    <View style={[styles.route, { backgroundColor: on ? t.pinkSoft : t.surface, borderColor: on ? t.pink : t.border }]}>
                      <View style={[styles.routeIcon, { backgroundColor: on ? t.pink : t.goldSoft }]}>
                        <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                          <Path
                            d={r.icon}
                            stroke={on ? '#FFFFFF' : t.goldInk}
                            strokeWidth={1.9}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </View>
                      <View>
                        <Text style={[styles.routeLabel, { color: t.text }]}>{r.label}</Text>
                        <Text style={[styles.routeSub, { color: t.text3 }]}>{r.sub}</Text>
                      </View>
                    </View>
                  </PressScale>
                );
              })}
            </View>
            <View style={[styles.slip, { backgroundColor: t.surface, borderColor: ready ? t.pink : t.border }]}>
              <View style={styles.slipRow}>
                <Text style={[styles.small, { color: t.text3, marginTop: 0 }]}>ORDER SLIP</Text>
                <View style={[styles.tag, { backgroundColor: onHouse ? t.greenSoft : t.goldSoft }]}>
                  <Text style={[styles.tagText, { color: onHouse ? t.greenInk : t.goldInk }]}>
                    {size > 1 ? `${picks.length} of ${size} packs · ` : ''}
                    {freeNow ? `Free visitor ${round + 1} of ${freeVisitors}` : freeDay ? 'Free day' : 'Paid visitor'}
                  </Text>
                </View>
              </View>
              <View style={[styles.slipRow, { marginTop: 8 }]}>
                <Text style={[styles.slipMain, { color: t.text }]}>
                  {chosen ? slipName(picks, shownPacks) : size > 1 ? `Tap ${size} packs on the counter` : 'Tap a pack on the counter'}
                </Text>
                <Text style={[styles.slipCost, { color: t.goldInk }]}>{chosen ? sp(packsCost) : ''}</Text>
              </View>
              {chosenUnique.some(p => p.contents?.length) ? (
                <View style={styles.contents}>
                  {[...new Set(chosenUnique.flatMap(p => p.contents || []))].map(c => (
                    <View key={c} style={[styles.content, { backgroundColor: t.pinkSoft }]}>
                      <Text style={[styles.contentText, { color: t.pinkInk }]}>{c}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              <View style={[styles.slipRow, { marginTop: 7 }]}>
                <Text style={[styles.slipMain, { color: route ? t.text : t.text3 }]}>
                  {route ? (route === 'delivery' ? 'Delivery' : 'Picked up at the bank') : 'Then choose how it gets there'}
                </Text>
                <Text style={[styles.slipCost, { color: t.goldInk }, route === 'delivery' ? strike : null]}>
                  {route ? (route === 'delivery' && !freeNow ? `${deliveryCost} SP` : 'Free') : ''}
                </Text>
              </View>
              {!freeNow ? (
                <View style={[styles.slipRow, { marginTop: 7 }]}>
                  <Text style={[styles.slipMain, { color: t.text }]}>Visitor fee</Text>
                  <Text style={[styles.slipCost, { color: t.goldInk }, strike]}>{visitorFee} SP</Text>
                </View>
              ) : null}
              <View style={[styles.rule, { backgroundColor: t.border }]} />
              <View style={styles.slipRow}>
                <Text style={[styles.slipAfter, { color: t.text2 }]}>
                  {short ? `You have ${balance} SP` : onHouse ? 'On the house' : `Your SP after: ${balance - orderCost}`}
                </Text>
                <Text style={[styles.slipTotal, { color: t.text }]}>
                  {freeDay && !freeNow && listCost > 0 ? <Text style={strike}>{`${listCost} SP `}</Text> : null}
                  {onHouse ? 'Free' : chosen ? `${orderCost} SP` : `${visitorFee} SP +`}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
              {tracker.map(x => (
                <View key={x.text} style={[styles.track, { backgroundColor: x.done ? t.goldSoft : t.surface }]}>
                  <Svg width={11} height={11} viewBox="0 0 24 24">
                    <Path d={STAR_PATH} fill={x.done ? t.gold : t.starOff} />
                  </Svg>
                  <Text style={[styles.trackText, { color: x.done ? t.goldInk : t.text3 }]}>{x.text}</Text>
                </View>
              ))}
            </View>
            {error ? <Text style={[styles.error, { color: t.pinkInk }]}>{error}</Text> : null}
          </ScrollView>
          <View style={{ position: 'absolute', left: 14, right: 14, bottom: insets.bottom + (freeNow ? 28 : 8) }}>
            <PinkButton
              t={t}
              disabled={!ready || short || phase !== 'serve'}
              reduceMotion={reduceMotion}
              onPress={hand}
              label={
                short
                  ? 'Not enough SP'
                  : ready
                    ? `${route === 'delivery' ? 'Send it' : 'Hand it over'} · ${freeNow ? 'Free' : `${orderCost} SP`}`
                    : size > 1
                      ? `Pick ${size} packs and a way`
                      : 'Pick a pack and a way'
              }
            />
            {!freeNow ? (
              <PressScale
                onPress={closeForToday}
                disabled={phase !== 'serve'}
                accessibilityLabel="Close the bank for today"
                style={{ alignSelf: 'center' }}
              >
                <View style={styles.closeLink}>
                  <Text style={[styles.closeLinkText, { color: t.text2 }]}>Close the bank for today</Text>
                </View>
              </PressScale>
            ) : null}
          </View>
        </>
      ) : null}

      {phase === 'feedback' && fb ? (
        <>
          <Pop
            reduceMotion={reduceMotion}
            style={{ position: 'absolute', left: 180 * k, right: 8, top: 132 * k, alignItems: 'center', zIndex: 6 }}
          >
            <View style={[styles.burst, { backgroundColor: fbStyle[0] }]}>
              <Text style={styles.burstText}>{fb.title}</Text>
            </View>
          </Pop>
          <SlideIn
            reduceMotion={reduceMotion}
            distance={300}
            style={[styles.sheet, { top: 404 * k, backgroundColor: t.surface, paddingBottom: insets.bottom + 24 }]}
          >
            <Shake trigger={fb.result === 'oops' ? round + 1 : 0} reduceMotion={reduceMotion} style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.fbFace, { backgroundColor: fbStyle[1] }]}>
                  <Character name={lookOf(visitor.look, happy)} size={52} style={{ marginBottom: -4 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.speech, { color: t.text }]}>“{fb.speech}”</Text>
                  <Text style={[styles.slipWho, { color: t.text3, marginTop: 2 }]}>{visitor.who}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <SlideIn reduceMotion={reduceMotion} delay={150} style={[styles.half, { backgroundColor: t.bg }]}>
                  <Text style={[styles.small, { color: t.text3, marginTop: 0 }]}>WHAT THEY NEED</Text>
                  {visitor.clues.map(c => (
                    <View key={c.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 }}>
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                        <Path d={clueIcon(c.icon)} stroke={t.pinkInk} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                      <Text style={[styles.need, { color: t.text }]}>{c.text}</Text>
                    </View>
                  ))}
                </SlideIn>
                <SlideIn reduceMotion={reduceMotion} delay={250} style={[styles.half, { backgroundColor: fbStyle[1] }]}>
                  <Text style={[styles.small, { color: t.text3, marginTop: 0 }]}>YOU GAVE</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 }}>
                    <PackBag fill={packArt(fb.first.color)[0]} top={packArt(fb.first.color)[1]} size={22} />
                    <Text style={[styles.gave, { color: t.text, flex: 1 }]}>{slipName(fb.packs, shownPacks)}</Text>
                  </View>
                  <Text style={[styles.need, { color: t.text2, marginTop: 5 }]}>
                    {fb.route === 'delivery' ? 'By delivery' : 'Picked up'}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                    <View style={[styles.mark, { backgroundColor: fb.result === 'oops' ? t.pink : t.green }]}>
                      <Text style={styles.markText}>
                        {fb.result === 'oops' ? (size > 1 ? 'Wrong packs' : 'Wrong pack') : size > 1 ? 'Right packs' : 'Right pack'}
                      </Text>
                    </View>
                    {fb.result !== 'oops' ? (
                      <View style={[styles.mark, { backgroundColor: fb.result === 'great' ? t.green : t.orange }]}>
                        <Text style={styles.markText}>{fb.result === 'great' ? 'Right way' : 'Other way better'}</Text>
                      </View>
                    ) : null}
                  </View>
                </SlideIn>
              </View>
              <SlideIn reduceMotion={reduceMotion} delay={350} style={[styles.tip, { backgroundColor: fbStyle[1] }]}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ marginTop: 1 }}>
                  <Path d={BULB} stroke={fbStyle[0]} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={[styles.tipText, { color: t.text }]}>{fb.tip}</Text>
              </SlideIn>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                <View style={[styles.chip, { backgroundColor: t.goldSoft }]}>
                  <Text style={[styles.chipText, { color: t.goldInk }]}>{fb.spent ? `−${fb.spent} SP` : 'Free visitor'}</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: t.pinkSoft }]}>
                  <Text style={[styles.chipText, { color: t.pinkInk }]}>{balance} SP left</Text>
                </View>
              </View>
              <View style={{ marginTop: 'auto', paddingTop: 12 }}>
                <PinkButton t={t} label={nextLabel} reduceMotion={reduceMotion} onPress={next} height={52} />
              </View>
            </Shake>
          </SlideIn>
        </>
      ) : null}

      {phase === 'end' && end ? (
        <>
          <SlideIn
            reduceMotion={reduceMotion}
            distance={-388 * k}
            style={[styles.shutter, { height: 388 * k, backgroundColor: sc.shutter1 }]}
          >
            {Array.from({ length: Math.ceil((388 * k) / 16) }, (_, i) => (
              <View
                key={i}
                style={{ position: 'absolute', left: 0, right: 0, top: i * 16 + 14, height: 2, backgroundColor: sc.shutter2 }}
              />
            ))}
            <View style={[styles.closed, { backgroundColor: sc.sign, borderColor: sc.signBorder, marginTop: 60 * k }]}>
              <Text style={[styles.closedText, { color: t.pinkInk }]}>CLOSED · SEE YOU TOMORROW</Text>
            </View>
          </SlideIn>
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 300 * k,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
              zIndex: 6,
            }}
          >
            {servedFaces.map((name, i) => (
              <WaveOnce
                key={`${name}-${i}`}
                reduceMotion={reduceMotion}
                delay={900 + i * 300}
                style={[styles.servedFace, { backgroundColor: t.surface, borderColor: t.surface }]}
              >
                <Character name={name} size={58} style={{ marginBottom: -5 }} />
              </WaveOnce>
            ))}
          </View>
          {endStars === 3 ? <Confetti colors={[t.pink, t.gold, t.green, t.pinkInk, t.goldSoft]} reduceMotion={reduceMotion} /> : null}
          <SlideIn
            reduceMotion={reduceMotion}
            distance={300}
            style={[styles.sheet, { backgroundColor: t.surface, paddingBottom: insets.bottom + 24, zIndex: 7 }]}
          >
            <StarRow t={t} count={endStars} reduceMotion={reduceMotion} big={52} small={42} baseDelay={900} />
            <Text style={[styles.endTitle, { color: t.text }]}>{endTitle}</Text>
            <Text style={[styles.endSub, { color: t.text2 }]}>
              {served} of {total} served · {spentToday ? `${spentToday} SP spent` : 'no SP spent'}
            </Text>
            <View style={{ gap: 6, marginTop: 12 }}>
              {goals.map((g, i) => {
                const done = !!end.goals?.[i];
                return (
                  <SlideIn
                    key={g}
                    reduceMotion={reduceMotion}
                    delay={1200 + i * 80}
                    style={[styles.goalRow, { backgroundColor: done ? t.greenSoft : t.orangeSoft }]}
                  >
                    <View style={[styles.goalDot, { backgroundColor: done ? t.green : t.orange }]}>
                      <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                        <Path d={done ? TICK : DASH} stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                    <Text style={[styles.goalText, { color: t.text }]}>{g}</Text>
                  </SlideIn>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <GhostButton t={t} label="Play again" onPress={playAgain} height={52} style={{ flex: 1 }} />
              <PinkButton t={t} label="Back to Spotlight" reduceMotion={reduceMotion} onPress={onExit} height={52} style={{ flex: 1.4 }} />
            </View>
            <Text style={[styles.price, { color: t.text3 }]}>
              {cost > 0
                ? freeLeft > 0
                  ? 'Your next run is free'
                  : `Next run costs ${cost} SP`
                : `Your next day starts with ${freeVisitors} free ${freeVisitors === 1 ? 'visitor' : 'visitors'}`}
            </Text>
          </SlideIn>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hud: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 8 },
  titleBox: { flex: 1, minWidth: 0, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1 },
  kicker: { fontSize: ds(9.5), fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  hudTitle: { fontFamily: FONT.serif, fontSize: 18, lineHeight: 21 },
  hearts: { flexDirection: 'row', gap: 1, height: 34, paddingHorizontal: 8, alignItems: 'center', borderRadius: 17, borderWidth: 1 },
  bubble: {
    position: 'absolute',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    zIndex: 4,
  },
  bubbleWho: { fontSize: ds(9.5), fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  clueIcon: { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  clueText: { flex: 1, fontSize: ds(10.5), fontWeight: '600', lineHeight: 13 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 18,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -10 },
    elevation: 8,
    zIndex: 7,
  },
  introFace: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  sheetTitle: { fontFamily: FONT.serif, fontSize: 26, lineHeight: 29 },
  introText: { fontSize: ds(12.5), lineHeight: 19, marginTop: 8 },
  statRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  stat: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 16, alignItems: 'center' },
  statValue: { fontFamily: FONT.serif, fontSize: 22, lineHeight: 24 },
  statLabel: { fontSize: ds(9.5), fontWeight: '700', marginTop: 3 },
  small: { fontSize: ds(9.5), fontWeight: '800', letterSpacing: 1, marginTop: 12 },
  goal: { fontSize: ds(12), fontWeight: '600' },
  error: { fontSize: ds(12), marginTop: 10, textAlign: 'center' },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  btnChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.22)' },
  btnChipText: { color: '#FFFFFF', fontSize: ds(11), fontWeight: '800' },
  packRow: { position: 'absolute', left: 0, right: 0, zIndex: 3, flexGrow: 0 },
  countBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { color: '#FFFFFF', fontSize: ds(10), fontWeight: '800' },
  pack: {
    height: 92,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packName: { fontSize: ds(9.5), fontWeight: '800', lineHeight: 12, textAlign: 'center' },
  packCost: { fontSize: ds(9.5), fontWeight: '700' },
  stock: {
    position: 'absolute',
    top: -6,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockText: { fontSize: ds(10), fontWeight: '800' },
  route: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 52, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1.5 },
  routeIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  routeLabel: { fontSize: ds(12.5), fontWeight: '800' },
  routeSub: { fontSize: ds(10), fontWeight: '600' },
  slip: { marginTop: 10, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1.5, borderStyle: 'dashed' },
  slipRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slipWho: { fontSize: ds(10), fontWeight: '700' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  tagText: { fontSize: ds(10), fontWeight: '800' },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 10,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: 14,
  },
  noteText: { flex: 1, fontSize: ds(11.5), fontWeight: '700', lineHeight: 17 },
  closeLink: { height: 30, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  closeLinkText: { fontSize: ds(11.5), fontWeight: '700', textDecorationLine: 'underline' },
  slipMain: { fontSize: ds(12.5), fontWeight: '700' },
  slipCost: { fontSize: ds(12), fontWeight: '700' },
  contents: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 5 },
  content: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  contentText: { fontSize: ds(10), fontWeight: '700' },
  rule: { height: 1, marginTop: 9, marginBottom: 7 },
  slipAfter: { fontSize: ds(11), fontWeight: '700' },
  slipTotal: { fontFamily: FONT.serif, fontSize: 20 },
  track: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 5, paddingHorizontal: 7, borderRadius: 999 },
  trackText: { fontSize: ds(9.5), fontWeight: '700' },
  burst: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  burstText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  fbFace: { width: 46, height: 46, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  speech: { fontFamily: FONT.serif, fontSize: 16, lineHeight: 21 },
  half: { flex: 1, padding: 10, borderRadius: 16 },
  need: { flex: 1, fontSize: ds(10.5), fontWeight: '600', lineHeight: 13 },
  gave: { fontSize: ds(11.5), fontWeight: '800' },
  mark: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  markText: { color: '#FFFFFF', fontSize: ds(9), fontWeight: '800' },
  tip: { marginTop: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 16, flexDirection: 'row', gap: 8 },
  tipText: { flex: 1, fontSize: ds(12), lineHeight: 18 },
  chip: { flex: 1, padding: 7, borderRadius: 12, alignItems: 'center' },
  chipText: { fontSize: ds(11), fontWeight: '800' },
  shutter: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 5, alignItems: 'center', justifyContent: 'center' },
  closed: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5 },
  closedText: { fontSize: ds(12), fontWeight: '800', letterSpacing: 1.5 },
  servedFace: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  endTitle: { fontFamily: FONT.serif, fontSize: 27, lineHeight: 32, textAlign: 'center', marginTop: 6 },
  endSub: { fontSize: ds(12.5), textAlign: 'center', marginTop: 4 },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 14 },
  goalDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  goalText: { fontSize: ds(12.5), fontWeight: '700' },
  price: { fontSize: ds(10.5), textAlign: 'center', marginTop: 8 },
});
