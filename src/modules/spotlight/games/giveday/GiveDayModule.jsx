import { BackHandler, Platform, Pressable, ScrollView, View, StyleSheet, useWindowDimensions } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Path, SvgXml } from 'react-native-svg';
import { useApp } from '../../../../shared/store/AppContext.jsx';
import { A } from '../../../../shared/store/actions.js';
import { useTheme, Text, FONT } from '../../../../shared/styles/index.js';
import * as givedayApi from '../../../../shared/api/giveday.js';
import { Icon, Pop, STAR } from '../../common/SpotlightFx.jsx';
import { tone } from '../../common/theme.js';
import { avatarXml } from '../../common/avatars.js';
import { friendlyError } from '../../quiz/quizLogic.js';
import { kitCost, canGive, togglePick, factIcon, productArt, ratingStyle, mapPoint, mapBounds, groupLabel } from './givedayLogic.js';

const BACK = 'M15 5l-7 7 7 7';
const COIN = 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 7.5v9M9.5 9.5h4a1.75 1.75 0 0 1 0 3.5h-3a1.75 1.75 0 0 0 0 3.5h4';
const PEOPLE =
  'M9 7a2.5 2.5 0 1 0 0-.1M15 7a2.5 2.5 0 1 0 0-.1M4.5 19c.5-3.5 2.5-5.5 4.5-5.5s4 2 4.5 5.5M11 19c.5-3.5 2.5-5.5 4.5-5.5s4 2 4.5 5.5';
const PIN_W = 92;

function feel(kind) {
  let done;
  if (kind === 'good') done = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else if (Platform.OS === 'android') done = Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Virtual_Key);
  else done = Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  Promise.resolve(done).catch(() => {});
}

function Button({ label, onPress, disabled, primary = true, style }) {
  const { colors: c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[{ opacity: disabled ? 0.5 : 1 }, style]}
    >
      {({ pressed }) =>
        primary ? (
          <LinearGradient colors={[c.primaryDark, c.primary]} style={[styles.btn, pressed && { transform: [{ scale: 0.97 }] }]}>
            <Text style={styles.btnTx}>{label}</Text>
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.btn,
              { backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border },
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={[styles.btnTx, { color: c.primaryDark }]}>{label}</Text>
          </View>
        )
      }
    </Pressable>
  );
}

function Stars({ n, size = 40 }) {
  const { colors: c } = useTheme();
  return (
    <View style={styles.stars} accessibilityLabel={`${n} of 3 stars`}>
      {[0, 1, 2].map(i => (
        <Icon key={i} d={STAR} size={i === 1 ? size * 1.3 : size} color={i < n ? '#E6C48E' : c.border} fill />
      ))}
    </View>
  );
}

function ProductArt({ id, size = 40 }) {
  const art = productArt(id);
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path d={art.art} fill={art.fill} stroke={art.stroke} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d={art.detail} stroke={art.stroke} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function Fact({ fact }) {
  const { colors: c, isDark } = useTheme();
  const t = tone(fact.tone, isDark);
  return (
    <View style={[styles.fact, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={[styles.factIcon, { backgroundColor: t.bg, borderColor: t.line }]}>
        <Icon d={factIcon(fact.icon)} size={16} color={t.ink} width={1.9} />
      </View>
      <Text style={[styles.factTx, { color: c.textPrimary }]}>{fact.text}</Text>
    </View>
  );
}

function ReviewRow({ item, missed }) {
  const { colors: c } = useTheme();
  const st = ratingStyle(missed ? 'missed' : item.rating);
  return (
    <View style={[styles.review, { backgroundColor: st.bg }]}>
      <View style={[styles.reviewDot, { backgroundColor: st.dot }]}>
        <Icon d={st.icon} size={12} color="#FFFFFF" width={3} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: c.textPrimary }}>{missed ? `Missed: ${item.name}` : item.name}</Text>
        {item.why ? <Text style={{ fontSize: 11, color: c.textSecondary, lineHeight: 16 }}>{item.why}</Text> : null}
      </View>
    </View>
  );
}

export default function GiveDayModule({ insets, reduceMotion, challenge, onExit, onChanged }) {
  const { state, dispatch } = useApp();
  const { colors: c, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const token = state.accessToken;
  const balance = state.femPoints || 0;
  const cost = challenge?.cost ?? 0;
  const [freeLeft, setFreeLeft] = useState(challenge?.freePlaysLeft ?? 0);
  const free = freeLeft > 0;
  const [phase, setPhase] = useState('intro');
  const [run, setRun] = useState(null);
  const [coins, setCoins] = useState(0);
  const [helped, setHelped] = useState(0);
  const [visits, setVisits] = useState({});
  const [placeId, setPlaceId] = useState(null);
  const [people, setPeople] = useState(null);
  const [picked, setPicked] = useState([]);
  const [result, setResult] = useState(null);
  const [day, setDay] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase === 'place' || phase === 'result') setPhase('map');
      else if (phase === 'build') setPhase('place');
      else onExit();
      return true;
    });
    return () => sub.remove();
  }, [phase, onExit]);

  const place = run?.places?.find(p => p.id === placeId) || null;
  const mapW = width - 32;
  const mapH = Math.round(mapW * 1.25);
  const bounds = useMemo(() => (run?.places?.length ? mapBounds(run.places) : null), [run]);
  const total = run ? kitCost(run.products, picked, people) : 0;

  async function play() {
    feel('tap');
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
      setDay(null);
      setPhase('map');
    } catch (e) {
      setError(friendlyError(e));
      setPhase('intro');
    }
  }

  function openPlace(p) {
    if (visits[p.id] != null || p.locked) return;
    feel('tap');
    setPlaceId(p.id);
    setPeople(null);
    setPicked([]);
    setPhase('place');
  }

  async function sendKit() {
    if (!canGive(run.products, picked, people, coins)) return;
    feel('tap');
    setPhase('sending');
    setError(null);
    try {
      const out = await givedayApi.give(run.runId, placeId, people, picked, token);
      setCoins(out.coins);
      setHelped(out.helped);
      setVisits(v => ({ ...v, [out.placeId]: out.stars }));
      setResult(out);
      setPhase('result');
      feel(out.stars >= 2 ? 'good' : 'tap');
    } catch (e) {
      setError(friendlyError(e));
      setPhase('build');
    }
  }

  async function endDay() {
    feel('tap');
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

  const topBar = (
    <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
      <Pressable
        onPress={() => (phase === 'place' || phase === 'result' ? setPhase('map') : phase === 'build' ? setPhase('place') : onExit())}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={[styles.round, { backgroundColor: c.surface, borderColor: c.border }]}
      >
        <Icon d={BACK} size={18} color={c.primaryDark} width={2.4} />
      </Pressable>
      {run && phase !== 'intro' ? (
        <>
          <View style={[styles.pill, { backgroundColor: c.surface, borderColor: c.border }]} accessibilityLabel={`${coins} give coins`}>
            <Icon d={COIN} size={15} color={tone('green', isDark).ink} width={2} />
            <Text style={[styles.pillTx, { color: c.textPrimary }]}>{coins}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: c.surface, borderColor: c.border }]} accessibilityLabel={`${helped} people helped`}>
            <Icon d={PEOPLE} size={15} color={c.primary} width={1.9} />
            <Text style={[styles.pillTx, { color: c.textPrimary }]}>{helped}</Text>
          </View>
        </>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      {topBar}
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 110 }]} showsVerticalScrollIndicator={false}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {(phase === 'intro' || phase === 'loading') && (
          <View style={styles.center}>
            <Text style={[styles.title, { color: c.textPrimary }]}>Give Day</Text>
            <Text style={[styles.text, { color: c.textSecondary }]}>
              Walk the town, hear what each place needs and build the right period kit with your give coins.
            </Text>
            <Button
              label={phase === 'loading' ? 'Opening…' : free ? 'PLAY · FREE TRY' : cost ? `PLAY · ${cost} SP` : 'PLAY'}
              onPress={play}
              disabled={phase === 'loading' || (!free && balance < cost)}
              style={{ marginTop: 18, minWidth: 220 }}
            />
            <Text style={[styles.fine, { color: c.textMuted }]}>
              {!free && balance < cost ? `You need ${cost - balance} more SP.` : 'Pretend only: no real products or money change hands.'}
            </Text>
          </View>
        )}

        {(phase === 'map' || phase === 'ending') && run && bounds && (
          <>
            <Text style={[styles.label, { color: c.primaryDark }]}>Where will you give today?</Text>
            <View style={[styles.map, { height: mapH + 40, borderColor: c.border }]}>
              <LinearGradient colors={isDark ? ['#2A2023', '#30262A'] : ['#FBF2EE', '#EEF6F0']} style={StyleSheet.absoluteFill} />
              {run.places.map(p => {
                const pt = mapPoint(p, mapW - PIN_W - 8, mapH - 20, bounds);
                const done = visits[p.id] != null;
                const t = tone(p.forSelf ? 'green' : 'pink', isDark);
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => openPlace(p)}
                    disabled={done || p.locked}
                    accessibilityRole="button"
                    accessibilityLabel={`${p.name}, ${p.kind}${done ? `, ${visits[p.id]} stars` : ''}`}
                    style={[
                      styles.pin,
                      { left: pt.left + 4, top: pt.top + 10, backgroundColor: c.surface, borderColor: done ? t.line : c.border },
                    ]}
                  >
                    <View style={[styles.pinIcon, { backgroundColor: t.bg }]}>
                      <Icon d={p.forSelf ? factIcon('drop') : factIcon(p.facts?.[0]?.icon)} size={16} color={t.ink} width={1.9} />
                    </View>
                    <Text style={[styles.pinName, { color: c.textPrimary }]} numberOfLines={2}>
                      {p.name}
                    </Text>
                    {done ? (
                      <Text style={{ fontSize: 9.5, fontWeight: '700', color: '#B5832F' }}>{'★'.repeat(visits[p.id]) || '0★'}</Text>
                    ) : p.locked ? (
                      <Text style={{ fontSize: 9, color: c.textMuted }}>Locked</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
            <Button
              label={phase === 'ending' ? 'Closing…' : 'End the day'}
              onPress={endDay}
              disabled={phase === 'ending'}
              primary={false}
            />
          </>
        )}

        {phase === 'place' && place && (
          <Pop reduceMotion={reduceMotion} trigger={place.id}>
            <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={styles.hostRow}>
                <SvgXml xml={avatarXml(place.hostLook, 'neutral')} width={88} height={88} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.kind, { color: c.primaryDark }]}>{place.kind}</Text>
                  <Text style={[styles.placeName, { color: c.textPrimary }]}>{place.name}</Text>
                  <Text style={{ fontSize: 11, color: c.textMuted }}>{place.hostName}</Text>
                </View>
              </View>
              {place.quote ? <Text style={[styles.quote, { color: c.textSecondary }]}>“{place.quote}”</Text> : null}
              <View style={{ gap: 8, marginTop: 12 }}>
                {place.facts.map((f, i) => (
                  <Fact key={`${f.icon}-${i}`} fact={f} />
                ))}
              </View>
            </View>
            <Button label="Build a kit" onPress={() => setPhase('build')} style={{ marginTop: 14 }} />
          </Pop>
        )}

        {(phase === 'build' || phase === 'sending') && place && (
          <>
            <Text style={[styles.label, { color: c.primaryDark }]}>How many {place.who}?</Text>
            <View style={styles.chips}>
              {place.counts.map(n => {
                const on = people === n;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setPeople(n)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    style={[styles.chip, { backgroundColor: on ? c.primaryDark : c.surface, borderColor: on ? c.primaryDark : c.border }]}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '800', color: on ? '#FFFFFF' : c.textPrimary }}>{n}</Text>
                    <Text style={{ fontSize: 9.5, color: on ? '#FFFFFF' : c.textMuted }}>{groupLabel(n, place)}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[styles.label, { color: c.primaryDark }]}>Build one kit</Text>
            <View style={styles.grid}>
              {run.products.map(p => {
                const on = picked.includes(p.id);
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setPicked(v => togglePick(v, p.id))}
                    accessibilityRole="button"
                    accessibilityLabel={`${p.name}, ${p.cost} coins${on ? ', added' : ''}`}
                    style={[
                      styles.product,
                      { backgroundColor: on ? tone('pink', isDark).bg : c.surface, borderColor: on ? c.primary : c.border },
                    ]}
                  >
                    <ProductArt id={p.id} />
                    <Text style={[styles.productName, { color: c.textPrimary }]} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={{ fontSize: 10, color: c.textMuted }}>{p.cost} coins</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={[styles.budget, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Text style={{ fontSize: 12, color: c.textPrimary, fontWeight: '700' }}>
                {total} of {coins} coins
              </Text>
              <View style={[styles.bar, { backgroundColor: c.border }]}>
                <View
                  style={{
                    width: `${Math.min(100, coins ? (total / coins) * 100 : 100)}%`,
                    height: '100%',
                    borderRadius: 99,
                    backgroundColor: total > coins ? '#C9604F' : '#4E9E78',
                  }}
                />
              </View>
            </View>
            <Button
              label={phase === 'sending' ? 'Sending the van…' : 'Give this kit'}
              onPress={sendKit}
              disabled={phase === 'sending' || !canGive(run.products, picked, people, coins)}
            />
          </>
        )}

        {phase === 'result' && result && (
          <View>
            <View style={styles.center}>
              <Stars n={result.stars} />
              <Text style={[styles.title, { color: c.textPrimary }]}>{result.title}</Text>
              {result.thanks ? <Text style={[styles.quote, { color: c.textSecondary }]}>“{result.thanks}”</Text> : null}
              <Text style={[styles.fine, { color: c.textMuted }]}>
                {result.people} helped · {result.spent} coins spent · {result.coins} left
              </Text>
            </View>
            <View style={{ gap: 8, marginTop: 14 }}>
              {result.review.map(r => (
                <ReviewRow key={r.productId} item={r} />
              ))}
              {result.missed.map(r => (
                <ReviewRow key={`m-${r.productId}`} item={r} missed />
              ))}
            </View>
            <Button label="Back to the map" onPress={() => setPhase('map')} style={{ marginTop: 16 }} />
          </View>
        )}

        {phase === 'done' && day && (
          <View style={styles.center}>
            <Stars n={day.stars} size={48} />
            <Text style={[styles.title, { color: c.textPrimary }]}>Day done!</Text>
            <Text style={[styles.text, { color: c.textSecondary }]}>
              {day.helped} people helped at {Object.keys(day.places).length} places · {day.coins} coins left
            </Text>
            <View style={[styles.row, { marginTop: 18 }]}>
              <Button
                label={free ? 'Again · FREE TRY' : cost ? `Again · ${cost} SP` : 'Again'}
                onPress={play}
                disabled={!free && balance < cost}
                primary={false}
                style={{ flex: 1 }}
              />
              <View style={{ width: 12 }} />
              <Button label="Done" onPress={onExit} style={{ flex: 1 }} />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  round: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 34, paddingHorizontal: 11, borderRadius: 99, borderWidth: 1 },
  pillTx: { fontSize: 13, fontWeight: '800' },
  body: { padding: 16, gap: 12 },
  center: { alignItems: 'center' },
  title: { fontFamily: FONT.serif, fontSize: 28, lineHeight: 34, textAlign: 'center', marginTop: 6 },
  text: { fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 8, maxWidth: 320 },
  fine: { fontSize: 10.5, textAlign: 'center', marginTop: 10 },
  error: { fontSize: 12, textAlign: 'center', color: '#C9604F' },
  label: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  map: { borderRadius: 24, borderWidth: 1.5, overflow: 'hidden' },
  pin: { position: 'absolute', width: PIN_W, borderRadius: 16, borderWidth: 1.5, padding: 8, gap: 4 },
  pinIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  pinName: { fontSize: 11, fontWeight: '700', lineHeight: 14 },
  card: { borderRadius: 24, borderWidth: 1.5, padding: 16 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  kind: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  placeName: { fontFamily: FONT.serif, fontSize: 24, lineHeight: 29 },
  quote: { fontSize: 13, lineHeight: 19, fontStyle: 'italic', marginTop: 10, textAlign: 'center' },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1, padding: 8 },
  factIcon: { width: 30, height: 30, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  factTx: { flex: 1, fontSize: 12, fontWeight: '600' },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, alignItems: 'center', borderRadius: 16, borderWidth: 1.5, paddingVertical: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
  product: { width: '31.5%', alignItems: 'center', borderRadius: 16, borderWidth: 1.5, paddingVertical: 8, gap: 2 },
  productName: { fontSize: 11, fontWeight: '700' },
  budget: { borderRadius: 16, borderWidth: 1.5, padding: 12, gap: 6 },
  bar: { height: 8, borderRadius: 99, overflow: 'hidden' },
  btn: { minHeight: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  btnTx: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  stars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  review: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 14, padding: 10 },
  reviewDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  row: { flexDirection: 'row', alignSelf: 'stretch' },
});
