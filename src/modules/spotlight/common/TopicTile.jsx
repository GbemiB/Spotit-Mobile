import { Animated, Platform, View, StyleSheet } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Text, FONT } from '../../../shared/styles/index.js';
import { LockIcon } from '../../../components/ui/icons.jsx';
import { PressScale, Icon, useLoopValue } from './SpotlightFx.jsx';
import TopicIcon, { TOPIC_ICONS, kf, useTap } from './TopicIcon.jsx';
import { tone, GROUP_ICONS } from './theme.js';

export const OPEN_DELAY_MS = 450;
const WELL_T = 900;
const SPECKS = [15, 75, 135, 195, 255, 315];

function fade(hex, alpha) {
  if (typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) return hex;
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

function tapFeel() {
  const done =
    Platform.OS === 'android'
      ? Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Virtual_Key)
      : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  Promise.resolve(done).catch(() => {});
}

export function iconPalette(toneName, isDark, c) {
  const t = tone(toneName, isDark);
  return { ...t, surface: c.surface, primary: c.primary, hl: isDark ? 'rgba(255,255,255,0.7)' : '#FFFFFF' };
}

export function TopicWell({ topic, locked, size = 60, index = 0, play, reduceMotion }) {
  const { colors: c, isDark } = useTheme();
  const p = iconPalette(locked ? 'locked' : topic.tone, isDark, c);
  const float = useLoopValue(4200, reduceMotion || locked, { delay: (index * 700) % 4200 });
  const tap = useTap(play, WELL_T, reduceMotion);
  const hasIcon = !locked && !!TOPIC_ICONS[topic.icon];
  const iconSize = Math.round(size * 0.73);
  const reach = size * 0.64;
  return (
    <View style={[styles.well, { width: size, height: size, borderRadius: size * 0.32, backgroundColor: p.bg, borderColor: p.line }]}>
      <LinearGradient
        colors={[fade(c.surface, isDark ? 0.18 : 0.9), fade(c.surface, 0)]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.75, y: 0.85 }}
        style={[StyleSheet.absoluteFill, { borderRadius: size * 0.32 }]}
        pointerEvents="none"
      />
      {!locked && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shadow,
            {
              bottom: size * 0.13,
              width: size * 0.46,
              backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(120,60,70,0.16)',
              opacity: float.interpolate({ inputRange: [0, 1], outputRange: [1, 0.6] }),
              transform: [{ scaleX: float.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] }) }],
            },
          ]}
        />
      )}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: size * 0.32,
            borderWidth: 2,
            borderColor: p.mid,
            opacity: kf(tap, WELL_T, [
              [0, 0],
              [20, 0.9],
              [700, 0],
            ]),
            transform: [
              {
                scale: kf(tap, WELL_T, [
                  [0, 1],
                  [700, 1.32],
                  [710, 1],
                ]),
              },
            ],
          },
        ]}
      />
      {SPECKS.map((a, i) => (
        <Animated.View
          key={a}
          pointerEvents="none"
          style={[
            styles.speck,
            {
              borderRadius: i % 2 ? 1 : 3,
              backgroundColor: i % 3 === 1 ? c.primary : p.mid,
              opacity: kf(tap, WELL_T, [
                [0, 0],
                [120, 0],
                [300, 1],
                [870, 0],
              ]),
              transform: [
                { rotate: `${a}deg` },
                {
                  translateY: kf(tap, WELL_T, [
                    [0, 0],
                    [120, 0],
                    [870, -reach],
                    [880, 0],
                  ]),
                },
                {
                  scale: kf(tap, WELL_T, [
                    [0, 0.4],
                    [120, 0.4],
                    [870, 1],
                    [880, 0.4],
                  ]),
                },
              ],
            },
          ]}
        />
      ))}
      <Animated.View style={{ transform: [{ translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }] }}>
        {locked ? (
          <LockIcon size={size * 0.34} color={p.ink} />
        ) : hasIcon ? (
          <TopicIcon icon={topic.icon} size={iconSize} palette={p} play={play} reduceMotion={reduceMotion} />
        ) : (
          <Icon d={GROUP_ICONS[topic.group] || GROUP_ICONS.body} size={size * 0.42} color={p.ink} />
        )}
      </Animated.View>
    </View>
  );
}

export default function TopicTile({ item, index, reduceMotion, onOpen }) {
  const { colors: c, isDark } = useTheme();
  const [play, setPlay] = useState(0);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const t = tone(item.locked ? 'locked' : item.topic.tone, isDark);
  function press() {
    if (timer.current) return;
    if (item.locked || reduceMotion) {
      onOpen();
      return;
    }
    tapFeel();
    setPlay(n => n + 1);
    timer.current = setTimeout(() => {
      timer.current = null;
      onOpen();
    }, OPEN_DELAY_MS);
  }
  const label = item.locked ? `${item.topic.name}, opens at ${item.topic.minAge}` : `${item.topic.name}, ${item.status.label}`;
  return (
    <View style={{ flex: 1 }}>
      <PressScale onPress={press} accessibilityLabel={label}>
        <View style={[styles.tile, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.topRow}>
            <TopicWell topic={item.topic} locked={item.locked} index={index} play={play} reduceMotion={reduceMotion} />
            {item.locked ? <Text style={[styles.age, { color: c.textMuted, borderColor: c.border }]}>18+</Text> : null}
          </View>
          <Text style={[styles.name, { color: item.locked ? c.textMuted : c.textPrimary }]} numberOfLines={2}>
            {item.topic.name}
          </Text>
          <View style={{ marginTop: 'auto' }}>
            <Text style={{ fontSize: 9.5, fontWeight: '600', color: t.ink }} numberOfLines={1}>
              {item.locked ? `Opens at ${item.topic.minAge}` : item.status.label}
            </Text>
            {!item.locked && (
              <View style={[styles.bar, { backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : c.border }]}>
                <View style={{ width: `${Math.max(item.status.pct, 3)}%`, height: '100%', borderRadius: 99, backgroundColor: t.ink }} />
              </View>
            )}
          </View>
        </View>
      </PressScale>
    </View>
  );
}

export function TopicGrid({ items, reduceMotion, onOpen }) {
  const rows = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return (
    <View style={{ gap: 10 }}>
      {rows.map((row, r) => (
        <View key={row[0].topic.id} style={{ flexDirection: 'row', gap: 10 }}>
          {row.map((item, i) => (
            <TopicTile key={item.topic.id} item={item} index={r * 2 + i} reduceMotion={reduceMotion} onOpen={() => onOpen(item)} />
          ))}
          {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { minHeight: 154, padding: 12, borderRadius: 20, borderWidth: 1.5, gap: 10 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  well: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  shadow: { position: 'absolute', height: 5, borderRadius: 99 },
  speck: { position: 'absolute', left: '50%', top: '50%', width: 5, height: 5, marginLeft: -2.5, marginTop: -2.5 },
  name: { fontFamily: FONT.serif, fontSize: 16, lineHeight: 19 },
  bar: { height: 5, borderRadius: 99, overflow: 'hidden', marginTop: 5 },
  age: { fontSize: 9.5, fontWeight: '700', borderWidth: 1, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3 },
});
