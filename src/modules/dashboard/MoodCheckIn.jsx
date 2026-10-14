import { View, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { useMemo, useEffect, useState } from 'react';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { todayISO } from '../../shared/utils/cycle.js';
import { useTheme, Text } from '../../shared/styles/index.js';
import * as logsApi from '../../shared/api/logs.js';
import { useAnimatedValue, useReduceMotion } from './HeroCardFx.jsx';

export const CHECK_IN_MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'calm', emoji: '😌', label: 'Calm' },
  { id: 'neutral', emoji: '😐', label: 'Okay' },
  { id: 'sad', emoji: '😔', label: 'Low' },
  { id: 'emotional', emoji: '🥺', label: 'Tender' },
];
const REPLIES = {
  happy: 'Love that! Saved to today’s log.',
  calm: 'A calm day, nice. Saved to today’s log.',
  neutral: 'Thanks for checking in. Saved to today’s log.',
  sad: 'Sorry you’re feeling low. Be gentle with yourself today.',
  emotional: 'Big feelings are normal around your period. Take it easy today.',
};
const BURST_COLORS = ['#E5383B', '#D6A24E', '#5FA98C', '#DC5A74', '#F2A0AE', '#E2B86A'];
const BURST = Array.from({ length: 16 }, (_, i) => ({
  angle: (i / 16) * Math.PI * 2 + (i % 2) * 0.2,
  dist: 40 + (i % 4) * 14,
  size: i % 3 === 0 ? 5 : 7,
  color: BURST_COLORS[i % BURST_COLORS.length],
}));

function MoodButton({ mood, index, selected, disabled, onPress, colors, s, reduceMotion }) {
  const idle = useAnimatedValue(0);
  const jump = useAnimatedValue(selected ? 1 : 0);
  const ripple = useAnimatedValue(1);
  const burst = useAnimatedValue(1);
  const press = useAnimatedValue(1);

  useEffect(() => {
    if (reduceMotion || selected) return undefined;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(2400 + index * 400),
        Animated.timing(idle, { toValue: 1, duration: 110, useNativeDriver: true }),
        Animated.timing(idle, { toValue: -1, duration: 130, useNativeDriver: true }),
        Animated.timing(idle, { toValue: 0.4, duration: 110, useNativeDriver: true }),
        Animated.timing(idle, { toValue: 0, duration: 110, useNativeDriver: true }),
        Animated.delay(Math.max(0, 1600 - index * 400)),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, selected, index, idle]);

  function handlePress() {
    if (disabled) return;
    if (!reduceMotion) {
      jump.setValue(0);
      ripple.setValue(0);
      burst.setValue(0);
      Animated.parallel([
        Animated.timing(jump, { toValue: 1, duration: 700, easing: Easing.out(Easing.back(3)), useNativeDriver: true }),
        Animated.timing(ripple, { toValue: 1, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(burst, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
    onPress(mood.id);
  }
  const pressTo = toValue => Animated.spring(press, { toValue, speed: 40, bounciness: 10, useNativeDriver: true }).start();

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => pressTo(0.92)}
      onPressOut={() => pressTo(1)}
      style={{ flex: 1 }}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={mood.label}
    >
      <Animated.View
        style={[
          s.mood,
          selected ? { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primarySoft } : null,
          { transform: [{ scale: Animated.multiply(press, selected ? 1.06 : 1) }] },
        ]}
      >
        {!reduceMotion && (
          <Animated.View
            pointerEvents="none"
            style={[
              s.ripple,
              {
                borderColor: colors.primary,
                opacity: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
                transform: [{ scale: ripple.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.9] }) }],
              },
            ]}
          />
        )}
        <Animated.Text
          style={[
            s.emoji,
            {
              transform: [
                { translateY: jump.interpolate({ inputRange: [0, 0.3, 0.6, 1], outputRange: [0, -16, 2, 0] }) },
                { scale: jump.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 1.4, 1] }) },
                { rotate: idle.interpolate({ inputRange: [-1, 1], outputRange: ['-14deg', '14deg'] }) },
              ],
            },
          ]}
        >
          {mood.emoji}
        </Animated.Text>
        <Text style={[s.label, selected && { color: colors.primaryDark, fontWeight: '700' }]}>{mood.label}</Text>
      </Animated.View>
      {!reduceMotion &&
        BURST.map((b, i) => (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: '50%',
              top: 30,
              width: b.size,
              height: b.size,
              marginLeft: -b.size / 2,
              borderRadius: i % 2 ? b.size / 2 : 1,
              backgroundColor: b.color,
              opacity: burst.interpolate({ inputRange: [0, 0.05, 0.9, 1], outputRange: [0, 1, 0.8, 0] }),
              transform: [
                { translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(b.angle) * b.dist] }) },
                { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(b.angle) * b.dist - 20] }) },
              ],
            }}
          />
        ))}
    </Pressable>
  );
}

function useMoodCheckIn() {
  const { state, dispatch } = useApp();
  const { logs, accessToken } = state;
  const [saving, setSaving] = useState(false);
  const today = todayISO();
  async function checkIn(mood) {
    if (saving) return;
    setSaving(true);
    try {
      const existing = logs?.[today] || {};
      const entry = {
        flow: existing.flow ?? null,
        mood,
        symptoms: existing.symptoms ?? [],
        notes: existing.notes ?? null,
        intimate: !!existing.intimate,
      };
      const saved = await logsApi.saveLog(today, entry, accessToken);
      dispatch({
        type: A.SAVE_LOG,
        date: today,
        entry: { flow: saved.flow, mood: saved.mood, symptoms: saved.symptoms, notes: saved.notes, intimate: saved.intimate },
        pointsAwarded: saved.pointsAwarded,
        newBalance: saved.newBalance,
        streak: saved.streak,
        isNewEntry: saved.isNewEntry,
      });
    } catch (e) {
      dispatch({ type: A.SHOW_TOAST, icon: '🌸', text: e.message });
    } finally {
      setSaving(false);
    }
  }
  return { selectedMood: logs?.[today]?.mood ?? null, saving, checkIn };
}

export default function MoodCheckIn() {
  const { selectedMood, saving, checkIn: onPick } = useMoodCheckIn();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const reduceMotion = useReduceMotion();
  const reply = useAnimatedValue(selectedMood ? 1 : 0);

  useEffect(() => {
    if (!selectedMood) return undefined;
    if (reduceMotion) {
      reply.setValue(1);
      return undefined;
    }
    reply.setValue(0);
    const anim = Animated.timing(reply, { toValue: 1, duration: 450, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [selectedMood, reduceMotion, reply]);

  return (
    <View style={s.card}>
      <View style={s.headRow}>
        <Text style={s.title}>How are you feeling today?</Text>
        {selectedMood ? <Text style={[s.badge, { color: colors.success }]}>Saved</Text> : null}
      </View>
      <View style={s.grid}>
        {CHECK_IN_MOODS.map((m, i) => (
          <MoodButton
            key={m.id}
            mood={m}
            index={i}
            selected={selectedMood === m.id}
            disabled={saving}
            onPress={onPick}
            colors={colors}
            s={s}
            reduceMotion={reduceMotion}
          />
        ))}
      </View>
      {selectedMood && REPLIES[selectedMood] ? (
        <Animated.View
          style={[
            s.reply,
            {
              opacity: reply,
              transform: [{ translateY: reply.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
            },
          ]}
        >
          <Text style={s.replyText}>{REPLIES[selectedMood]}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    card: {
      borderRadius: 26,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      paddingTop: 18,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    headRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 4 },
    title: { fontSize: 12, fontWeight: '700', color: c.textPrimary, flexShrink: 1 },
    badge: { fontSize: 10, fontWeight: '700', marginLeft: 8 },
    grid: { flexDirection: 'row', gap: 8, marginTop: 14 },
    mood: {
      height: 74,
      borderRadius: 18,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    ripple: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 18, borderWidth: 3 },
    emoji: { fontSize: 20, lineHeight: 30 },
    label: { fontSize: 10, fontWeight: '600', color: c.textSecondary },
    reply: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: c.primarySoft },
    replyText: { fontSize: 10, lineHeight: 19, color: c.textPrimary },
  });
}
