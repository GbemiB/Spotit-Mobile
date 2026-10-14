import { View, Text, Animated, Easing, AccessibilityInfo, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const STAR_PATH = 'M12 1c.6 5 2.4 8.4 11 11-8.6 2.6-10.4 6-11 11-.6-5-2.4-8.4-11-11 8.6-2.6 10.4-6 11-11z';
const STARS = [
  { x: 0.72, y: 0.14, size: 10, color: '#F2A0AE', delay: 0, duration: 3200 },
  { x: 0.88, y: 0.42, size: 7, color: '#E2B86A', delay: 1100, duration: 2600 },
  { x: 0.6, y: 0.06, size: 6, color: '#DC5A74', delay: 2000, duration: 3600 },
  { x: 0.08, y: 0.78, size: 8, color: '#E2B86A', delay: 600, duration: 3000 },
  { x: 0.3, y: 0.88, size: 6, color: '#F2A0AE', delay: 1700, duration: 2800 },
  { x: 0.94, y: 0.8, size: 9, color: '#F2A0AE', delay: 2400, duration: 3400 },
  { x: 0.48, y: 0.7, size: 5, color: '#DC5A74', delay: 300, duration: 2400 },
];
const BUBBLE_COLORS = ['#F2A0AE', '#F6D9BE', '#FCE3DC', '#E2B86A'];
const BUBBLES = Array.from({ length: 8 }, (_, i) => ({
  x: ((i * 12 + 4) % 100) / 100,
  size: 5 + (i % 3) * 3,
  color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
  duration: 6000 + (i % 4) * 1500,
  delay: i * 900,
  sway: (i % 2 ? 1 : -1) * (10 + (i % 3) * 10),
}));
const BURST = Array.from({ length: 10 }, (_, i) => ({
  angle: (i / 10) * Math.PI * 2,
  size: 4 + (i % 2) * 2,
  color: i % 2 ? '#E2B86A' : '#F2A0AE',
}));

export function useAnimatedValue(initial) {
  const [value] = useState(() => new Animated.Value(initial));
  return value;
}

export function useReduceMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(v => alive && setReduce(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      sub?.remove();
    };
  }, []);
  return reduce;
}

function useLoop(make, enabled = true) {
  const [anim] = useState(make);
  useEffect(() => {
    if (!enabled) return undefined;
    anim.start();
    return () => anim.stop();
  }, [anim, enabled]);
}

export function FadeIn({ delay = 0, from = 'bottom', reduceMotion, children }) {
  const v = useAnimatedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(1);
      return undefined;
    }
    const anim = Animated.timing(v, { toValue: 1, duration: 650, delay, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, delay, v]);
  const offset = v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const transform = from === 'left' ? [{ translateX: Animated.multiply(offset, -1) }] : [{ translateY: offset }];
  return <Animated.View style={{ opacity: v, transform }}>{children}</Animated.View>;
}

export function AnimatedLabel({ style, reduceMotion, children }) {
  const v = useAnimatedValue(reduceMotion ? 1 : 0);
  const base = StyleSheet.flatten(style)?.letterSpacing ?? 0;
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(1);
      return undefined;
    }
    const anim = Animated.timing(v, { toValue: 1, duration: 900, delay: 200, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, v]);
  const letterSpacing = v.interpolate({ inputRange: [0, 1], outputRange: [base + 5, base] });
  return <Animated.Text style={[style, { opacity: v, letterSpacing }]}>{children}</Animated.Text>;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

function HeadlineWord({ text, style, color, underline, delay, reduceMotion }) {
  const v = useAnimatedValue(reduceMotion ? 1 : 0);
  const draw = useAnimatedValue(reduceMotion ? 1 : 0);
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(1);
      draw.setValue(1);
      return undefined;
    }
    const anim = Animated.parallel([
      Animated.timing(v, { toValue: 1, duration: 700, delay, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }),
      Animated.timing(draw, { toValue: 1, duration: 800, delay: delay + 750, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, delay, v, draw]);
  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['4deg', '0deg'] }) },
        ],
      }}
    >
      <Text style={[style, color && { color }]}>{text}</Text>
      {underline && (
        <View pointerEvents="none" style={styles.swoosh}>
          <Svg width="100%" height="10" viewBox="0 0 100 10" preserveAspectRatio="none">
            <AnimatedPath
              d="M2 7 Q 30 2, 55 6 T 98 4"
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray="110"
              strokeDashoffset={draw.interpolate({ inputRange: [0, 1], outputRange: [110, 0] })}
            />
          </Svg>
        </View>
      )}
    </Animated.View>
  );
}

export function AnimatedHeadline({ parts, style, highlightColor, reduceMotion, delay = 350 }) {
  const flat = StyleSheet.flatten(style) || {};
  const words = [];
  parts.forEach(p =>
    p.text
      .split(' ')
      .filter(Boolean)
      .forEach(w => words.push({ text: w, highlight: !!p.highlight })),
  );
  return (
    <View
      style={[styles.headline, { marginTop: flat.marginTop ?? 0 }]}
      accessible
      accessibilityRole="header"
      accessibilityLabel={words.map(w => w.text).join(' ')}
    >
      {words.map((w, i) => (
        <View key={`${i}-${w.text}`} style={{ marginRight: i === words.length - 1 ? 0 : (flat.fontSize ?? 28) * 0.24 }}>
          <HeadlineWord
            text={w.text}
            style={[style, { marginTop: 0 }]}
            color={w.highlight ? highlightColor : null}
            underline={w.highlight}
            delay={delay + i * 90}
            reduceMotion={reduceMotion}
          />
        </View>
      ))}
    </View>
  );
}

export function RiseText({ style, delay = 0, pop = false, popDelay = 2100, reduceMotion, children }) {
  const v = useAnimatedValue(reduceMotion ? 1 : 0);
  const bounce = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) {
      v.setValue(1);
      return undefined;
    }
    const steps = [Animated.timing(v, { toValue: 1, duration: 700, delay, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true })];
    if (pop) {
      steps.push(
        Animated.sequence([
          Animated.delay(Math.max(0, popDelay - delay - 700)),
          Animated.timing(bounce, { toValue: 1, duration: 250, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(bounce, { toValue: 0, duration: 250, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
      );
    }
    const anim = Animated.sequence(steps);
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, delay, pop, popDelay, v, bounce]);
  return (
    <Animated.Text
      style={[
        style,
        {
          opacity: v,
          transform: [
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
            { scale: bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.Text>
  );
}

export function HeroFrame({ borderColor, radius, width = 1.5, gradient, duration = 6000, reduceMotion, children }) {
  const spin = useAnimatedValue(0);
  useLoop(
    () => Animated.loop(Animated.timing(spin, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })),
    !reduceMotion,
  );
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={{ borderRadius: radius, overflow: 'hidden', padding: width, backgroundColor: borderColor }}>
      {!reduceMotion && (
        <Animated.View pointerEvents="none" style={[styles.frameSpinner, { transform: [{ rotate }] }]}>
          <LinearGradient
            colors={gradient || [borderColor, borderColor, '#F2A0AE', '#E2B86A', borderColor, borderColor]}
            locations={gradient ? undefined : [0, 0.42, 0.48, 0.52, 0.58, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
      {children}
    </View>
  );
}

export function Orb({ size, color, top, left, path, duration }) {
  const v = useAnimatedValue(0);
  useLoop(() => Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true })));
  const steps = path.length;
  const inputRange = path.map((_, i) => i / (steps - 1));
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        transform: [
          { translateX: v.interpolate({ inputRange, outputRange: path.map(p => p[0]) }) },
          { translateY: v.interpolate({ inputRange, outputRange: path.map(p => p[1]) }) },
        ],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="orb" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={color} stopOpacity="0.9" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill="url(#orb)" />
      </Svg>
    </Animated.View>
  );
}

function Wave({ width, height, color, duration, reverse, bottom, d }) {
  const v = useAnimatedValue(0);
  useLoop(() => Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })));
  const translateX = v.interpolate({ inputRange: [0, 1], outputRange: reverse ? [-width, 0] : [0, -width] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', left: 0, bottom, width: width * 2, height, transform: [{ translateX }] }}
    >
      <Svg width={width * 2} height={height} viewBox={`0 0 800 ${height}`} preserveAspectRatio="none">
        <Path d={d} fill={color} />
      </Svg>
    </Animated.View>
  );
}

export function Star({ x, y, size, color, delay, duration, width, height }) {
  const v = useAnimatedValue(0);
  useLoop(() =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ),
  );
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x * width,
        top: y * height,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0, 0.9] }),
        transform: [
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) },
        ],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={STAR_PATH} fill={color} />
      </Svg>
    </Animated.View>
  );
}

function Bubble({ x, size, color, duration, delay, sway, width }) {
  const v = useAnimatedValue(0);
  useLoop(() =>
    Animated.sequence([
      Animated.delay(delay),
      Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })),
    ]),
  );
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: -14,
        left: x * width,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: v.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.7, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -260] }) },
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, sway] }) },
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.1] }) },
        ],
      }}
    />
  );
}

export function Sweep({ width }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    const anim = Animated.timing(v, { toValue: 1, duration: 1300, delay: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true });
    anim.start();
    return () => anim.stop();
  }, [width, v]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 110,
        transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [-160, width + 50] }) }, { skewX: '-18deg' }],
      }}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

export function HeroBackdrop({ isDark, reduceMotion }) {
  const [size, setSize] = useState(null);
  if (reduceMotion) return null;
  const w = size?.width ?? 0;
  const h = size?.height ?? 0;
  const orbA = isDark ? 'rgba(155,134,201,0.35)' : '#FBE4EA';
  const orbB = isDark ? 'rgba(220,90,116,0.35)' : '#FCE3DC';
  const wave1 = isDark ? 'rgba(220,90,116,0.10)' : 'rgba(242,160,174,0.16)';
  const wave2 = isDark ? 'rgba(214,162,78,0.08)' : 'rgba(246,217,190,0.30)';
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={e => setSize(e.nativeEvent.layout)}>
      {w > 0 && (
        <>
          <Orb
            size={170}
            color={orbA}
            top={h * 0.15}
            left={w * 0.3}
            duration={16000}
            path={[
              [0, 0],
              [70, -30],
              [20, 40],
              [-60, 10],
              [0, 0],
            ]}
          />
          <Orb
            size={150}
            color={orbB}
            top={-50}
            left={-40}
            duration={12000}
            path={[
              [0, 0],
              [120, 60],
              [0, 0],
            ]}
          />
          <Wave
            width={w}
            height={70}
            bottom={-6}
            color={wave1}
            duration={9000}
            d="M0 35 C 100 5, 100 65, 200 35 S 300 5, 400 35 S 500 65, 600 35 S 700 5, 800 35 V 70 H 0 Z"
          />
          <Wave
            width={w}
            height={56}
            bottom={-8}
            color={wave2}
            duration={6000}
            reverse
            d="M0 28 C 100 52, 100 4, 200 28 S 300 52, 400 28 S 500 4, 600 28 S 700 52, 800 28 V 56 H 0 Z"
          />
          {BUBBLES.map((b, i) => (
            <Bubble key={`b${i}`} {...b} width={w} />
          ))}
          {STARS.map((st, i) => (
            <Star key={`s${i}`} {...st} width={w} height={h} />
          ))}
          <Sweep width={w} />
        </>
      )}
    </View>
  );
}

export function AnimatedCycleBar({
  value,
  colors,
  trackColor,
  accent,
  surface,
  height = 8,
  fertile,
  fertileColor,
  ovulation,
  ovulationColor,
  shineColors = ['rgba(255,255,255,0)', 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0)'],
  reduceMotion,
}) {
  const [barWidth, setBarWidth] = useState(0);
  const pct = Math.min(1, Math.max(0, value || 0));
  const fill = useAnimatedValue(reduceMotion ? pct : 0);
  const pulse = useAnimatedValue(0);
  const shine = useAnimatedValue(0);
  const burst = useAnimatedValue(0);
  const marks = useAnimatedValue(reduceMotion ? 1 : 0);
  const ovPulse = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) {
      marks.setValue(1);
      return undefined;
    }
    marks.setValue(0);
    const anim = Animated.timing(marks, {
      toValue: 1,
      duration: 700,
      delay: 1300,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, marks]);
  useLoop(
    () => Animated.loop(Animated.timing(ovPulse, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: true })),
    !reduceMotion && ovulation != null,
  );
  useEffect(() => {
    if (reduceMotion) {
      fill.setValue(pct);
      return undefined;
    }
    fill.setValue(0);
    burst.setValue(0);
    const anim = Animated.sequence([
      Animated.timing(fill, { toValue: pct, duration: 1600, delay: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(burst, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [pct, reduceMotion, fill, burst]);
  useLoop(
    () =>
      Animated.parallel([
        Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true })),
        Animated.loop(
          Animated.sequence([
            Animated.delay(2000),
            Animated.timing(shine, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.timing(shine, { toValue: 0, duration: 0, useNativeDriver: true }),
          ]),
        ),
      ]),
    !reduceMotion,
  );
  const fillWidth = fill.interpolate({ inputRange: [0, 1], outputRange: [0, barWidth] });
  const filledPx = barWidth * pct;
  return (
    <View onLayout={e => setBarWidth(e.nativeEvent.layout.width)}>
      <View style={{ height, borderRadius: 999, backgroundColor: trackColor, overflow: 'hidden' }}>
        <Animated.View style={{ height: '100%', width: fillWidth, borderRadius: 999, overflow: 'hidden' }}>
          <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          {!reduceMotion && filledPx > 0 && (
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: Math.max(24, filledPx * 0.4),
                transform: [{ translateX: shine.interpolate({ inputRange: [0, 1], outputRange: [-filledPx * 0.4, filledPx] }) }],
              }}
            >
              <LinearGradient colors={shineColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
            </Animated.View>
          )}
        </Animated.View>
        {fertile && barWidth > 0 && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: fertile.start * barWidth,
              width: (fertile.end - fertile.start) * barWidth,
              borderRadius: 999,
              backgroundColor: fertileColor,
              opacity: marks,
            }}
          />
        )}
      </View>
      {ovulation != null && barWidth > 0 && (
        <View pointerEvents="none" style={{ position: 'absolute', top: height / 2, left: ovulation * barWidth, width: 0, height: 0 }}>
          {!reduceMotion && (
            <Animated.View
              style={[
                styles.ovPulse,
                {
                  borderColor: ovulationColor,
                  opacity: ovPulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
                  transform: [{ scale: ovPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1] }) }],
                },
              ]}
            />
          )}
          <Animated.View
            style={[styles.ovDot, { backgroundColor: ovulationColor, borderColor: surface, opacity: marks, transform: [{ scale: marks }] }]}
          />
        </View>
      )}
      {!reduceMotion && barWidth > 0 && (
        <Animated.View pointerEvents="none" style={{ position: 'absolute', top: height / 2, left: fillWidth, width: 0, height: 0 }}>
          <Animated.View
            style={[
              styles.tipPulse,
              {
                backgroundColor: accent,
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2] }) }],
              },
            ]}
          />
          <View style={[styles.tipDot, { backgroundColor: surface, borderColor: accent, shadowColor: accent }]} />
          {BURST.map((b, i) => (
            <Animated.View
              key={i}
              style={{
                position: 'absolute',
                left: -b.size / 2,
                top: -b.size / 2,
                width: b.size,
                height: b.size,
                borderRadius: b.size / 2,
                backgroundColor: b.color,
                opacity: burst.interpolate({ inputRange: [0, 0.05, 1], outputRange: [0, 1, 0] }),
                transform: [
                  { translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(b.angle) * 26] }) },
                  { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(b.angle) * 26] }) },
                ],
              }}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
}

export function useCountTo(to, from, reduceMotion) {
  const [shown, setShown] = useState(from);
  const skip = reduceMotion || to == null || from == null;
  useEffect(() => {
    if (skip) return undefined;
    const v = new Animated.Value(from);
    const id = v.addListener(({ value }) => setShown(Math.round(value)));
    const anim = Animated.timing(v, { toValue: to, duration: 1600, delay: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    anim.start();
    return () => {
      anim.stop();
      v.removeListener(id);
    };
  }, [to, from, skip]);
  return skip ? to : shown;
}

const styles = StyleSheet.create({
  headline: { flexDirection: 'row', flexWrap: 'wrap' },
  swoosh: { position: 'absolute', left: 0, right: 0, bottom: 2, height: 10 },
  frameSpinner: { position: 'absolute', width: 900, height: 900, left: '50%', top: '50%', marginLeft: -450, marginTop: -450 },
  ovDot: { position: 'absolute', left: -7, top: -7, width: 14, height: 14, borderRadius: 7, borderWidth: 2.5 },
  ovPulse: { position: 'absolute', left: -7, top: -7, width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  tipPulse: { position: 'absolute', left: -9, top: -9, width: 18, height: 18, borderRadius: 9 },
  tipDot: {
    position: 'absolute',
    left: -6,
    top: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
});
