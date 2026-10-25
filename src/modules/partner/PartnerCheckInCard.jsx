import { View, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, TextInput, FONT } from '../../shared/styles/index.js';
import Button from '../../components/ui/Button.jsx';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
import * as partnerApi from '../../shared/api/partner.js';
import * as rewardsApi from '../../shared/api/rewards.js';
import { useReduceMotion, useAnimatedValue } from '../dashboard/HeroCardFx.jsx';
export const HEART = 'M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z';
const NOTE_MAX = 200;
const ICONS = {
  checked_in: ['M4 5h16v11H9l-5 4V5z', 'M12 13.5s-2.6-1.6-2.6-3.3a1.4 1.4 0 0 1 2.6-.7 1.4 1.4 0 0 1 2.6.7c0 1.7-2.6 3.3-2.6 3.3z'],
  listened: ['M7 9a5 5 0 1 1 10 0c0 3.2-3 3.8-3 7a3 3 0 0 1-6 0', 'M10 9.5a2 2 0 0 1 4 0'],
  snacks: [
    'M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9z',
    'M16 10h1.5a2.5 2.5 0 0 1 0 5H16M9 3.5c0 1.5 1.5 1.5 1.5 3M12.5 3.5c0 1.5 1.5 1.5 1.5 3',
  ],
  massage: ['M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z', 'M18.5 16l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z'],
  chores: ['M4 11l8-6 8 6v8H4v-8z', 'M10 19v-5h4v5'],
  quiet_time: ['M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z', 'M16 4.5l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z'],
};
const BURST = [
  [-40, -22, 0],
  [40, -26, 80],
  [-30, 30, 140],
  [34, 28, 200],
  [0, -44, 100],
];
export function Heart({ size, color }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d={HEART} />
    </Svg>
  );
}
export function OptionIcon({ id, color, size = 22 }) {
  const [a, b] = ICONS[id] || ICONS.checked_in;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d={a} />
      <Path d={b} />
    </Svg>
  );
}
export function Beating({ reduceMotion, children }) {
  const beat = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(beat, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(beat, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(beat, { toValue: 0.7, duration: 160, useNativeDriver: true }),
        Animated.timing(beat, { toValue: 0, duration: 260, useNativeDriver: true }),
        Animated.delay(800),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [beat, reduceMotion]);
  const scale = beat.interpolate({ inputRange: [0, 1], outputRange: [1, 1.16] });
  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}
function Tile({ option, on, onPress, reduceMotion, c, s }) {
  const press = useAnimatedValue(1);
  const float = useAnimatedValue(0);
  function handlePress() {
    onPress();
    if (reduceMotion) return;
    press.setValue(0.9);
    Animated.spring(press, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }).start();
    if (!on) {
      float.setValue(0);
      Animated.timing(float, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    }
  }
  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on }}
      accessibilityLabel={option.label}
      style={{ width: '31.5%' }}
    >
      <Animated.View
        style={[
          s.tile,
          on && { borderWidth: 2, borderColor: c.primary, backgroundColor: c.primarySoft },
          { transform: [{ scale: press }] },
        ]}
      >
        {!reduceMotion && (
          <Animated.View
            pointerEvents="none"
            style={[
              s.float,
              {
                opacity: float.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
                transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) }],
              },
            ]}
          >
            <Heart size={14} color={c.primary} />
          </Animated.View>
        )}
        {ICONS[option.id] || !option.emoji ? (
          <OptionIcon id={option.id} color={on ? c.primaryDark : c.textMuted} />
        ) : (
          <Text style={s.tileEmoji}>{option.emoji}</Text>
        )}
        <Text style={[s.tileTx, { color: on ? c.primaryDark : c.textSecondary }]} numberOfLines={1}>
          {option.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
export function BurstHeart({ x, y, delay, color }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 1100, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v, delay]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 25,
        top: 25,
        opacity: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }),
        transform: [
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, x] }) },
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, y] }) },
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
        ],
      }}
    >
      <Heart size={14} color={color} />
    </Animated.View>
  );
}
const KIND_ICONS = {
  promise: [HEART, 'M9.5 12.5l1.8 1.8 3.2-3.6'],
  text: ['M4 5h16v11H9l-5 4V5z', 'M8 9.5h8M8 12.5h5'],
  expression: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M8.5 14.5s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01'],
};
const FALLBACK_ICON = [HEART, 'M12 8v0'];
export function Appear({ delay = 0, reduceMotion, children, style }) {
  const v = useAnimatedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) return;
    Animated.timing(v, { toValue: 1, duration: 320, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v, delay, reduceMotion]);
  return (
    <Animated.View
      style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}
export function PressScale({ onPress, disabled, style, children, accessibilityLabel, accessibilityRole = 'button', accessibilityState }) {
  const v = useAnimatedValue(1);
  const to = value => Animated.spring(v, { toValue: value, speed: 40, bounciness: 8, useNativeDriver: true }).start();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => to(0.96)}
      onPressOut={() => to(1)}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
    >
      <Animated.View style={[style, { transform: [{ scale: v }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
function Wiggle({ active, reduceMotion, children }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    if (!active || reduceMotion) {
      v.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(v, { toValue: -1, duration: 320, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.delay(500),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, reduceMotion, v]);
  return (
    <Animated.View
      style={{
        transform: [
          { rotate: v.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] }) },
          { scale: v.interpolate({ inputRange: [-1, 0, 1], outputRange: [1.15, 1, 1.15] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
function KindIcon({ icon, color }) {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d={icon[0]} />
      <Path d={icon[1]} />
    </Svg>
  );
}
function sentTitleOf(kind, expressionLabel) {
  if (kind === 'promise') return 'Promise sent';
  if (kind === 'text') return 'Message sent';
  return `${expressionLabel || 'Love'} sent`;
}
function previewOf(sent, partnerFirstName) {
  const me = partnerFirstName || 'Your partner';
  if (sent.kind === 'promise') return [`A promise from ${me} ♡`, sent.labels.join(' · ')];
  if (sent.kind === 'text') return [`${me} sent you a message`, `“${sent.note}”`];
  const phrase = sent.expressionPhrase || `“${sent.expressionLabel}”`;
  return [`${me} sent you ${phrase}${sent.expressionEmoji ? ` ${sent.expressionEmoji}` : ''}`, 'A little love for you ♡'];
}
export default function PartnerCheckInCard({ name }) {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const reduceMotion = useReduceMotion();
  const { accessToken, today, userName } = state;
  const [checkIn, setCheckIn] = useState(null);
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState('pick');
  const [picked, setPicked] = useState([]);
  const [note, setNote] = useState('');
  const [text, setText] = useState('');
  const [expression, setExpression] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(null);
  useEffect(() => {
    partnerApi
      .getPartnerCheckIn(accessToken)
      .then(setCheckIn)
      .catch(() => {});
  }, [accessToken, today]);
  if (!checkIn) return null;
  const her = name || 'her';
  const me = (userName || '').trim().split(/\s+/)[0];
  const sentToday = checkIn.sentToday || 0;
  const byKind = checkIn.sentByKind || {};
  const labelOf = id => (checkIn.options || []).find(o => o.id === id)?.label || id;
  const expressions = checkIn.expressions || [];
  const categories = checkIn.categories || [];
  const starters = checkIn.starters || [];
  const titleOf = id => (id === 'sent' ? 'Sent ♡' : categories.find(cat => cat.id === id)?.label);
  function reset() {
    setPicked([]);
    setNote('');
    setText('');
    setExpression(null);
  }
  function openSheet() {
    reset();
    setScreen('pick');
    setOpen(true);
  }
  function backToPick() {
    reset();
    setScreen('pick');
  }
  async function send(body) {
    if (busy) return;
    setBusy(true);
    try {
      const result = await partnerApi.partnerCheckIn(body, accessToken);
      setCheckIn(result);
      setSent({
        kind: body.kind,
        labels: (body.supports || []).map(labelOf),
        note: body.note,
        expression: body.expression,
        expressionLabel: expressions.find(e => e.id === body.expression)?.label,
        expressionEmoji: expressions.find(e => e.id === body.expression)?.emoji,
        expressionPhrase: expressions.find(e => e.id === body.expression)?.phrase,
        pointsAwarded: result.pointsAwarded,
        streak: result.streak,
      });
      setScreen('sent');
      if (result.pointsAwarded > 0) {
        rewardsApi
          .getSummary(accessToken)
          .then(data => dispatch({ type: A.REWARDS_HYDRATED, ...data }))
          .catch(() => {});
      }
    } catch (e) {
      dispatch({ type: A.SHOW_TOAST, icon: '🌸', text: e.message });
    } finally {
      setBusy(false);
    }
  }
  const teaserTitle = sentToday === 0 ? `Show ${her} some love ♡` : `Show ${her} more love ♡`;
  const teaserSub =
    sentToday === 0 ? 'Tap to pick something sweet' : `${sentToday} sent today · ${checkIn.streak}-day streak · tap to send more`;
  const preview = sent ? previewOf(sent, me) : null;
  return (
    <>
      <PressScale
        onPress={openSheet}
        accessibilityLabel={teaserTitle}
        style={[s.card, s.teaser, sentToday > 0 && { backgroundColor: colors.primarySoft, borderColor: colors.primarySoftBorder }]}
      >
        {sentToday === 0 && <View style={s.blush} />}
        <Beating reduceMotion={reduceMotion}>
          <View style={[s.headHeart, sentToday > 0 && { backgroundColor: colors.surface }]}>
            <Heart size={16} color={colors.primary} />
          </View>
        </Beating>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={s.teaserTitle} numberOfLines={1}>
            {teaserTitle}
          </Text>
          <Text style={s.sub}>{teaserSub}</Text>
          {checkIn.herReply ? (
            <Appear reduceMotion={reduceMotion} style={s.replyRow}>
              <Text style={s.replyLine} numberOfLines={1}>
                <Text style={s.replyName}>{`${checkIn.herReply.name || her} felt your love ♡ `}</Text>
                {checkIn.herReply.note ? <Text style={s.replyNote}>{`“${checkIn.herReply.note}”`}</Text> : null}
              </Text>
            </Appear>
          ) : null}
        </View>
        {sentToday === 0 && (
          <View style={s.spPill}>
            <Text style={s.spTx}>{`+${checkIn.reward} SP`}</Text>
          </View>
        )}
      </PressScale>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={titleOf(screen) || `Show ${her} some love`}
        closeLabel={screen === 'sent' ? 'Close' : 'Cancel'}
        avoidKeyboard
      >
        {screen !== 'pick' && screen !== 'sent' && (
          <Pressable onPress={backToPick} hitSlop={10} style={s.backBtn} accessibilityRole="button" accessibilityLabel="Back">
            <Text style={s.backTx}>‹ Back</Text>
          </Pressable>
        )}
        {screen === 'pick' && (
          <View key="pick">
            <Appear reduceMotion={reduceMotion}>
              <Text style={s.sheetSub}>Little things, big love. How will you show it today?</Text>
            </Appear>
            {categories.map((k, i) => {
              const times = byKind[k.id] || 0;
              return (
                <Appear key={k.id} delay={80 + i * 70} reduceMotion={reduceMotion}>
                  <PressScale onPress={() => setScreen(k.id)} accessibilityLabel={k.label} style={s.kindRow}>
                    <View style={s.kindIcon}>
                      <KindIcon icon={KIND_ICONS[k.id] || FALLBACK_ICON} color={colors.primaryDark} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.kindTitle}>{k.label}</Text>
                      {k.sub ? <Text style={s.kindSub}>{k.sub}</Text> : null}
                    </View>
                    <Text style={s.kindTag}>{times === 0 ? '›' : times === 1 ? 'Sent today ›' : `Sent ${times}× ›`}</Text>
                  </PressScale>
                </Appear>
              );
            })}
            <Appear delay={320} reduceMotion={reduceMotion}>
              <Text style={s.footNote}>Send as often as you like · your first one each day earns SpotPoints</Text>
            </Appear>
          </View>
        )}
        {screen === 'promise' && (
          <Appear key="promise" reduceMotion={reduceMotion}>
            <Text style={s.sheetSub}>{`What will you do for ${her} today?`}</Text>
            <View style={s.grid}>
              {checkIn.options.map(option => (
                <Tile
                  key={option.id}
                  option={option}
                  on={picked.includes(option.id)}
                  onPress={() => setPicked(prev => (prev.includes(option.id) ? prev.filter(x => x !== option.id) : [...prev, option.id]))}
                  reduceMotion={reduceMotion}
                  c={colors}
                  s={s}
                />
              ))}
            </View>
            <TextInput
              value={note}
              onChangeText={v => setNote(v.slice(0, NOTE_MAX))}
              placeholder="Add a sweet note (optional)"
              placeholderTextColor={colors.textFaint}
              maxLength={NOTE_MAX}
              multiline
              style={s.noteInput}
            />
            <View style={[s.sendWrap, { opacity: picked.length ? 1 : 0.6 }]}>
              <Button
                onPress={() => send({ kind: 'promise', supports: picked, note: note.trim() || null })}
                disabled={busy || !picked.length}
              >
                {busy ? 'Sending…' : picked.length ? 'Send my promise ♡' : 'Pick at least one'}
              </Button>
            </View>
          </Appear>
        )}
        {screen === 'text' && (
          <Appear key="text" reduceMotion={reduceMotion}>
            <Text style={s.sheetSub}>{`Say something sweet. ${name || 'She'} gets it straight away.`}</Text>
            <View style={[s.chips, { justifyContent: 'center' }]}>
              {starters.map((label, i) => (
                <Appear key={label} delay={60 + i * 50} reduceMotion={reduceMotion}>
                  <PressScale onPress={() => setText(label)} style={s.starter} accessibilityLabel={`Use “${label}”`}>
                    <Text style={s.starterTx}>{label}</Text>
                  </PressScale>
                </Appear>
              ))}
            </View>
            <TextInput
              value={text}
              onChangeText={v => setText(v.slice(0, NOTE_MAX))}
              placeholder="Write it in your own words…"
              placeholderTextColor={colors.textFaint}
              maxLength={NOTE_MAX}
              multiline
              style={[s.noteInput, s.textInput]}
              accessibilityLabel="Your message"
            />
            <Text style={s.counter}>{`${text.length}/${NOTE_MAX}`}</Text>
            <View style={[s.sendWrap, { opacity: text.trim() ? 1 : 0.6 }]}>
              <Button onPress={() => send({ kind: 'text', note: text.trim() })} disabled={busy || !text.trim()}>
                {busy ? 'Sending…' : 'Send ♡'}
              </Button>
            </View>
          </Appear>
        )}
        {screen === 'expression' && (
          <Appear key="expression" reduceMotion={reduceMotion}>
            <Text style={s.sheetSub}>Pick one to send her right now.</Text>
            <View style={s.grid}>
              {expressions.map((e, i) => {
                const on = expression === e.id;
                return (
                  <Appear key={e.id} delay={60 + i * 45} reduceMotion={reduceMotion} style={{ width: '31.5%' }}>
                    <PressScale
                      onPress={() => setExpression(e.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={e.label}
                      style={[s.exprTile, on && { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primarySoft }]}
                    >
                      <Wiggle active={on} reduceMotion={reduceMotion}>
                        <Text style={s.exprEmoji}>{e.emoji || '♡'}</Text>
                      </Wiggle>
                      <Text style={[s.tileTx, { color: on ? colors.primaryDark : colors.textSecondary }]} numberOfLines={1}>
                        {e.label}
                      </Text>
                    </PressScale>
                  </Appear>
                );
              })}
            </View>
            <View style={[s.sendWrap, { opacity: expression ? 1 : 0.6 }]}>
              <Button onPress={() => send({ kind: 'expression', expression })} disabled={busy || !expression}>
                {busy ? 'Sending…' : 'Send ♡'}
              </Button>
            </View>
          </Appear>
        )}
        {screen === 'sent' && sent && (
          <Appear key="sent" reduceMotion={reduceMotion} style={{ alignItems: 'center' }}>
            <View style={s.sentHeart}>
              {!reduceMotion &&
                BURST.map(([x, y, delay], i) => (
                  <BurstHeart key={i} x={x} y={y} delay={delay} color={[colors.primaryLight, colors.tertiary, colors.primary][i % 3]} />
                ))}
              <Beating reduceMotion={reduceMotion}>
                <View style={s.sentCircle}>
                  {sent.kind === 'expression' ? (
                    <Text style={s.sentEmoji}>{sent.expressionEmoji || '♡'}</Text>
                  ) : (
                    <KindIcon icon={KIND_ICONS[sent.kind] || FALLBACK_ICON} color={colors.primary} />
                  )}
                </View>
              </Beating>
            </View>
            <Text style={s.sentTitle}>{sentTitleOf(sent.kind, sent.expressionLabel)}</Text>
            <Text style={s.sentSub}>{`${name || 'She'} will see this.`}</Text>
            <Appear delay={250} reduceMotion={reduceMotion} style={s.preview}>
              <Text style={s.previewLabel}>WHAT SHE’LL SEE</Text>
              <Text style={s.previewTitle}>{preview[0]}</Text>
              <Text style={s.previewBody} numberOfLines={2}>
                {preview[1]}
              </Text>
            </Appear>
            <Text style={[s.stat, { color: sent.pointsAwarded > 0 ? colors.tertiaryDeep : colors.textSecondary }]}>
              {sent.pointsAwarded > 0
                ? `+${sent.pointsAwarded} SP · ${sent.streak}-day streak`
                : `${sent.streak}-day streak · points come with your first send each day`}
            </Text>
            <View style={s.sentActions}>
              <View style={{ flex: 1 }}>
                <Button variant="secondary" onPress={backToPick}>
                  Send something else
                </Button>
              </View>
              <View style={{ flex: 1 }}>
                <Button onPress={() => setOpen(false)}>Done</Button>
              </View>
            </View>
          </Appear>
        )}
      </BottomSheet>
    </>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    card: { borderRadius: 26, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
    teaser: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 22 },
    blush: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: c.primarySoft, top: -70, right: -50 },
    headHeart: { width: 32, height: 32, borderRadius: 16, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
    teaserTitle: { fontFamily: FONT.serif, fontSize: 17, lineHeight: 22, color: c.textPrimary },
    sub: { fontSize: 10, color: c.textSecondary, marginTop: 2 },
    replyRow: { marginTop: 6, backgroundColor: c.surface, borderRadius: 12, paddingVertical: 5, paddingHorizontal: 8 },
    replyLine: { fontSize: 10.5 },
    replyName: { fontSize: 10.5, fontWeight: '700', color: c.primaryDark },
    replyNote: { fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 12.5, color: c.textPrimary },
    spPill: { backgroundColor: c.tertiarySoft, borderRadius: 99, paddingVertical: 4, paddingHorizontal: 8 },
    spTx: { fontSize: 10, fontWeight: '800', color: c.tertiaryDeep },
    backBtn: { alignSelf: 'flex-start', paddingVertical: 6, marginTop: -6, marginBottom: 4 },
    backTx: { fontSize: 12, fontWeight: '700', color: c.primaryDark },
    sheetSub: { fontSize: 11, color: c.textSecondary, textAlign: 'center', marginBottom: 14 },
    kindRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      minHeight: 70,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: c.primarySoftBorder,
      backgroundColor: c.surface,
      marginBottom: 10,
    },
    kindIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
    kindTitle: { fontSize: 13, fontWeight: '700', color: c.textPrimary },
    kindSub: { fontSize: 10.5, color: c.textSecondary, marginTop: 2 },
    kindTag: { fontSize: 10, fontWeight: '700', color: c.primaryDark },
    footNote: { fontSize: 10, color: c.textSecondary, textAlign: 'center', marginTop: 4, marginBottom: 8 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8 },
    tile: {
      height: 70,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    float: { position: 'absolute', top: 6 },
    tileTx: { fontSize: 10, fontWeight: '700' },
    exprTile: {
      height: 84,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: 4,
    },
    exprEmoji: { fontSize: 30, lineHeight: 38 },
    tileEmoji: { fontSize: 20, lineHeight: 26 },
    noteInput: {
      marginTop: 12,
      minHeight: 44,
      maxHeight: 96,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 12,
      fontSize: 11.5,
      color: c.textPrimary,
    },
    textInput: { minHeight: 92, maxHeight: 140, fontSize: 13, lineHeight: 19, fontFamily: FONT.serif, fontStyle: 'italic' },
    counter: { fontSize: 9.5, color: c.textSecondary, textAlign: 'right', marginTop: 4 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    starter: {
      borderWidth: 1.5,
      borderColor: c.primarySoftBorder,
      backgroundColor: c.primarySoft,
      borderRadius: 99,
      paddingVertical: 7,
      paddingHorizontal: 11,
    },
    starterTx: { fontSize: 10.5, fontWeight: '700', color: c.primaryDark },
    sendWrap: { marginTop: 14, marginBottom: 8 },
    sentHeart: { width: 64, height: 64, marginTop: 4 },
    sentCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
    sentEmoji: { fontSize: 30, lineHeight: 38 },
    sentTitle: { fontFamily: FONT.serif, fontSize: 22, lineHeight: 28, color: c.textPrimary, marginTop: 12 },
    sentSub: { fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 14, lineHeight: 20, color: c.textSecondary, marginTop: 2 },
    preview: {
      alignSelf: 'stretch',
      marginTop: 14,
      padding: 12,
      borderRadius: 16,
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.border,
    },
    previewLabel: { fontSize: 9, fontWeight: '700', color: c.textSecondary, letterSpacing: 0.8 },
    previewTitle: { fontSize: 12, fontWeight: '700', color: c.textPrimary, marginTop: 6 },
    previewBody: { fontSize: 11, color: c.textSecondary, marginTop: 2 },
    stat: { fontSize: 10, fontWeight: '700', marginTop: 12, textAlign: 'center' },
    sentActions: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 8, alignSelf: 'stretch' },
  });
}
