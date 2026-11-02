import { Animated, BackHandler, Easing, View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp } from '../../../../shared/store/AppContext.jsx';
import { A } from '../../../../shared/store/actions.js';
import { useTheme, Text, FONT } from '../../../../shared/styles/index.js';
import * as givedayApi from '../../../../shared/api/giveday.js';
import { useAnimatedValue } from '../../../dashboard/HeroCardFx.jsx';
import { PressScale, Pop, Twinkle, Bob } from '../../common/SpotlightFx.jsx';
import { friendlyError } from '../../quiz/quizLogic.js';
import { kitCost, canGive, togglePick, factIcon, productArt } from '../../games/giveday/givedayLogic.js';
import Character from '../Character.jsx';
import { spotTokens, STAR_PATH, HEART_PATH, toneOf } from '../tokens.js';
import { ds, SlideIn, Breathe, Blink } from '../motion.jsx';
import { Confetti, StarRow, Shake } from '../fx.jsx';
import { CircleButton, CoinPill, PinkButton, Glow } from '../ui.jsx';
import TownMap, { Walker, PLACE_KINDS, placeTones } from './TownMap.jsx';

const BACK = 'M15 5l-7 7 7 7';
const GIFT = 'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0';
const TICK = 'M5 12.5l4.5 4.5L19 7.5';
const HOSTS = {
  'hope-house': ['mamaRonke', 'mamaRonkeHappy'],
  'bright-school': ['teacher', 'teacherHappy'],
  'hope-camp': ['mama', 'mamaHappy'],
  'girls-fc': ['coach', 'coach'],
  'oshodi-road': ['outreach', 'outreachHappy'],
  'balogun-market': ['market', 'market'],
  'my-kit': ['you', 'youHappy'],
  'ikire-village': ['nurse', 'nurse'],
};
const BY_LOOK = { woman: ['mamaRonke', 'mamaRonkeHappy'], student: ['coach', 'coach'], girl: ['you', 'youHappy'] };
const RATING = {
  good: ['green', 'greenSoft', TICK, 'Great pick'],
  ok: ['orange', 'orangeSoft', 'M6 12h12', 'Okay'],
  poor: ['red', 'redSoft', 'M7 7l10 10M17 7L7 17', 'Not right here'],
  missed: ['orange', 'goldSoft', 'M12 7v6M12 17h.01', 'Missed'],
};

function hostOf(place, happy) {
  const pair = HOSTS[place.id] || BY_LOOK[place.hostLook] || ['you', 'youHappy'];
  return pair[happy ? 1 : 0];
}

function feel(good) {
  const done = good ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  Promise.resolve(done).catch(() => {});
}

export function roadY(place) {
  return place.y + 12;
}

export function route(cur, tx, ty) {
  const legs = [];
  let c = { x: cur.x, y: cur.y };
  const go = (x, y) => {
    if (c.x !== x || c.y !== y) {
      legs.push({ x, y });
      c = { x, y };
    }
  };
  if (c.y === ty) {
    go(tx, ty);
    return legs;
  }
  if (c.y === 627) {
    go(258, 627);
    go(258, 517);
  }
  go(195, c.y);
  if (ty === 627) {
    go(195, 517);
    go(258, 517);
    go(258, 627);
  } else {
    go(195, ty);
  }
  go(tx, ty);
  return legs;
}

function PlaceScene({ t, isDark, place, tone, tall, happy, handing, reduceMotion, k }) {
  const s = isDark
    ? { bg: ['#2A1E2A', '#241A1E'], sun: '#F5EDE9', ground: '#2E2226', window: '#F7C98A', sign: '#3A2C30' }
    : { bg: ['#FFF3EC', '#FDE7E2'], sun: '#FBF1E0', ground: '#F6DCD3', window: '#FFF0F2', sign: '#FFFFFF' };
  const h = useAnimatedValue(tall ? 420 : 236);
  useEffect(() => {
    const anim = Animated.timing(h, { toValue: tall ? 420 : 236, duration: reduceMotion ? 0 : 450, easing: Easing.bezier(0.2, 0.9, 0.3, 1), useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [tall, h, reduceMotion]);
  return (
    <Animated.View style={[styles.scene, { height: h, borderColor: t.border }]}>
      <LinearGradient colors={s.bg} style={StyleSheet.absoluteFill} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 236 }}>
        <Svg width="100%" height={236} viewBox="0 0 358 236" preserveAspectRatio="xMidYMax slice">
          <Circle cx={318} cy={40} r={16} fill={s.sun} />
          <Path d="M0 200 Q90 186 180 196 T358 192 V236 H0 Z" fill={s.ground} />
          <Rect x={168} y={78} width={166} height={122} rx={10} fill={tone[0]} />
          <Path d="M156 84 L251 34 L346 84 Z" fill={tone[1]} />
          <Rect x={236} y={140} width={32} height={60} rx={6} fill={tone[2]} />
          <Rect x={206} y={60} width={90} height={16} rx={8} fill={s.sign} />
        </Svg>
        <Blink reduceMotion={reduceMotion} style={[styles.win, { left: 186 * k, top: 104, backgroundColor: s.window }]} />
        <Blink reduceMotion={reduceMotion} delay={1200} style={[styles.win, { left: 282 * k, top: 104, backgroundColor: s.window }]} />
        <Text style={[styles.sign, { left: 206 * k, color: t.pinkInk }]} numberOfLines={1}>
          {place.name.toUpperCase()}
        </Text>
        <Breathe reduceMotion={reduceMotion} style={{ position: 'absolute', left: -10, bottom: -4 }}>
          <Character name={hostOf(place, happy || handing)} size={190} />
        </Breathe>
      </View>
      <Twinkle size={8} color={t.petal} reduceMotion={reduceMotion} style={{ left: 36, top: 56 }} />
      <Twinkle size={7} color={t.spark} delay={1000} reduceMotion={reduceMotion} style={{ left: 136, top: 32 }} />
      {!tall ? (
        <Pop delay={350} reduceMotion={reduceMotion} style={[styles.quote, { backgroundColor: t.surface }]}>
          <Text style={[styles.quoteText, { color: t.text }]}>“{place.quote}”</Text>
          <Text style={[styles.quoteWho, { color: t.text3 }]}>{place.hostName}</Text>
        </Pop>
      ) : (
        <Text style={[styles.thanksLine, { color: t.text }]}>{place.forSelf ? 'All packed!' : 'Thank you so much!'}</Text>
      )}
    </Animated.View>
  );
}

function FlyingKits({ t, count, reduceMotion }) {
  const kits = Array.from({ length: Math.min(6, Math.max(3, Math.round(count / 4))) }, (_, i) => i);
  const colors = [
    [t.petal, t.pink],
    ['#A5D8BA', '#4E9E78'],
    ['#F7D49A', '#D6A24E'],
  ];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {kits.map(i => (
        <Kit key={i} index={i} color={colors[i % 3]} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
}

function Kit({ index, color, reduceMotion }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.timing(v, { toValue: 1, duration: 1100, delay: index * 180, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [v, index, reduceMotion]);
  if (reduceMotion) return null;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: 60 + index * 46,
        bottom: 120,
        opacity: v.interpolate({ inputRange: [0, 0.2, 0.9, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, -40 - index * 30] }) },
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -330] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', index % 2 ? '12deg' : '-12deg'] }) },
        ],
      }}
    >
      <Svg width={40} height={44} viewBox="0 0 60 64">
        <Path d="M10 16 h40 l4 42 a4 4 0 0 1 -4 4 h-40 a4 4 0 0 1 -4 -4z" fill={color[0]} />
        <Path d="M10 16 h40 l-4 -10 h-32z" fill={color[1]} />
        <Path d="M30 30c0 0-7-4-7-8.5a3.5 3.5 0 0 1 7-1.8 3.5 3.5 0 0 1 7 1.8c0 4.5-7 8.5-7 8.5z" fill="#FFFFFF" opacity={0.95} />
      </Svg>
    </Animated.View>
  );
}

export default function GiveDayV2({ insets, reduceMotion, challenge, onExit, onChanged }) {
  const { state, dispatch } = useApp();
  const { isDark } = useTheme();
  const t = spotTokens(isDark);
  const tones = placeTones(isDark);
  const { width } = useWindowDimensions();
  const k = width / 390;
  const token = state.accessToken;
  const cost = challenge?.cost ?? 0;
  const [freeLeft, setFreeLeft] = useState(challenge?.freePlaysLeft ?? 0);
  const [phase, setPhase] = useState('intro');
  const [run, setRun] = useState(null);
  const [coins, setCoins] = useState(0);
  const [helped, setHelped] = useState(0);
  const [visits, setVisits] = useState({});
  const [log, setLog] = useState([]);
  const [placeId, setPlaceId] = useState(null);
  const [people, setPeople] = useState(null);
  const [picked, setPicked] = useState([]);
  const [result, setResult] = useState(null);
  const [day, setDay] = useState(null);
  const [error, setError] = useState(null);
  const [pos, setPos] = useState({ x: 195, y: 417 });
  const [walking, setWalking] = useState(false);
  const [shake, setShake] = useState(0);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = useCallback((fn, ms) => timers.current.push(setTimeout(fn, reduceMotion ? 0 : ms)), [reduceMotion]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase === 'visit') setPhase('map');
      else if (phase === 'build') setPhase('visit');
      else if (phase !== 'handover') onExit();
      return true;
    });
    return () => sub.remove();
  }, [phase, onExit]);

  const places = (run?.places || []).map(p => ({ ...p, art: PLACE_KINDS[p.id] || 'home' }));
  const place = places.find(p => p.id === placeId) || null;
  const placeIndex = place ? places.indexOf(place) : 0;
  const tone = tones[placeIndex % tones.length];
  const products = run?.products || [];
  const total = kitCost(products, picked, people);
  const unit = people ? total / people : 0;
  const over = total > coins;
  const ok = canGive(products, picked, people, coins);
  const visited = Object.keys(visits).length;
  const starsTotal = Object.values(visits).reduce((s, x) => s + x, 0);

  async function start() {
    feel(false);
    setError(null);
    setPhase('loading');
    try {
      const data = await givedayApi.startDay(token);
      if (typeof data.balance === 'number') dispatch({ type: A.POINTS_SPENT, newBalance: data.balance });
      if (data.cost === 0) setFreeLeft(n => Math.max(0, n - 1));
      setRun(data);
      setCoins(data.coins);
      setHelped(0);
      setVisits({});
      setLog([]);
      setDay(null);
      setPlaceId(null);
      setPos({ x: 195, y: 417 });
      setPhase('map');
    } catch (e) {
      setError(friendlyError(e));
      setPhase('intro');
    }
  }

  function selectPlace(p) {
    if (phase !== 'map' || walking || p.locked) return;
    feel(false);
    setPlaceId(p.id);
    const legs = route(pos, p.x + 30, roadY(p));
    if (!legs.length) return;
    setWalking(true);
    legs.forEach((leg, i) => later(() => setPos(leg), i * 430));
    later(() => setWalking(false), legs.length * 430 + 60);
  }

  function walkIn() {
    if (!place || visits[place.id] != null) return;
    setPeople(null);
    setPicked([]);
    setPhase('visit');
  }

  async function give() {
    if (!ok) {
      setShake(n => n + 1);
      return;
    }
    feel(false);
    setPhase('handover');
    setError(null);
    try {
      const out = await givedayApi.give(run.runId, place.id, people, picked, token);
      later(() => {
        setCoins(out.coins);
        setHelped(out.helped);
        setVisits(v => ({ ...v, [out.placeId]: out.stars }));
        setLog(l => [...l, { id: out.placeId, n: out.people, stars: out.stars }]);
        setResult(out);
        setPhase('result');
        feel(out.stars >= 2);
      }, 1900);
    } catch (e) {
      setError(friendlyError(e));
      setPhase('build');
    }
  }

  async function finish() {
    if (!visited) return;
    feel(false);
    setPhase('ending');
    try {
      const out = await givedayApi.finishDay(run.runId, token);
      setDay(out);
      setPhase('done');
      onChanged?.();
    } catch (e) {
      setError(friendlyError(e));
      setPhase('map');
    }
  }

  function back() {
    if (phase === 'visit') setPhase('map');
    else if (phase === 'build') setPhase('visit');
    else onExit();
  }

  const onMap = phase === 'intro' || phase === 'loading' || phase === 'map' || phase === 'ending';
  const inScene = phase === 'visit' || phase === 'handover';
  const sheetH = 210;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {onMap ? (
        <ScrollView contentContainerStyle={{ height: Math.max(700 * k + sheetH, 844 * k) }} showsVerticalScrollIndicator={false} bounces={false}>
          <TownMap t={t} isDark={isDark} k={k} height={844 * k} spots={places} onSpot={selectPlace} selId={placeId} done={visits} reduceMotion={reduceMotion} />
          {run ? <Walker t={t} m={{ meBg: isDark ? '#3A2C30' : '#FFE3C8' }} k={k} pos={pos} walking={walking} reduceMotion={reduceMotion} /> : null}
        </ScrollView>
      ) : null}

      {!onMap ? <Glow t={t} height={360} /> : null}

      {phase !== 'done' ? (
        <View style={[styles.hud, { top: insets.top + 8 }]}>
          <CircleButton t={t} icon={BACK} label={onMap ? 'Back to Spotlight' : 'Back'} onPress={back} />
          <View style={[styles.titleBox, onMap ? { backgroundColor: t.surface, borderColor: t.border } : null]}>
            <Text style={[styles.kicker, { color: t.pinkInk }]} numberOfLines={1}>
              {onMap ? 'Today' : place?.kind}
            </Text>
            <Text style={[styles.hudTitle, { color: t.text }]} numberOfLines={1}>
              {onMap ? 'Give Day' : place?.name}
            </Text>
          </View>
          <CoinPill t={t} value={run ? coins : '—'} label={`${coins} give coins left`} />
          <View style={[styles.helped, { backgroundColor: t.pinkSoft, borderColor: t.pinkBorder }]} accessibilityLabel={`${helped} people helped today`}>
            <Svg width={15} height={15} viewBox="0 0 24 24">
              <Path d={HEART_PATH} fill={t.pink} />
            </Svg>
            <Text style={[styles.helpedText, { color: t.pinkInk }]}>{helped}</Text>
          </View>
        </View>
      ) : null}

      {phase === 'intro' || phase === 'loading' ? (
        <SlideIn reduceMotion={reduceMotion} distance={300} style={[styles.sheet, { backgroundColor: t.surface, paddingBottom: insets.bottom + 24 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={[styles.face, { backgroundColor: t.greenSoft }]}>
              <Character name="mamaRonke" size={50} style={{ marginBottom: -5 }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.kicker, { color: t.pinkInk }]}>Give Day · pretend giving</Text>
              <Text style={[styles.sheetTitle, { color: t.text }]}>Ready to give?</Text>
            </View>
          </View>
          <Text style={[styles.body, { color: t.text2 }]}>
            Walk the town, meet the people at each place and build the right period kits with your give coins.
          </Text>
          {error ? <Text style={[styles.error, { color: t.pinkInk }]}>{error}</Text> : null}
          <PinkButton t={t} label="Start the day" disabled={phase === 'loading'} reduceMotion={reduceMotion} onPress={start} style={{ marginTop: 14 }}>
            <Text style={styles.btnText}>{phase === 'loading' ? 'Starting…' : 'Start the day'}</Text>
            <View style={styles.btnChip}>
              <Text style={styles.btnChipText}>{freeLeft > 0 ? 'Free try' : `${cost} SP`}</Text>
            </View>
          </PinkButton>
        </SlideIn>
      ) : null}

      {phase === 'map' || phase === 'ending' ? (
        <SlideIn reduceMotion={reduceMotion} distance={200} style={[styles.mapSheet, { backgroundColor: t.surface, borderColor: t.border, bottom: insets.bottom + 22 }]}>
          {place && phase === 'map' ? (
            <SlideIn key={place.id} reduceMotion={reduceMotion} distance={8}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.hostTile, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFE9DF' }]}>
                  <Character name={hostOf(place, false)} size={64} style={{ marginBottom: -4 }} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.kicker, { color: t.pinkInk }]}>{place.kind}</Text>
                  <Text style={[styles.placeName, { color: t.text }]}>{place.name}</Text>
                  <Text style={[styles.teaser, { color: t.text2 }]}>{place.teaser}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <PressScale onPress={() => setPlaceId(null)} accessibilityLabel="Not now">
                  <View style={[styles.notNow, { borderColor: t.border }]}>
                    <Text style={[styles.notNowText, { color: t.text2 }]}>Not now</Text>
                  </View>
                </PressScale>
                <PinkButton
                  t={t}
                  label={visits[place.id] != null ? 'Visited today' : 'Walk in'}
                  disabled={visits[place.id] != null || walking}
                  reduceMotion={reduceMotion}
                  onPress={walkIn}
                  height={50}
                  style={{ flex: 1 }}
                />
              </View>
            </SlideIn>
          ) : (
            <View>
              <Text style={[styles.mapTitle, { color: t.text }]}>Where will you give today?</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                {[
                  { value: `${visited} of ${places.length}`, label: 'places visited', bg: t.pinkSoft, ink: t.pinkInk },
                  { value: helped, label: 'people helped', bg: t.greenSoft, ink: t.greenInk },
                  { value: starsTotal, label: 'stars', bg: t.goldSoft, ink: t.goldInk },
                ].map(s => (
                  <View key={s.label} style={[styles.dayStat, { backgroundColor: s.bg }]}>
                    <Text style={[styles.dayValue, { color: s.ink }]}>{s.value}</Text>
                    <Text style={[styles.dayLabel, { color: t.text2 }]}>{s.label}</Text>
                  </View>
                ))}
              </View>
              {error ? <Text style={[styles.error, { color: t.pinkInk }]}>{error}</Text> : null}
              <PressScale onPress={finish} disabled={!visited || phase === 'ending'} accessibilityLabel="Finish the day">
                <View style={[styles.finish, { borderColor: visited ? t.pink : t.border }]}>
                  <Text style={[styles.finishText, { color: visited ? t.pinkInk : t.text3 }]}>
                    {phase === 'ending' ? 'Finishing…' : visited ? 'Finish the day' : 'Visit a place to start'}
                  </Text>
                </View>
              </PressScale>
            </View>
          )}
        </SlideIn>
      ) : null}

      {inScene && place ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: insets.top + 60, bottom: 0 }}>
          <PlaceScene t={t} isDark={isDark} place={place} tone={tone} tall={phase === 'handover'} happy={!!people} handing={phase === 'handover'} reduceMotion={reduceMotion} k={k} />
          {phase === 'visit' ? (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 110 }}>
              <SlideIn reduceMotion={reduceMotion} delay={150}>
                <Text style={[styles.placeTeaser, { color: t.text2 }]}>{place.teaser}</Text>
              </SlideIn>
              <View style={styles.facts}>
                {(place.facts || []).map((f, i) => {
                  const [bg, ink] = toneOf(t, f.tone);
                  return (
                    <SlideIn key={f.text} reduceMotion={reduceMotion} delay={250 + i * 70} style={[styles.fact, { backgroundColor: t.surface, borderColor: t.border }]}>
                      <View style={[styles.factIcon, { backgroundColor: bg }]}>
                        <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                          <Path d={factIcon(f.icon)} stroke={ink} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      </View>
                      <Text style={[styles.factText, { color: t.text }]}>{f.text}</Text>
                    </SlideIn>
                  );
                })}
              </View>
              <View style={styles.askRow}>
                <Text style={[styles.ask, { color: t.text }]}>{place.forSelf ? 'A kit for you' : `How many ${place.who} will you help?`}</Text>
                <Text style={[styles.askHint, { color: t.text3 }]}>One kit each</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                {(place.counts || []).map(n => {
                  const on = people === n;
                  const filled = Math.max(1, Math.round((n / Math.max(1, place.total)) * 3));
                  return (
                    <PressScale key={n} onPress={() => setPeople(n)} accessibilityLabel={`${n} ${place.who}`} style={{ flex: 1 }}>
                      <Pop trigger={on ? n : 0} reduceMotion={reduceMotion || !on}>
                        <View style={[styles.count, { backgroundColor: on ? t.pinkSoft : t.surface, borderColor: on ? t.pink : t.border }]}>
                          <View style={{ flexDirection: 'row', gap: 2 }}>
                            {[0, 1, 2].map(d => (
                              <View key={d} style={[styles.countDot, { backgroundColor: d < filled ? (on ? t.pink : t.petal) : t.track }]} />
                            ))}
                          </View>
                          <Text style={[styles.countNum, { color: on ? t.pinkInk : t.text }]}>{n}</Text>
                          <Text style={[styles.countLabel, { color: on ? t.pinkInk : t.text3 }]}>
                            {place.forSelf ? 'just you' : n === place.total ? 'everyone' : `${n} of ${place.total}`}
                          </Text>
                        </View>
                      </Pop>
                    </PressScale>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <FlyingKits t={t} count={people || 3} reduceMotion={reduceMotion} />
              <Text style={[styles.handing, { color: t.text2, bottom: insets.bottom + 60 }]}>Handing over {people} {people === 1 ? 'kit' : 'kits'}…</Text>
            </View>
          )}
          {phase === 'visit' ? (
            <View style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 30 }}>
              <PinkButton
                t={t}
                label={people ? (place.forSelf ? 'Build your kit' : `Build ${people} kits`) : 'Pick how many first'}
                disabled={!people}
                reduceMotion={reduceMotion}
                onPress={() => setPhase('build')}
              />
              <Text style={[styles.foot, { color: t.text3 }]}>Coins are only spent when you hand the kits over</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {phase === 'build' && place ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: insets.top + 64, bottom: 0 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 260 }}>
            <View style={{ paddingHorizontal: 18 }}>
              <Text style={[styles.buildTitle, { color: t.text }]}>{place.forSelf ? 'Build your own kit' : `One kit for each of the ${people} ${place.who}`}</Text>
              <Text style={[styles.buildSub, { color: t.text2 }]}>Tap what goes in. Every kit gets the same things.</Text>
            </View>
            <View style={styles.grid}>
              {products.map((p, i) => {
                const on = picked.includes(p.id);
                const art = productArt(p.id);
                return (
                  <SlideIn key={p.id} reduceMotion={reduceMotion} delay={i * 40} style={{ width: '48.5%' }}>
                    <PressScale onPress={() => setPicked(cur => togglePick(cur, p.id))} accessibilityLabel={`${p.name}, ${p.cost} coins`}>
                      <View style={[styles.product, { backgroundColor: on ? t.pinkSoft : t.surface, borderColor: on ? t.pink : t.border }]}>
                        <View style={[styles.productTile, { backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : '#FBF6F4' }]}>
                          <Svg width={32} height={32} viewBox="0 0 32 32">
                            <Path d={art.art} fill={art.fill} stroke={art.stroke} strokeWidth={1.6} strokeLinejoin="round" />
                            <Path d={art.detail} stroke={art.stroke} strokeWidth={1.6} strokeLinecap="round" fill="none" />
                          </Svg>
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={[styles.productName, { color: t.text }]} numberOfLines={1}>
                            {p.name}
                          </Text>
                          <Text style={[styles.productCost, { color: t.text3 }]}>
                            {p.cost} {p.cost === 1 ? 'coin a kit' : 'coins a kit'}
                          </Text>
                        </View>
                        {on ? (
                          <Pop reduceMotion={reduceMotion} style={[styles.check, { backgroundColor: t.pink }]}>
                            <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                              <Path d={TICK} stroke="#FFFFFF" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
                            </Svg>
                          </Pop>
                        ) : null}
                      </View>
                    </PressScale>
                  </SlideIn>
                );
              })}
            </View>
          </ScrollView>
          <Shake trigger={shake} reduceMotion={reduceMotion} style={[styles.budget, { backgroundColor: t.surface, borderColor: t.border, bottom: insets.bottom + 22 }]}>
            <View style={styles.budgetRow}>
              <Text style={[styles.kitLine, { color: t.text2 }]}>{unit ? `Each kit ${unit} coins × ${people}` : 'Pick at least one thing'}</Text>
              <Text style={[styles.totalLine, { color: over ? t.red : t.text }]}>
                {total} / {coins}
              </Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: t.track }]}>
              <View style={{ width: `${Math.min(100, Math.round((total / Math.max(1, coins)) * 100))}%`, height: '100%' }}>
                <LinearGradient colors={over ? [t.red, t.red] : [t.pink, t.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderRadius: 999 }} />
              </View>
            </View>
            <Text style={[styles.budgetLine, { color: over ? t.red : t.text3 }]}>
              {over
                ? `That is ${total - coins} coins too many. Take something out or help fewer people.`
                : total
                  ? `${coins - total} coins left after this give`
                  : 'Coins are shared across the whole day'}
            </Text>
            {error ? <Text style={[styles.error, { color: t.pinkInk }]}>{error}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <PressScale onPress={() => setPhase('visit')} accessibilityLabel="Back">
                <View style={[styles.notNow, { borderColor: t.border, width: 90 }]}>
                  <Text style={[styles.notNowText, { color: t.text2 }]}>Back</Text>
                </View>
              </PressScale>
              <PinkButton t={t} label="give" disabled={!ok} reduceMotion={reduceMotion} onPress={give} height={50} style={{ flex: 1 }}>
                <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                  <Path d={GIFT} stroke={ok ? '#FFFFFF' : t.disabledFg} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={[styles.btnText, { color: ok ? '#FFFFFF' : t.disabledFg, fontSize: 14 }]}>{place.forSelf ? 'Pack my kit' : `Hand over ${people || 0} kits`}</Text>
              </PinkButton>
            </View>
          </Shake>
        </View>
      ) : null}

      {phase === 'result' && result && place ? (
        <View style={StyleSheet.absoluteFill}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: t.overlay }]} />
          {result.stars === 3 ? <Confetti colors={[t.pink, t.gold, t.green, t.petal, t.goldSoft]} reduceMotion={reduceMotion} /> : null}
          <SlideIn reduceMotion={reduceMotion} distance={400} style={[styles.result, { backgroundColor: t.surface, paddingBottom: insets.bottom + 24 }]}>
            <View style={[styles.handle, { backgroundColor: t.border }]} />
            <StarRow t={t} count={result.stars} reduceMotion={reduceMotion} big={52} small={42} />
            <Text style={[styles.resultTitle, { color: t.text }]}>{result.title}</Text>
            <View style={[styles.thanks, { backgroundColor: t.pinkSoft }]}>
              <View style={[styles.thanksFace, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFE9DF' }]}>
                <Character name={hostOf(place, true)} size={54} style={{ marginBottom: -4 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.thanksText, { color: t.text }]}>“{result.thanks}”</Text>
                <Text style={[styles.quoteWho, { color: t.text3 }]}>{place.hostName}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
              <View style={[styles.resChip, { backgroundColor: t.pinkSoft }]}>
                <Text style={[styles.resChipText, { color: t.pinkInk }]}>
                  +{result.people} {place.who} helped
                </Text>
              </View>
              <View style={[styles.resChip, { backgroundColor: t.goldSoft }]}>
                <Text style={[styles.resChipText, { color: t.goldInk }]}>{result.spent} coins given</Text>
              </View>
            </View>
            <Text style={[styles.gaveLabel, { color: t.text3 }]}>WHAT YOU GAVE</Text>
            <ScrollView style={{ maxHeight: 250 }} contentContainerStyle={{ gap: 6 }}>
              {[...(result.review || []), ...(result.missed || []).map(m => ({ ...m, rating: 'missed' }))].map((r, i) => {
                const st = RATING[r.rating] || RATING.ok;
                return (
                  <SlideIn key={`${r.productId}-${r.rating}`} reduceMotion={reduceMotion} delay={700 + i * 60} style={[styles.reviewRow, { backgroundColor: t[st[1]] }]}>
                    <View style={[styles.reviewDot, { backgroundColor: t[st[0]] }]}>
                      <Svg width={11} height={11} viewBox="0 0 24 24" fill="none">
                        <Path d={st[2]} stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                      </Svg>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.reviewName, { color: t.text }]}>
                        {st[3]}: {r.name}
                      </Text>
                      {r.why ? <Text style={[styles.reviewWhy, { color: t.text2 }]}>{r.why}</Text> : null}
                    </View>
                  </SlideIn>
                );
              })}
            </ScrollView>
            <PinkButton
              t={t}
              label="Back to the map"
              reduceMotion={reduceMotion}
              onPress={() => {
                setPlaceId(null);
                setPhase('map');
              }}
              height={52}
              style={{ marginTop: 14 }}
            />
          </SlideIn>
        </View>
      ) : null}

      {phase === 'done' ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: t.bg }]}>
          <Glow t={t} height={420} />
          <Confetti colors={[t.pink, t.gold, t.green, t.petal, t.goldSoft]} reduceMotion={reduceMotion} />
          <ScrollView contentContainerStyle={{ paddingTop: insets.top + 50, paddingBottom: insets.bottom + 120 }}>
            <View style={{ alignItems: 'center' }}>
              <SlideIn reduceMotion={reduceMotion}>
                <Bob distance={4} duration={3000} reduceMotion={reduceMotion}>
                  <Svg width={150} height={110} viewBox="0 0 150 110">
                    <Path d="M0 96 Q75 80 150 96 V110 H0 Z" fill={isDark ? '#1C2420' : '#E6F2E9'} />
                    <Rect x={18} y={56} width={40} height={40} rx={5} fill={isDark ? '#4A3438' : '#FFFFFF'} />
                    <Path d="M12 58 L38 36 L64 58 Z" fill={t.pink} />
                    <Rect x={92} y={62} width={40} height={34} rx={5} fill={isDark ? '#4A3438' : '#FFFFFF'} />
                    <Path d="M86 64 L112 44 L138 64 Z" fill={isDark ? '#C28A33' : '#E2B86A'} />
                    <Path d="M75 40c0 0-14-8-14-17a7.5 7.5 0 0 1 14-3.8 7.5 7.5 0 0 1 14 3.8c0 9-14 17-14 17z" fill={t.pink} />
                  </Svg>
                </Bob>
              </SlideIn>
              <SlideIn reduceMotion={reduceMotion} delay={100}>
                <Text style={[styles.doneTitle, { color: t.text }]}>Day done!</Text>
              </SlideIn>
              <Text style={[styles.body, { color: t.text2, textAlign: 'center' }]}>
                You gave at {visited} {visited === 1 ? 'place' : 'places'} today.
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingTop: 18 }}>
              {[
                { value: day?.helped ?? helped, label: 'people helped', ink: t.pinkInk },
                { value: day?.stars ?? starsTotal, label: 'stars', ink: t.goldInk },
                { value: day?.coins ?? coins, label: 'coins left', ink: t.greenInk },
              ].map((s, i) => (
                <SlideIn key={s.label} reduceMotion={reduceMotion} delay={200 + i * 80} style={[styles.doneStat, { backgroundColor: t.surface, borderColor: t.border }]}>
                  <Text style={[styles.doneValue, { color: s.ink }]}>{s.value}</Text>
                  <Text style={[styles.dayLabel, { color: t.text2 }]}>{s.label}</Text>
                </SlideIn>
              ))}
            </View>
            <View style={[styles.doneList, { backgroundColor: t.surface, borderColor: t.border }]}>
              {log.map((l, i) => {
                const p = places.find(x => x.id === l.id);
                return (
                  <SlideIn key={l.id} reduceMotion={reduceMotion} delay={300 + i * 80} style={[styles.doneRow, { borderBottomColor: i === log.length - 1 ? 'transparent' : t.border }]}>
                    <Text style={[styles.doneName, { color: t.text }]}>{p?.name}</Text>
                    <Text style={[styles.donePeople, { color: t.text3 }]}>
                      {l.n} {p?.who}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 1 }}>
                      {[0, 1, 2].map(n => (
                        <Svg key={n} width={12} height={12} viewBox="0 0 24 24">
                          <Path d={STAR_PATH} fill={n < l.stars ? t.gold : t.starOff} />
                        </Svg>
                      ))}
                    </View>
                  </SlideIn>
                );
              })}
            </View>
          </ScrollView>
          <View style={{ position: 'absolute', left: 18, right: 18, bottom: insets.bottom + 30 }}>
            <PinkButton t={t} label="Back to Spotlight" reduceMotion={reduceMotion} onPress={onExit} />
            <Text style={[styles.foot, { color: t.text3 }]}>{freeLeft > 0 ? 'Your next Give Day is free' : `Next Give Day costs ${cost} SP`}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hud: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 10 },
  titleBox: { flex: 1, minWidth: 0, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1, borderColor: 'transparent' },
  kicker: { fontSize: ds(9.5), fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  hudTitle: { fontFamily: FONT.serif, fontSize: 19, lineHeight: 22 },
  helped: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 34, paddingLeft: 8, paddingRight: 10, borderRadius: 17, borderWidth: 1 },
  helpedText: { fontSize: ds(13), fontWeight: '800' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 18, paddingHorizontal: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, zIndex: 9, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 30, shadowOffset: { width: 0, height: -10 }, elevation: 8 },
  face: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  sheetTitle: { fontFamily: FONT.serif, fontSize: 26, lineHeight: 29 },
  body: { fontSize: ds(12.5), lineHeight: 19, marginTop: 8 },
  error: { fontSize: ds(12), marginTop: 10, textAlign: 'center' },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  btnChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.22)' },
  btnChipText: { color: '#FFFFFF', fontSize: ds(11), fontWeight: '800' },
  mapSheet: { position: 'absolute', left: 12, right: 12, padding: 14, borderRadius: 26, borderWidth: 1, zIndex: 9, shadowColor: '#C04E68', shadowOpacity: 0.1, shadowRadius: 30, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  hostTile: { width: 60, height: 60, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  placeName: { fontSize: ds(15), fontWeight: '800' },
  teaser: { fontSize: ds(11), lineHeight: 15, marginTop: 2 },
  notNow: { width: 96, height: 50, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  notNowText: { fontSize: ds(13), fontWeight: '700' },
  mapTitle: { fontFamily: FONT.serif, fontSize: 20 },
  dayStat: { flex: 1, padding: 8, borderRadius: 14 },
  dayValue: { fontFamily: FONT.serif, fontSize: 20, lineHeight: 22 },
  dayLabel: { fontSize: ds(9.5), fontWeight: '700', marginTop: 3 },
  finish: { height: 46, marginTop: 10, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  finishText: { fontSize: ds(13), fontWeight: '800' },
  scene: { marginHorizontal: 16, borderRadius: 28, borderWidth: 1, overflow: 'hidden' },
  win: { position: 'absolute', width: 34, height: 28, borderRadius: 6 },
  sign: { position: 'absolute', top: 61, width: 90, textAlign: 'center', fontSize: ds(8), fontWeight: '800', letterSpacing: 0.8 },
  quote: { position: 'absolute', left: 150, right: 12, top: 14, paddingVertical: 9, paddingHorizontal: 11, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomRightRadius: 16, borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  quoteText: { fontFamily: FONT.serif, fontSize: 13.5, lineHeight: 18 },
  quoteWho: { fontSize: ds(9.5), fontWeight: '700', marginTop: 4 },
  thanksLine: { position: 'absolute', right: 12, top: 20, left: 150, textAlign: 'right', fontFamily: FONT.serif, fontSize: 15 },
  placeTeaser: { fontSize: ds(13), lineHeight: 20, marginTop: 12 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8, marginTop: 12 },
  fact: { width: '48.5%', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1 },
  factIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  factText: { flex: 1, fontSize: ds(11), fontWeight: '600', lineHeight: 14 },
  askRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 18 },
  ask: { flex: 1, fontFamily: FONT.serif, fontSize: 19 },
  askHint: { fontSize: ds(10.5), fontWeight: '600' },
  count: { height: 92, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 4 },
  countDot: { width: 7, height: 7, borderRadius: 4 },
  countNum: { fontFamily: FONT.serif, fontSize: 28, lineHeight: 30 },
  countLabel: { fontSize: ds(10), fontWeight: '700' },
  foot: { fontSize: ds(10.5), textAlign: 'center', marginTop: 8 },
  handing: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: ds(12), fontWeight: '700' },
  buildTitle: { fontFamily: FONT.serif, fontSize: 22, lineHeight: 26 },
  buildSub: { fontSize: ds(11.5), marginTop: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8, paddingHorizontal: 16, paddingTop: 12 },
  product: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 62, paddingLeft: 8, paddingRight: 10, borderRadius: 18, borderWidth: 1.5 },
  productTile: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  productName: { fontSize: ds(12), fontWeight: '700' },
  productCost: { fontSize: ds(10), fontWeight: '600', marginTop: 1 },
  check: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  budget: { position: 'absolute', left: 12, right: 12, padding: 14, borderRadius: 26, borderWidth: 1, shadowColor: '#C04E68', shadowOpacity: 0.1, shadowRadius: 30, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  kitLine: { fontSize: ds(11.5), fontWeight: '700' },
  totalLine: { fontFamily: FONT.serif, fontSize: 22 },
  barTrack: { height: 8, borderRadius: 999, overflow: 'hidden', marginTop: 8 },
  budgetLine: { fontSize: ds(10.5), fontWeight: '600', marginTop: 6 },
  result: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '92%', paddingTop: 14, paddingHorizontal: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  handle: { width: 40, height: 5, borderRadius: 999, alignSelf: 'center', marginBottom: 12 },
  resultTitle: { fontFamily: FONT.serif, fontSize: 26, lineHeight: 31, textAlign: 'center', marginTop: 8 },
  thanks: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, padding: 10, borderRadius: 18 },
  thanksFace: { width: 48, height: 48, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  thanksText: { fontFamily: FONT.serif, fontSize: 14, lineHeight: 18 },
  resChip: { flex: 1, padding: 8, borderRadius: 14, alignItems: 'center' },
  resChipText: { fontSize: ds(11), fontWeight: '800' },
  gaveLabel: { fontSize: ds(9.5), fontWeight: '800', letterSpacing: 1, marginTop: 14, marginBottom: 6 },
  reviewRow: { flexDirection: 'row', gap: 10, paddingVertical: 9, paddingHorizontal: 10, borderRadius: 14 },
  reviewDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  reviewName: { fontSize: ds(12), fontWeight: '700' },
  reviewWhy: { fontSize: ds(10.5), lineHeight: 15, marginTop: 1 },
  doneTitle: { fontFamily: FONT.serif, fontSize: 32, lineHeight: 36, marginTop: 14, textAlign: 'center' },
  doneStat: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 18, borderWidth: 1, alignItems: 'center' },
  doneValue: { fontFamily: FONT.serif, fontSize: 28, lineHeight: 30 },
  doneList: { marginHorizontal: 18, marginTop: 14, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1 },
  doneName: { flex: 1, fontSize: ds(12.5), fontWeight: '700' },
  donePeople: { fontSize: ds(10.5) },
});
