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
import { PressScale, Pop, Twinkle, Bob } from '../../common/motion/effects.jsx';
import { gameError } from '../../common/wording.js';
import {
  giftCost,
  canGive,
  giftSplit,
  tripPrice,
  togglePick,
  factIcon,
  productArt,
  clockLabel,
  kmBetween,
  levelInfo,
  playerLevel,
  nextLevel,
  isAreaLocked,
  freeLevels,
  homeGroups,
  mapRings,
  kindIcon,
  travelIcon,
} from './givedayLogic.js';
import { ZOOMS } from './lagosShapes.js';
import Character from '../../common/characters/Character.jsx';
import { spotTokens, STAR_PATH, toneOf } from '../../common/style/tokens.js';
import { ds, SlideIn, Breathe, Blink } from '../../common/motion/motion.jsx';
import { Confetti, StarRow, Shake } from '../../common/motion/rewardFx.jsx';
import { CircleButton, SpPill, PinkButton, GhostButton, Glow } from '../../common/ui/buttons.jsx';
import LagosMap from './LagosMap.jsx';

const BACK = 'M15 5l-7 7 7 7';
const GIFT = 'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0';
const TICK = 'M5 12.5l4.5 4.5L19 7.5';
const CLOSE = 'M6 6l12 12M18 6L6 18';
const CLOCK = 'M12 7.5V12l3 2';
const HOSTS = {
  teacher: ['teacher', 'teacherHappy'],
  mamaRonke: ['mamaRonke', 'mamaRonkeHappy'],
  mama: ['mama', 'mamaHappy'],
  woman: ['mama', 'mamaHappy'],
  coach: ['coach', 'coach'],
  outreach: ['outreach', 'outreachHappy'],
  market: ['market', 'market'],
  nurse: ['nurse', 'nurse'],
};
const RATING = {
  good: ['green', 'greenSoft', TICK, 'Great pick'],
  ok: ['orange', 'orangeSoft', 'M6 12h12', 'Okay'],
  poor: ['red', 'redSoft', 'M7 7l10 10M17 7L7 17', 'Not right here'],
  missed: ['orange', 'goldSoft', 'M12 7v6M12 17h.01', 'Missed'],
};

function placeTones(isDark) {
  return isDark
    ? [
        ['#4A3438', '#E2647C', '#5E3E46'],
        ['#3E3A2E', '#C28A33', '#5A4A30'],
        ['#2E3A34', '#6BBF9B', '#3E5246'],
        ['#3A3040', '#F2A0AE', '#4A3A44'],
      ]
    : [
        ['#FFFFFF', '#F2A0AE', '#E8C3BC'],
        ['#FFF6EE', '#E2B86A', '#D9B68A'],
        ['#F3FAF5', '#8FCBA9', '#B7DFC8'],
        ['#FFF0F2', '#DC5A74', '#E8C3BC'],
      ];
}

function hostOf(place, happy) {
  const pair = place.forSelf ? ['you', 'youHappy'] : HOSTS[place.hostLook] || HOSTS.woman;
  return pair[happy ? 1 : 0];
}

function feel(good) {
  const done = good
    ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  Promise.resolve(done).catch(() => {});
}

function legTime(from, to, zoom, mode) {
  const px = Math.hypot(to.x - from.x, to.y - from.y) * ZOOMS[zoom];
  const speed = mode === 'walk' ? 6 : mode === 'bike' ? 3.5 : 2;
  return Math.min(2800, Math.max(500, Math.round(px * speed)));
}

function PlaceScene({ t, isDark, place, tone, tall, happy, handing, reduceMotion, k }) {
  const s = isDark
    ? { bg: ['#2A1E2A', '#241A1E'], sun: '#F5EDE9', ground: '#2E2226', window: '#F7C98A', sign: '#3A2C30' }
    : { bg: ['#FFF3EC', '#FDE7E2'], sun: '#FBF1E0', ground: '#F6DCD3', window: '#FFF0F2', sign: '#FFFFFF' };
  const h = useAnimatedValue(tall ? 420 : 236);
  useEffect(() => {
    const anim = Animated.timing(h, {
      toValue: tall ? 420 : 236,
      duration: reduceMotion ? 0 : 450,
      easing: Easing.bezier(0.2, 0.9, 0.3, 1),
      useNativeDriver: false,
    });
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
          <Character name={hostOf(place, happy || handing)} size={190} asViewer={!!place.forSelf} />
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
    const anim = Animated.timing(v, {
      toValue: 1,
      duration: 1100,
      delay: index * 180,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    });
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

export default function GiveDay({ insets, reduceMotion, challenge, onExit, onChanged }) {
  const { state, dispatch } = useApp();
  const { isDark } = useTheme();
  const t = spotTokens(isDark);
  const tones = placeTones(isDark);
  const { width } = useWindowDimensions();
  const token = state.accessToken;
  const balance = state.femPoints || 0;
  const cost = challenge?.cost ?? 0;
  const [freeLeft, setFreeLeft] = useState(challenge?.freePlaysLeft ?? 0);
  const [phase, setPhase] = useState('intro');
  const [run, setRun] = useState(null);
  const [areas, setAreas] = useState([]);
  const [homeId, setHomeId] = useState(null);
  const [pos, setPos] = useState(null);
  const [legMs, setLegMs] = useState(0);
  const [ride, setRide] = useState(null);
  const [walking, setWalking] = useState(false);
  const [clock, setClock] = useState(0);
  const [stars, setStars] = useState(0);
  const [helped, setHelped] = useState(0);
  const [visits, setVisits] = useState({});
  const [log, setLog] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState(null);
  const [sel, setSel] = useState(null);
  const [trips, setTrips] = useState(null);
  const [mode, setMode] = useState(null);
  const [here, setHere] = useState(null);
  const [picked, setPicked] = useState([]);
  const [result, setResult] = useState(null);
  const [repacking, setRepacking] = useState(false);
  const [day, setDay] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(0);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const changeZoom = useCallback(d => setZoom(z => Math.min(ZOOMS.length - 1, Math.max(0, z + d))), []);
  const later = useCallback((fn, ms) => timers.current.push(setTimeout(fn, reduceMotion ? 0 : ms)), [reduceMotion]);

  const levels = run?.levels || [];
  const products = run?.products || [];
  const travelModes = run?.travel || [];
  const levelNow = playerLevel(levels, stars);
  const nx = nextLevel(levels, stars);
  const widest = levels.length ? Math.max(...levels.map(l => l.radiusKm)) : 0;
  const home = areas.find(a => a.id === homeId) || null;
  const shownAreas = areas.map(a => ({ ...a, locked: isAreaLocked(levels, a, stars) }));
  const visited = Object.keys(visits).length;
  const travelled = !!here || visited > 0;
  const closesBy = p => Math.min(p.closes, run?.dayEnd ?? p.closes);
  const shut = p => clock + (run?.visitMinutes || 0) > closesBy(p);
  const areaOf = id => areas.find(a => a.id === id);
  const areaLocked = !!area && !area.loading && stars < (area.starsNeeded || 0);

  function backToMap() {
    setSel(null);
    setPicked([]);
    setResult(null);
    setRepacking(false);
    setPhase('map');
  }

  function back() {
    if (phase === 'visit') setPhase('map');
    else if (phase === 'build' && repacking) {
      setRepacking(false);
      setPhase('result');
    } else if (phase === 'build') setPhase('visit');
    else if (phase === 'result') backToMap();
    else if (phase === 'home' && homeId) setPhase('map');
    else if (phase === 'map' && sel) setSel(null);
    else if (phase === 'map' && area) setArea(null);
    else if (phase !== 'handover' && phase !== 'ending') onExit();
  }

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      back();
      return true;
    });
    return () => sub.remove();
  });

  async function start() {
    feel(false);
    setError(null);
    setPhase('loading');
    try {
      const data = await givedayApi.startDay(token);
      if (typeof data.balance === 'number') dispatch({ type: A.POINTS_SPENT, newBalance: data.balance });
      if (data.cost === 0) setFreeLeft(n => Math.max(0, n - 1));
      setRun(data);
      setAreas(data.areas || []);
      setHomeId(data.home);
      setPos(data.home ? { x: data.x, y: data.y } : null);
      setLegMs(0);
      setClock(data.clock);
      setStars(data.stars);
      setHelped(0);
      setVisits({});
      setLog([]);
      setDay(null);
      setArea(null);
      setSel(null);
      setHere(null);
      setPhase(data.home ? 'map' : 'home');
    } catch (e) {
      setError(gameError(e));
      setPhase('intro');
    }
  }

  async function pickHome(id) {
    if (busy) return;
    feel(false);
    setBusy(true);
    setError(null);
    try {
      const out = await givedayApi.setHome(id, token);
      setAreas(out.areas || []);
      setHomeId(out.home);
      if (!travelled) {
        setLegMs(0);
        setPos({ x: out.x, y: out.y });
      }
      setArea(null);
      setSel(null);
      setPhase('map');
    } catch (e) {
      setError(gameError(e));
    } finally {
      setBusy(false);
    }
  }

  async function openArea(a) {
    if (walking) return;
    feel(false);
    setSel(null);
    setError(null);
    setArea({ areaId: a.id, name: a.name, level: a.level, loading: true, places: [] });
    try {
      const data = await givedayApi.loadArea(run.runId, a.id, token);
      setArea(cur => (cur && cur.areaId === a.id ? data : cur));
    } catch (e) {
      setError(gameError(e));
      setArea(null);
    }
  }

  async function selectPlace(p) {
    if (!area || area.loading || areaLocked || p.locked || visits[p.id] != null || shut(p)) return;
    feel(false);
    setSel(p);
    setTrips(null);
    setError(null);
    if (here === p.id) return;
    try {
      const data = await givedayApi.loadTrips(run.runId, p.id, token);
      const best = data.quotes.find(q => q.open && tripPrice(data, q) <= balance) || data.quotes[0];
      setTrips(data);
      setMode(best ? best.mode : null);
    } catch (e) {
      setError(gameError(e));
    }
  }

  async function go() {
    if (!sel || walking || busy) return;
    if (here === sel.id) {
      setPicked([]);
      setPhase('visit');
      return;
    }
    const quote = trips?.quotes.find(q => q.mode === mode);
    const price = tripPrice(trips, quote);
    if (!quote || !quote.open || !trips.levelOpen || price > balance) {
      setShake(n => n + 1);
      return;
    }
    feel(false);
    setBusy(true);
    setError(null);
    try {
      const out = await givedayApi.travel(run.runId, sel.id, mode, token);
      if (out.spent > 0 && typeof out.balance === 'number') dispatch({ type: A.POINTS_SPENT, newBalance: out.balance });
      if (trips.passNeeded) {
        setArea(cur => (cur && cur.level === trips.level ? { ...cur, passNeeded: false } : cur));
      }
      const ms = legTime(pos, { x: out.x, y: out.y }, zoom, out.mode);
      setWalking(true);
      setRide(out.mode === 'walk' ? null : out.mode);
      setLegMs(ms);
      setPos({ x: out.x, y: out.y });
      later(() => {
        setWalking(false);
        setRide(null);
        setClock(out.clock);
        setHere(out.placeId);
        feel(true);
      }, ms + 80);
    } catch (e) {
      setError(gameError(e));
    } finally {
      setBusy(false);
    }
  }

  async function give() {
    const split = giftSplit(giftCost(products, picked), area?.giftBudget ?? 0, area?.giftMax ?? 0, !!area?.extrasFree);
    if (!canGive(products, picked, split.limit)) {
      setShake(n => n + 1);
      return;
    }
    const refund = repacking ? result?.giftPaid || 0 : 0;
    if (split.pay > balance + refund) {
      setShake(n => n + 1);
      setError(`You need ${split.pay} SP for the extra gifts. Take something out or earn more SP.`);
      return;
    }
    feel(false);
    setPhase('handover');
    setError(null);
    try {
      const again = repacking;
      const out = await givedayApi.give(run.runId, sel.id, picked, token, again);
      later(() => {
        const levelBefore = levelNow;
        if ((out.giftPaid > 0 || out.refunded > 0) && typeof out.balance === 'number')
          dispatch({ type: A.POINTS_SPENT, newBalance: out.balance });
        setVisits(v => ({ ...v, [out.placeId]: out.stars }));
        setHelped(out.helped);
        setClock(out.clock);
        setStars(out.playerStars);
        if (!again) setAreas(list => list.map(a => (a.id === area.areaId ? { ...a, visited: a.visited + 1 } : a)));
        setArea(cur => (cur ? { ...cur, places: cur.places.map(p => (p.id === out.placeId ? { ...p, stars: out.stars } : p)) } : cur));
        setLog(l => [
          ...l.filter(x => x.id !== out.placeId),
          { id: out.placeId, name: sel.name, areaName: area.name, who: sel.who, n: out.people, stars: out.stars, forSelf: sel.forSelf },
        ]);
        setRepacking(false);
        setResult(out);
        setPhase('result');
        feel(out.stars >= 2);
        if (out.level > levelBefore) {
          later(() => setToast(out.level), 400);
          later(() => setToast(null), 3800);
        }
      }, 1900);
    } catch (e) {
      setError(gameError(e));
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
      setArea(null);
      setSel(null);
      setPhase('done');
      onChanged?.();
    } catch (e) {
      setError(gameError(e));
      setPhase('map');
    }
  }

  const onMap = phase === 'map' || phase === 'ending';
  const inScene = phase === 'visit' || phase === 'handover';
  const placeIndex =
    sel && area
      ? Math.max(
          0,
          area.places.findIndex(p => p.id === sel.id),
        )
      : 0;
  const tone = tones[placeIndex % tones.length];
  const gift = area?.giftBudget ?? 0;
  const unit = giftCost(products, picked);
  const extrasFree = !!area?.extrasFree;
  const split = giftSplit(unit, gift, area?.giftMax ?? 0, extrasFree);
  const over = split.over;
  const ok = canGive(products, picked, split.limit) && split.pay <= balance;
  const freeNums = freeLevels(levels);
  const freeModes = travelModes.filter(m => !m.cost).map(m => m.label);
  const focus = walking || !sel ? (area && !walking ? areaOf(area.areaId) : pos) : sel;
  const late = run ? clock >= run.dayEnd - 120 : false;

  const quote = trips?.quotes.find(q => q.mode === mode) || null;
  const price = tripPrice(trips, quote);
  const isHere = sel && here === sel.id;
  const visitedSel = sel && visits[sel.id] != null;
  const shutNow = sel && shut(sel);
  let goLabel = 'Walk in';
  let blocked = false;
  if (sel) {
    if (visitedSel) {
      goLabel = 'Visited today';
      blocked = true;
    } else if (shutNow && !isHere) {
      goLabel = 'Closed for today';
      blocked = true;
    } else if (!isHere) {
      if (!trips || !quote) {
        goLabel = 'Checking the way…';
        blocked = true;
      } else if (!trips.levelOpen) {
        goLabel = `Win ${trips.starsNeeded} stars to go here`;
        blocked = true;
      } else if (!quote.open) {
        goLabel = 'Closed by the time you arrive';
        blocked = true;
      } else if (price > balance) {
        goLabel = 'Not enough SP';
        blocked = true;
      } else {
        goLabel = `${trips.passNeeded ? `Day pass + ${quote.label.toLowerCase()}` : `${quote.label} there`} · ${price ? `${price} SP` : 'free'}`;
      }
    }
  }
  const closesLine = !sel
    ? ''
    : shutNow && !visitedSel && !isHere
      ? `Closed at ${clockLabel(sel.closes)}`
      : isHere
        ? `You’re here · open till ${clockLabel(sel.closes)}`
        : `Open till ${clockLabel(sel.closes)}${trips?.passNeeded ? ` · level ${trips.level} day pass ${trips.passCost} SP` : ''}`;
  const closesColor = shutNow && !isHere ? t.red : isHere ? t.greenInk : t.goldInk;

  let areaNote = '';
  if (area && !area.loading) {
    if (areaLocked) areaNote = `Win ${area.starsNeeded} Give Day stars to open level ${area.level}. You have ${stars}.`;
    else if (area.passNeeded)
      areaNote = `Level ${area.level} needs a ${area.passCost} SP day pass. ${area.giftBudget} SP of gifts free at each stop, add more up to ${area.giftMax} SP with your SP.`;
    else
      areaNote = `${area.giftBudget} SP of gifts free at each stop, up to ${area.giftMax} SP ${area.extrasFree ? 'with travel and extras free on this level' : 'with your SP'} · ${area.passCost ? 'day pass bought' : 'free level'}`;
  }
  const areaMeta = area ? areaOf(area.areaId) : null;
  const areaLine = areaMeta
    ? `${areaMeta.region} · ${home ? `${kmBetween(home, areaMeta, run.unitsPerKm)} km from home · ` : ''}level ${area.level}`
    : '';
  const levelLine = `${levelInfo(levels, levelNow)?.name || ''} · ${
    nx
      ? `${stars} of ${nx.starsNeeded} stars to open level ${nx.number} (${nx.radiusKm < widest ? `up to ${nx.radiusKm} km` : 'all of Lagos'}${nx.passCost ? `, day pass ${nx.passCost} SP` : ', free'})`
      : 'all of Lagos is open to you'
  }`;
  const levelPct = nx ? Math.min(100, Math.round((stars / Math.max(1, nx.starsNeeded)) * 100)) : 100;
  const freeLine = levels.length
    ? `Home: ${home?.name || ''}. ${freeNums.length ? `Level${freeNums.length > 1 ? 's' : ''} ${freeNums.join(' and ')} ${freeNums.length > 1 ? 'are' : 'is'} free, with ${levels[0].giftBudget} SP of gifts free at each stop; add more with SP.` : ''}${freeModes.length ? ` ${freeModes.join(' and ')} is free; faster ways get you there before closing.` : ''}`
    : '';
  const toastLevel = toast ? levelInfo(levels, toast) : null;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {onMap && run ? (
        <LagosMap
          t={t}
          isDark={isDark}
          zoom={zoom}
          onZoom={changeZoom}
          areas={shownAreas}
          home={home}
          pos={pos}
          legMs={legMs}
          ride={ride}
          walking={walking}
          selId={area?.areaId}
          onArea={openArea}
          rings={mapRings(levels)}
          levelNow={levelNow}
          unitsPerKm={run.unitsPerKm}
          focus={focus}
          topPad={insets.top + 70}
          bottomPad={330}
          reduceMotion={reduceMotion}
        />
      ) : null}

      {!onMap ? <Glow t={t} height={360} /> : null}

      {phase !== 'done' ? (
        <View style={[styles.hud, { top: insets.top + 8 }]}>
          <CircleButton t={t} icon={BACK} label={onMap ? 'Back to Spotlight' : 'Back'} onPress={back} />
          <View style={[styles.titleBox, onMap || phase === 'home' ? { backgroundColor: t.surface, borderColor: t.border } : null]}>
            <Text style={[styles.kicker, { color: t.pinkInk }]} numberOfLines={1}>
              {inScene || phase === 'build' ? `${sel?.kind || ''} · ${area?.name || ''}` : 'Today'}
            </Text>
            <Text style={[styles.hudTitle, { color: t.text }]} numberOfLines={1}>
              {inScene || phase === 'build' ? sel?.name : 'Give Day'}
            </Text>
          </View>
          {run ? (
            <View
              style={[styles.clock, { backgroundColor: late ? t.orangeSoft : t.surface, borderColor: t.border }]}
              accessibilityLabel={`Time now ${clockLabel(clock)}`}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={8.5} stroke={late ? t.orange : t.text2} strokeWidth={2} />
                <Path d={CLOCK} stroke={late ? t.orange : t.text2} strokeWidth={2} strokeLinecap="round" />
              </Svg>
              <Text style={[styles.clockText, { color: late ? t.orange : t.text }]}>{clockLabel(clock)}</Text>
            </View>
          ) : null}
          <SpPill t={t} balance={balance} reduceMotion={reduceMotion} height={34} />
        </View>
      ) : null}

      {onMap ? (
        <View style={[styles.zoomCol, { top: insets.top + 62 }]}>
          {[
            ['+', 'Zoom in', 1],
            ['−', 'Zoom out', -1],
          ].map(([sign, label, d]) => (
            <PressScale key={label} onPress={() => changeZoom(d)} accessibilityLabel={label}>
              <View style={[styles.zoomBtn, { backgroundColor: t.surface, borderColor: t.border }]}>
                <Text style={[styles.zoomText, { color: t.text }]}>{sign}</Text>
              </View>
            </PressScale>
          ))}
        </View>
      ) : null}

      {toastLevel && onMap ? (
        <SlideIn reduceMotion={reduceMotion} distance={-12} style={[styles.toast, { top: insets.top + 62, backgroundColor: t.text }]}>
          <View style={[styles.toastStar, { backgroundColor: t.gold }]}>
            <Svg width={16} height={16} viewBox="0 0 24 24">
              <Path d={STAR_PATH} fill="#FFFFFF" />
            </Svg>
          </View>
          <Text style={[styles.toastText, { color: t.bg }]}>
            Level {toastLevel.number} is open!{' '}
            {toastLevel.radiusKm < widest ? `Places up to ${toastLevel.radiusKm} km away.` : 'All of Lagos.'}
          </Text>
        </SlideIn>
      ) : null}

      {phase === 'intro' || phase === 'loading' ? (
        <SlideIn
          reduceMotion={reduceMotion}
          distance={300}
          style={[styles.sheet, { backgroundColor: t.surface, paddingBottom: insets.bottom + 24 }]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={[styles.face, { backgroundColor: t.greenSoft }]}>
              <Character name="mamaRonke" size={50} style={{ marginBottom: -5 }} asViewer />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.kicker, { color: t.pinkInk }]}>Give Day · pretend giving</Text>
              <Text style={[styles.sheetTitle, { color: t.text }]}>Ready to give?</Text>
            </View>
          </View>
          <Text style={[styles.body, { color: t.text2 }]}>
            Travel across Lagos, meet the people at each place and build the right period gift before they close.
          </Text>
          {error ? <Text style={[styles.error, { color: t.pinkInk }]}>{error}</Text> : null}
          <PinkButton
            t={t}
            label="Start the day"
            disabled={phase === 'loading'}
            reduceMotion={reduceMotion}
            onPress={start}
            style={{ marginTop: 14 }}
          >
            <Text style={styles.btnText}>{phase === 'loading' ? 'Starting…' : 'Start the day'}</Text>
            <View style={styles.btnChip}>
              <Text style={styles.btnChipText}>{!cost ? 'Free' : freeLeft > 0 ? 'Free try' : `${cost} SP`}</Text>
            </View>
          </PinkButton>
        </SlideIn>
      ) : null}

      {phase === 'home' ? (
        <ScrollView
          style={StyleSheet.absoluteFill}
          contentContainerStyle={{ paddingTop: insets.top + 70, paddingHorizontal: 16, paddingBottom: insets.bottom + 30 }}
        >
          <Text style={[styles.homeTitle, { color: t.text }]}>{homeId ? 'Change your home area' : 'Where do you live?'}</Text>
          <Text style={[styles.body, { color: t.text2 }]}>
            Pick your area. Places near home are free to reach; farther parts of Lagos open as you win stars.
          </Text>
          {error ? <Text style={[styles.error, { color: t.pinkInk }]}>{error}</Text> : null}
          {homeGroups(areas).map(g => (
            <View key={g.name} style={{ marginTop: 14 }}>
              <Text style={[styles.groupLabel, { color: t.text3 }]}>{g.name}</Text>
              <View style={styles.homeWrap}>
                {g.areas.map(a => {
                  const on = homeId === a.id;
                  return (
                    <PressScale
                      key={a.id}
                      onPress={() => pickHome(a.id)}
                      disabled={busy}
                      accessibilityLabel={`${a.name}, ${a.places} places`}
                    >
                      <View
                        style={[styles.homeChip, { backgroundColor: on ? t.pinkSoft : t.surface, borderColor: on ? t.pink : t.border }]}
                      >
                        <Text style={[styles.homeName, { color: t.text }]}>{a.name}</Text>
                        <Text style={[styles.homeCount, { color: t.text3 }]}>{a.places} places</Text>
                      </View>
                    </PressScale>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      ) : null}

      {onMap ? (
        <SlideIn
          reduceMotion={reduceMotion}
          distance={200}
          style={[styles.mapSheet, { backgroundColor: t.surface, borderColor: t.border, bottom: insets.bottom + 22 }]}
        >
          {sel ? (
            <SlideIn key={sel.id} reduceMotion={reduceMotion} distance={8}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.hostTile, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFE9DF' }]}>
                  <Character name={hostOf(sel, false)} size={64} style={{ marginBottom: -4 }} asViewer={!!sel.forSelf} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.kicker, { color: t.pinkInk }]}>
                    {sel.kind} · {area?.name}
                  </Text>
                  <Text style={[styles.placeName, { color: t.text }]}>{sel.name}</Text>
                  <Text style={[styles.teaser, { color: t.text2 }]} numberOfLines={3}>
                    {sel.teaser}
                  </Text>
                </View>
              </View>
              {closesLine ? (
                <View style={styles.closesRow}>
                  <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                    <Circle cx={12} cy={12} r={8.5} stroke={closesColor} strokeWidth={2} />
                    <Path d={CLOCK} stroke={closesColor} strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                  <Text style={[styles.closesText, { color: closesColor }]}>{closesLine}</Text>
                </View>
              ) : null}
              {trips && !visitedSel && !shutNow && !isHere && trips.levelOpen ? (
                <View style={styles.travelRow}>
                  {trips.quotes.map(q => {
                    const on = mode === q.mode;
                    const can = q.open && tripPrice(trips, q) <= balance;
                    const struck = trips.extrasFree && q.cost > 0;
                    return (
                      <PressScale key={q.mode} onPress={() => can && setMode(q.mode)} accessibilityLabel={q.label} style={{ flex: 1 }}>
                        <View
                          style={[
                            styles.travel,
                            { backgroundColor: on ? t.pinkSoft : t.surface, borderColor: on ? t.pink : t.border, opacity: can ? 1 : 0.45 },
                          ]}
                        >
                          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                            <Path
                              d={travelIcon(q.mode)}
                              stroke={on ? t.pinkInk : t.text2}
                              strokeWidth={1.9}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </Svg>
                          <Text style={[styles.travelLabel, { color: t.text }]}>{q.label}</Text>
                          <Text style={[styles.travelPrice, { color: q.cost && !struck ? t.goldInk : t.greenInk }]}>
                            {struck ? (
                              <Text style={{ textDecorationLine: 'line-through', color: t.disabledFg }}>{`${q.cost} SP`}</Text>
                            ) : null}
                            {struck ? ' free' : q.cost ? `${q.cost} SP` : 'Free'}
                          </Text>
                          <Text style={[styles.travelNote, { color: q.open ? t.text3 : t.red }]}>
                            {q.open ? `${q.minutes} min · ${clockLabel(q.arrive)}` : 'closed by then'}
                          </Text>
                        </View>
                      </PressScale>
                    );
                  })}
                </View>
              ) : null}
              {error ? <Text style={[styles.error, { color: t.pinkInk }]}>{error}</Text> : null}
              <Shake trigger={shake} reduceMotion={reduceMotion} style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <PressScale onPress={() => setSel(null)} accessibilityLabel="Not now">
                  <View style={[styles.notNow, { borderColor: t.border }]}>
                    <Text style={[styles.notNowText, { color: t.text2 }]}>Not now</Text>
                  </View>
                </PressScale>
                <PinkButton
                  t={t}
                  label={goLabel}
                  disabled={blocked || walking || busy}
                  reduceMotion={reduceMotion}
                  onPress={go}
                  height={50}
                  style={{ flex: 1 }}
                >
                  <Text
                    style={[styles.btnText, { fontSize: 13.5, color: blocked || walking || busy ? t.disabledFg : '#FFFFFF' }]}
                    numberOfLines={1}
                  >
                    {goLabel}
                  </Text>
                </PinkButton>
              </Shake>
            </SlideIn>
          ) : area ? (
            <SlideIn key={area.areaId} reduceMotion={reduceMotion} distance={8}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.areaTitle, { color: t.text }]}>{area.name}</Text>
                  <Text style={[styles.areaLine, { color: t.text3 }]}>{areaLine}</Text>
                </View>
                <CircleButton t={t} icon={CLOSE} label="Close" onPress={() => setArea(null)} size={34} iconSize={13} />
              </View>
              {areaNote ? (
                <View style={[styles.note, { backgroundColor: areaLocked ? t.pinkSoft : t.goldSoft }]}>
                  <Text style={[styles.noteText, { color: areaLocked ? t.pinkInk : t.goldInk }]}>{areaNote}</Text>
                </View>
              ) : null}
              {error ? <Text style={[styles.error, { color: t.pinkInk }]}>{error}</Text> : null}
              <ScrollView style={{ maxHeight: 236, marginTop: 8 }} nestedScrollEnabled>
                {area.loading ? <Text style={[styles.areaLine, { color: t.text3, paddingVertical: 12 }]}>Loading places…</Text> : null}
                {(area.places || []).map(p => {
                  const done = visits[p.id] != null || p.stars != null;
                  const gotStars = visits[p.id] ?? p.stars ?? 0;
                  const closed = !done && shut(p);
                  const dim = closed || areaLocked || p.locked;
                  return (
                    <PressScale key={p.id} onPress={() => selectPlace(p)} accessibilityLabel={`${p.name}${closed ? ', closed' : ''}`}>
                      <View style={[styles.stopRow, { borderBottomColor: t.border, opacity: dim ? 0.55 : 1 }]}>
                        <View style={[styles.stopIcon, { backgroundColor: t.pinkSoft }]}>
                          <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                            <Path d={kindIcon(p.kind)} stroke={t.pinkInk} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                          </Svg>
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={[styles.stopName, { color: t.text }]} numberOfLines={1}>
                            {p.name}
                          </Text>
                          <Text style={[styles.stopKind, { color: t.text3 }]}>
                            {p.kind} · {closed ? 'closed' : `open till ${clockLabel(p.closes)}`}
                          </Text>
                        </View>
                        <Text style={[styles.stopRight, { color: done ? t.gold : closed ? t.red : t.text3 }]}>
                          {done ? '★'.repeat(gotStars) || 'Done' : closed ? 'Closed' : '›'}
                        </Text>
                      </View>
                    </PressScale>
                  );
                })}
              </ScrollView>
            </SlideIn>
          ) : (
            <View>
              <View style={styles.levelHead}>
                <Text style={[styles.mapTitle, { color: t.text }]}>Where will you give today?</Text>
                <View style={[styles.levelChip, { backgroundColor: t.pinkSoft }]}>
                  <Text style={[styles.levelChipText, { color: t.pinkInk }]}>Level {levelNow}</Text>
                </View>
              </View>
              <View style={[styles.barTrack, { backgroundColor: t.track, height: 5, marginTop: 9 }]}>
                <View style={{ width: `${levelPct}%`, height: '100%' }}>
                  <LinearGradient
                    colors={[t.pink, t.gold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1, borderRadius: 999 }}
                  />
                </View>
              </View>
              <Text style={[styles.levelLine, { color: t.text3 }]}>{levelLine}</Text>
              {freeLine ? (
                <View style={[styles.freeBox, { backgroundColor: t.greenSoft }]}>
                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                    <Path d={GIFT} stroke={t.greenInk} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={[styles.freeText, { color: t.greenInk }]}>{freeLine}</Text>
                </View>
              ) : null}
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
                {[
                  { value: visited, label: 'places visited', bg: t.pinkSoft, ink: t.pinkInk },
                  { value: helped, label: 'people helped', bg: t.greenSoft, ink: t.greenInk },
                  { value: clockLabel(run?.dayEnd || 0), label: 'day ends', bg: t.goldSoft, ink: t.goldInk },
                ].map(s => (
                  <View key={s.label} style={[styles.dayStat, { backgroundColor: s.bg }]}>
                    <Text style={[styles.dayValue, { color: s.ink }]} numberOfLines={1} adjustsFontSizeToFit>
                      {s.value}
                    </Text>
                    <Text style={[styles.dayLabel, { color: t.text2 }]}>{s.label}</Text>
                  </View>
                ))}
              </View>
              {error ? <Text style={[styles.error, { color: t.pinkInk }]}>{error}</Text> : null}
              <PressScale onPress={finish} disabled={!visited || phase === 'ending'} accessibilityLabel="Finish the day">
                <View style={[styles.finish, { borderColor: visited ? t.pink : t.border }]}>
                  <Text style={[styles.finishText, { color: visited ? t.pinkInk : t.text3 }]}>
                    {phase === 'ending' ? 'Finishing…' : visited ? 'Finish the day' : 'Tap an area to start'}
                  </Text>
                </View>
              </PressScale>
              {!travelled ? (
                <PressScale onPress={() => setPhase('home')} accessibilityLabel="Change home area">
                  <Text style={[styles.changeHome, { color: t.text2 }]}>Change home area</Text>
                </PressScale>
              ) : null}
            </View>
          )}
        </SlideIn>
      ) : null}

      {inScene && sel ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: insets.top + 60, bottom: 0 }}>
          <PlaceScene
            t={t}
            isDark={isDark}
            place={sel}
            tone={tone}
            tall={phase === 'handover'}
            happy={false}
            handing={phase === 'handover'}
            reduceMotion={reduceMotion}
            k={width / 390}
          />
          {phase === 'visit' ? (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 120 }}>
              <SlideIn reduceMotion={reduceMotion} delay={150}>
                <Text style={[styles.placeTeaser, { color: t.text2 }]}>{sel.teaser}</Text>
              </SlideIn>
              <View style={styles.facts}>
                {(sel.facts || []).map((f, i) => {
                  const [bg, ink] = toneOf(t, f.tone);
                  return (
                    <SlideIn
                      key={f.text}
                      reduceMotion={reduceMotion}
                      delay={250 + i * 70}
                      style={[styles.fact, { backgroundColor: t.surface, borderColor: t.border }]}
                    >
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
              <SlideIn reduceMotion={reduceMotion} delay={500} style={[styles.giftCard, { backgroundColor: t.goldSoft }]}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path d={GIFT} stroke={t.goldInk} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.giftTitle, { color: t.text }]}>Gifts worth up to {gift} SP</Text>
                  <Text style={[styles.giftSub, { color: t.text2 }]}>
                    {area?.passCost ? `Included in your level ${area.level} day pass` : `Free on level ${area?.level}`}
                    {sel.forSelf ? '' : ` · for all ${sel.total} ${sel.who}`}
                  </Text>
                </View>
              </SlideIn>
            </ScrollView>
          ) : (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <FlyingKits t={t} count={12} reduceMotion={reduceMotion} />
              <Text style={[styles.handing, { color: t.text2, bottom: insets.bottom + 60 }]}>Handing over your gift…</Text>
            </View>
          )}
          {phase === 'visit' ? (
            <View style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 30 }}>
              <PinkButton
                t={t}
                label={sel.forSelf ? 'Build your kit' : `Build a gift for all ${sel.total}`}
                reduceMotion={reduceMotion}
                onPress={() => setPhase('build')}
              />
              <Text style={[styles.foot, { color: t.text3 }]}>
                Giving takes {run?.visitMinutes} minutes · open till {clockLabel(sel.closes)}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {phase === 'build' && sel ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: insets.top + 64, bottom: 0 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 260 }}>
            <View style={{ paddingHorizontal: 18 }}>
              <Text style={[styles.buildTitle, { color: t.text }]}>
                {sel.forSelf ? 'Build your own kit' : `One gift for all ${sel.total} ${sel.who}`}
              </Text>
              <Text style={[styles.buildSub, { color: t.text2 }]}>
                {repacking
                  ? `Repack the gift. ${result?.giftPaid ? `The ${result.giftPaid} SP you paid comes back. ` : ''}It takes another visit's time.`
                  : 'Tap what goes in. Each price covers everyone here.'}
              </Text>
            </View>
            <View style={styles.grid}>
              {products.map((p, i) => {
                const on = picked.includes(p.id);
                const art = productArt(p.id);
                return (
                  <SlideIn key={p.id} reduceMotion={reduceMotion} delay={i * 40} style={{ width: '48.5%' }}>
                    <PressScale onPress={() => setPicked(cur => togglePick(cur, p.id))} accessibilityLabel={`${p.name}, ${p.cost} SP`}>
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
                          <Text style={[styles.productCost, { color: t.text3 }]}>{p.cost} SP</Text>
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
          <Shake
            trigger={shake}
            reduceMotion={reduceMotion}
            style={[styles.budget, { backgroundColor: t.surface, borderColor: t.border, bottom: insets.bottom + 22 }]}
          >
            <View style={styles.budgetRow}>
              <Text style={[styles.kitLine, { color: t.text2 }]}>{unit ? 'Your gift' : 'Pick at least one thing'}</Text>
              <Text style={[styles.totalLine, { color: over ? t.red : t.text }]}>
                {unit} / {split.limit} SP
              </Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: t.track }]}>
              <View style={{ width: `${Math.min(100, Math.round((unit / Math.max(1, split.limit)) * 100))}%`, height: '100%' }}>
                <LinearGradient
                  colors={over ? [t.red, t.red] : [t.pink, t.gold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1, borderRadius: 999 }}
                />
              </View>
            </View>
            <Text style={[styles.budgetLine, { color: over ? t.red : t.text3 }]}>
              {over ? (
                `That is ${unit - split.limit} SP over the most you can give here. Take something out.`
              ) : split.extra ? (
                extrasFree ? (
                  <>
                    {`${gift} SP free · extras `}
                    <Text style={{ textDecorationLine: 'line-through', color: t.disabledFg }}>{`${split.extra} SP`}</Text>
                    {' free on this level'}
                  </>
                ) : (
                  `${gift} SP free · ${split.pay} SP from your points`
                )
              ) : unit ? (
                `${gift - unit} SP of free gifts left · then ${extrasFree ? 'extras are free on this level' : 'extras use your SP'}`
              ) : (
                `${gift} SP of gifts free here · add more up to ${split.limit} SP${extrasFree ? ', free on this level' : ' with your SP'}`
              )}
            </Text>
            {error ? <Text style={[styles.error, { color: t.pinkInk }]}>{error}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <PressScale onPress={() => setPhase('visit')} accessibilityLabel="Back">
                <View style={[styles.notNow, { borderColor: t.border, width: 90 }]}>
                  <Text style={[styles.notNowText, { color: t.text2 }]}>Back</Text>
                </View>
              </PressScale>
              <PinkButton
                t={t}
                label={`Hand over the gift${split.pay ? `, ${split.pay} SP` : ''}`}
                disabled={!ok}
                reduceMotion={reduceMotion}
                onPress={give}
                height={50}
                style={{ flex: 1 }}
              >
                <Svg width={17} height={17} viewBox="0 0 24 24" fill="none">
                  <Path d={GIFT} stroke={ok ? '#FFFFFF' : t.disabledFg} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={[styles.btnText, { color: ok ? '#FFFFFF' : t.disabledFg, fontSize: 14 }]}>
                  {`${sel.forSelf ? 'Pack my kit' : 'Hand over the gift'}${split.pay ? ` · ${split.pay} SP` : ''}`}
                </Text>
              </PinkButton>
            </View>
          </Shake>
        </View>
      ) : null}

      {phase === 'result' && result && sel ? (
        <View style={StyleSheet.absoluteFill}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: t.overlay }]} />
          {result.stars === 3 ? <Confetti colors={[t.pink, t.gold, t.green, t.petal, t.goldSoft]} reduceMotion={reduceMotion} /> : null}
          <SlideIn
            reduceMotion={reduceMotion}
            distance={400}
            style={[styles.result, { backgroundColor: t.surface, paddingBottom: insets.bottom + 24 }]}
          >
            <View style={[styles.handle, { backgroundColor: t.border }]} />
            <StarRow t={t} count={result.stars} reduceMotion={reduceMotion} big={52} small={42} />
            <Text style={[styles.resultTitle, { color: t.text }]}>{result.title}</Text>
            <View style={[styles.thanks, { backgroundColor: t.pinkSoft }]}>
              <View style={[styles.thanksFace, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFE9DF' }]}>
                <Character name={hostOf(sel, true)} size={54} style={{ marginBottom: -4 }} asViewer={!!sel.forSelf} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.thanksText, { color: t.text }]}>
                  “
                  {result.stars > 0
                    ? result.thanks
                    : 'Every gift needs something to catch the flow: pads, tampons, a cup, period pants or reusable pads.'}
                  ”
                </Text>
                <Text style={[styles.quoteWho, { color: t.text3 }]}>{sel.hostName}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
              <View style={[styles.resChip, { backgroundColor: t.pinkSoft }]}>
                <Text style={[styles.resChipText, { color: t.pinkInk }]}>
                  {sel.forSelf ? 'Your own kit' : `+${result.people} ${sel.who} helped`}
                </Text>
              </View>
              <View style={[styles.resChip, { backgroundColor: t.goldSoft }]}>
                <Text
                  style={[styles.resChipText, { color: t.goldInk }]}
                >{`Gift worth ${result.giftCost} SP${result.giftPaid ? ` · ${result.giftPaid} SP from your points` : ''}`}</Text>
              </View>
            </View>
            <Text style={[styles.gaveLabel, { color: t.text3 }]}>WHAT YOU GAVE</Text>
            <ScrollView style={{ maxHeight: 250 }} contentContainerStyle={{ gap: 6 }}>
              {[...(result.review || []), ...(result.missed || []).map(m => ({ ...m, rating: 'missed' }))].map((r, i) => {
                const st = RATING[r.rating] || RATING.ok;
                return (
                  <SlideIn
                    key={`${r.productId}-${r.rating}`}
                    reduceMotion={reduceMotion}
                    delay={700 + i * 60}
                    style={[styles.reviewRow, { backgroundColor: t[st[1]] }]}
                  >
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
            {result.canRepack ? (
              <GhostButton
                t={t}
                label="Repack the gift"
                onPress={() => {
                  setRepacking(true);
                  setPhase('build');
                }}
                height={52}
                style={{ marginTop: 14 }}
              />
            ) : null}
            <PinkButton
              t={t}
              label="Back to the map"
              reduceMotion={reduceMotion}
              onPress={backToMap}
              height={52}
              style={{ marginTop: result.canRepack ? 8 : 14 }}
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
                { value: day?.stars ?? 0, label: 'stars', ink: t.goldInk },
                { value: day?.spentToday ?? 0, label: 'SP spent', ink: t.greenInk },
              ].map((s, i) => (
                <SlideIn
                  key={s.label}
                  reduceMotion={reduceMotion}
                  delay={200 + i * 80}
                  style={[styles.doneStat, { backgroundColor: t.surface, borderColor: t.border }]}
                >
                  <Text style={[styles.doneValue, { color: s.ink }]}>{s.value}</Text>
                  <Text style={[styles.dayLabel, { color: t.text2 }]}>{s.label}</Text>
                </SlideIn>
              ))}
            </View>
            <View style={[styles.doneList, { backgroundColor: t.surface, borderColor: t.border }]}>
              {log.map((l, i) => (
                <SlideIn
                  key={l.id}
                  reduceMotion={reduceMotion}
                  delay={300 + i * 80}
                  style={[styles.doneRow, { borderBottomColor: i === log.length - 1 ? 'transparent' : t.border }]}
                >
                  <Text style={[styles.doneName, { color: t.text }]} numberOfLines={1}>
                    {l.name} · {l.areaName}
                  </Text>
                  <Text style={[styles.donePeople, { color: t.text3 }]}>{l.forSelf ? 'you' : `${l.n} ${l.who}`}</Text>
                  <View style={{ flexDirection: 'row', gap: 1 }}>
                    {[0, 1, 2].map(n => (
                      <Svg key={n} width={12} height={12} viewBox="0 0 24 24">
                        <Path d={STAR_PATH} fill={n < l.stars ? t.gold : t.starOff} />
                      </Svg>
                    ))}
                  </View>
                </SlideIn>
              ))}
            </View>
          </ScrollView>
          <View style={{ position: 'absolute', left: 18, right: 18, bottom: insets.bottom + 30 }}>
            <PinkButton t={t} label="Back to Spotlight" reduceMotion={reduceMotion} onPress={onExit} />
            <Text style={[styles.foot, { color: t.text3 }]}>
              {freeLeft > 0 || !cost
                ? freeNums.length
                  ? `Level${freeNums.length > 1 ? 's' : ''} ${freeNums.join(' and ')} ${freeNums.length > 1 ? 'are' : 'is'} free every day`
                  : 'Your next Give Day is free'
                : `Next Give Day costs ${cost} SP`}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hud: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 10 },
  titleBox: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  kicker: { fontSize: ds(9.5), fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  hudTitle: { fontFamily: FONT.serif, fontSize: 19, lineHeight: 22 },
  helped: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 34,
    paddingLeft: 8,
    paddingRight: 10,
    borderRadius: 17,
    borderWidth: 1,
  },
  helpedText: { fontSize: ds(13), fontWeight: '800' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 18,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    zIndex: 9,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -10 },
    elevation: 8,
  },
  face: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end' },
  sheetTitle: { fontFamily: FONT.serif, fontSize: 26, lineHeight: 29 },
  body: { fontSize: ds(12.5), lineHeight: 19, marginTop: 8 },
  error: { fontSize: ds(12), marginTop: 10, textAlign: 'center' },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  btnChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.22)' },
  btnChipText: { color: '#FFFFFF', fontSize: ds(11), fontWeight: '800' },
  mapSheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    padding: 14,
    borderRadius: 26,
    borderWidth: 1,
    zIndex: 9,
    shadowColor: '#C04E68',
    shadowOpacity: 0.1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
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
  quote: {
    position: 'absolute',
    left: 150,
    right: 12,
    top: 14,
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  quoteText: { fontFamily: FONT.serif, fontSize: 13.5, lineHeight: 18 },
  quoteWho: { fontSize: ds(9.5), fontWeight: '700', marginTop: 4 },
  thanksLine: { position: 'absolute', right: 12, top: 20, left: 150, textAlign: 'right', fontFamily: FONT.serif, fontSize: 15 },
  placeTeaser: { fontSize: ds(13), lineHeight: 20, marginTop: 12 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8, marginTop: 12 },
  fact: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
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
  product: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 62,
    paddingLeft: 8,
    paddingRight: 10,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  productTile: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  productName: { fontSize: ds(12), fontWeight: '700' },
  productCost: { fontSize: ds(10), fontWeight: '600', marginTop: 1 },
  check: { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  budget: {
    position: 'absolute',
    left: 12,
    right: 12,
    padding: 14,
    borderRadius: 26,
    borderWidth: 1,
    shadowColor: '#C04E68',
    shadowOpacity: 0.1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  kitLine: { fontSize: ds(11.5), fontWeight: '700' },
  totalLine: { fontFamily: FONT.serif, fontSize: 22 },
  barTrack: { height: 8, borderRadius: 999, overflow: 'hidden', marginTop: 8 },
  budgetLine: { fontSize: ds(10.5), fontWeight: '600', marginTop: 6 },
  result: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '92%',
    paddingTop: 14,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
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
  clock: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 34, paddingHorizontal: 9, borderRadius: 17, borderWidth: 1 },
  clockText: { fontSize: ds(11.5), fontWeight: '800' },
  zoomCol: { position: 'absolute', right: 14, gap: 6, zIndex: 8 },
  zoomBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  zoomText: { fontSize: 20, fontWeight: '700', lineHeight: 22 },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    width: 260,
    zIndex: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  toastStar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  toastText: { flex: 1, fontSize: ds(11.5), fontWeight: '700', lineHeight: 16 },
  homeTitle: { fontFamily: FONT.serif, fontSize: 26, lineHeight: 29 },
  groupLabel: { fontSize: ds(9.5), fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  homeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  homeChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14, borderWidth: 1.5 },
  homeName: { fontSize: ds(12.5), fontWeight: '800' },
  homeCount: { fontSize: ds(9.5), fontWeight: '600' },
  closesRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  closesText: { flex: 1, fontSize: ds(10.5), fontWeight: '700' },
  travelRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  travel: { alignItems: 'center', gap: 2, paddingTop: 8, paddingBottom: 7, paddingHorizontal: 4, borderRadius: 16, borderWidth: 1.5 },
  travelLabel: { fontSize: ds(12), fontWeight: '800' },
  travelPrice: { fontSize: ds(10), fontWeight: '800' },
  travelNote: { fontSize: ds(9.5), fontWeight: '600' },
  areaTitle: { fontFamily: FONT.serif, fontSize: 21, lineHeight: 24 },
  areaLine: { fontSize: ds(10.5), fontWeight: '700', marginTop: 2 },
  note: { marginTop: 8, paddingVertical: 7, paddingHorizontal: 10, borderRadius: 12 },
  noteText: { fontSize: ds(10.5), fontWeight: '700', lineHeight: 15 },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, paddingHorizontal: 4, borderBottomWidth: 1 },
  stopIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  stopName: { fontSize: ds(12.5), fontWeight: '800' },
  stopKind: { fontSize: ds(10), fontWeight: '600' },
  stopRight: { fontSize: ds(12), fontWeight: '800' },
  levelHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  levelChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  levelChipText: { fontSize: ds(10), fontWeight: '800' },
  levelLine: { fontSize: ds(10), fontWeight: '600', marginTop: 5 },
  freeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  freeText: { flex: 1, fontSize: ds(10.5), fontWeight: '700', lineHeight: 15 },
  changeHome: { alignSelf: 'center', marginTop: 6, fontSize: ds(11), fontWeight: '700', textDecorationLine: 'underline' },
  giftCard: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, padding: 12, borderRadius: 18 },
  giftTitle: { fontSize: ds(13.5), fontWeight: '800' },
  giftSub: { fontSize: ds(10.5), fontWeight: '600', marginTop: 2 },
});
