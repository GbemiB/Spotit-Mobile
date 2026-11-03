import { Animated, View, StyleSheet } from 'react-native';
import { useState } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../../../shared/styles/index.js';
import { PressScale, useLoopValue, Shine } from '../common/SpotlightFx.jsx';
import { ds, useCountUp } from './motion.jsx';

export const COIN_STAR = 'M12 6.8l1.5 3.2 3.4.4-2.5 2.3.7 3.4-3.1-1.8-3.1 1.8.7-3.4-2.5-2.3 3.4-.4z';
const COIN_LINE = 'M12 8v8M9.8 10h3.4a1.4 1.4 0 0 1 0 2.8h-2.4a1.4 1.4 0 0 0 0 2.8h3.4';

export function CircleButton({ t, icon, label, onPress, size = 44, iconSize = 18, color }) {
  return (
    <PressScale onPress={onPress} accessibilityLabel={label}>
      <View
        style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: t.surface, borderColor: t.border }]}
      >
        <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <Path d={icon} stroke={color || t.pinkInk} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    </PressScale>
  );
}

export function SpPill({ t, balance, reduceMotion, onPress, height = 36 }) {
  const shown = useCountUp(balance, reduceMotion);
  const body = (
    <View style={[styles.pill, { height, backgroundColor: t.surface, borderColor: t.border }]}>
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={10} fill={t.goldSoft} stroke={t.gold} strokeWidth={1.8} />
        <Path d={COIN_STAR} fill={t.gold} />
      </Svg>
      <Text style={[styles.pillText, { color: t.text }]}>{shown.toLocaleString()} SP</Text>
    </View>
  );
  if (!onPress) return body;
  return (
    <PressScale onPress={onPress} accessibilityLabel={`${balance} SpotPoints`}>
      {body}
    </PressScale>
  );
}

export function CoinPill({ t, value, label, style }) {
  return (
    <View accessibilityLabel={label} style={[styles.small, { backgroundColor: t.surface, borderColor: t.border }, style]}>
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={9} fill={t.goldSoft} stroke={t.gold} strokeWidth={1.8} />
        <Path d={COIN_LINE} stroke={t.goldInk} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      </Svg>
      <Text style={[styles.smallText, { color: t.text }]}>{value}</Text>
    </View>
  );
}

export function AnimIcon({ d, kind, color, size = 24, reduceMotion }) {
  const v = useLoopValue(kind === 'spin' ? 9000 : kind === 'sway' ? 4000 : 3200, reduceMotion, { linear: kind === 'spin' });
  let transform = [];
  if (kind === 'spin') transform = [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }];
  else if (kind === 'sway') transform = [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-4deg', '4deg'] }) }];
  else transform = [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }];
  return (
    <Animated.View style={{ transform }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d={d} stroke={color} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
}

export function PinkButton({ t, label, onPress, disabled, reduceMotion, height = 54, children, style }) {
  const [w, setW] = useState(0);
  return (
    <PressScale onPress={onPress} disabled={disabled} accessibilityLabel={label} style={style}>
      <View
        onLayout={e => setW(e.nativeEvent.layout.width)}
        style={[styles.btn, { height, backgroundColor: disabled ? t.disabledBg : t.pink }]}
      >
        {!disabled ? <Shine width={w} reduceMotion={reduceMotion} /> : null}
        {children || <Text style={[styles.btnText, { color: disabled ? t.disabledFg : '#FFFFFF' }]}>{label}</Text>}
      </View>
    </PressScale>
  );
}

export function GhostButton({ t, label, onPress, height = 48, style }) {
  return (
    <PressScale onPress={onPress} accessibilityLabel={label} style={style}>
      <View style={[styles.ghost, { height, borderColor: t.border }]}>
        <Text style={[styles.ghostText, { color: t.text2 }]}>{label}</Text>
      </View>
    </PressScale>
  );
}

export function Glow({ t, height = 400 }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height }}>
      <LinearGradient colors={[t.glow, t.bg]} style={{ flex: 1 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 7, paddingRight: 12, borderRadius: 999, borderWidth: 1 },
  pillText: { fontSize: ds(13), fontWeight: '800' },
  small: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 34,
    paddingLeft: 6,
    paddingRight: 10,
    borderRadius: 17,
    borderWidth: 1,
  },
  smallText: { fontSize: ds(13), fontWeight: '800' },
  btn: { borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexDirection: 'row', gap: 8 },
  btnText: { fontSize: 15, fontWeight: '800' },
  ghost: { borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  ghostText: { fontSize: ds(13), fontWeight: '700' },
});
