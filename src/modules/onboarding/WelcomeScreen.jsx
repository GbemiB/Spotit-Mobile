import { View, Image, Pressable, Dimensions, Animated, Easing, StyleSheet } from 'react-native';
import { useRef, useState, useMemo, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text } from '../../shared/styles/index.js';
import { ChevronRightIcon } from '../../components/ui/icons.jsx';
import { useAnimatedValue, useReduceMotion } from '../dashboard/HeroCardFx.jsx';
import PartnerArt from './PartnerArt.jsx';
import RhythmArt from './RhythmArt.jsx';
import FertilityArt from './FertilityArt.jsx';
const ARTS = { rhythm: RhythmArt, fertility: FertilityArt, partner: PartnerArt };
function SlideArt({ kind, reduceMotion }) {
  const Art = ARTS[kind];
  return <Art reduceMotion={reduceMotion} />;
}
const { width: W } = Dimensions.get('window');
const SLIDES = [
  {
    art: 'rhythm',
    title: "Know your body's rhythm",
    body: 'A few taps a day builds a picture only you have, and gentle reminders let you know before your period and ovulation.',
  },
  {
    art: 'fertility',
    title: 'Know your fertile window',
    body: 'We track ovulation and your fertile days so you always know where you stand.',
  },
  {
    art: 'partner',
    title: 'Love that shows up ♡',
    body: 'Invite your partner. They’ll know where you are in your cycle, and send promises, hugs and sweet notes right when it matters.',
  },
];
const PETALS = Array.from({ length: 9 }, (_, i) => ({
  x: ((i * 11 + 6) % 100) / 100,
  size: 7 + (i % 3) * 4,
  color: ['rgba(255,255,255,0.75)', 'rgba(255,214,222,0.85)', 'rgba(255,236,200,0.8)'][i % 3],
  duration: 6500 + (i % 4) * 1500,
  delay: i * 700,
  sway: (i % 2 ? 1 : -1) * (18 + (i % 3) * 14),
  spin: (i % 2 ? 1 : -1) * 320,
}));
const SPARKLES = [
  { x: 0.14, y: 0.16, size: 12, delay: 0 },
  { x: 0.82, y: 0.22, size: 9, delay: 900 },
  { x: 0.7, y: 0.62, size: 11, delay: 1800 },
  { x: 0.22, y: 0.7, size: 8, delay: 2600 },
];
const STAR = 'M12 1c.6 5 2.4 8.4 11 11-8.6 2.6-10.4 6-11 11-.6-5-2.4-8.4-11-11 8.6-2.6 10.4-6 11-11z';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RING_R = 29;
const RING_C = 2 * Math.PI * RING_R;

function Petal({ x, size, color, duration, delay, sway, spin, height }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })),
    ]);
    anim.start();
    return () => anim.stop();
  }, [delay, duration, v]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: -20,
        left: x * W,
        width: size,
        height: size,
        borderRadius: size / 2,
        borderTopRightRadius: 0,
        backgroundColor: color,
        opacity: v.interpolate({ inputRange: [0, 0.12, 0.85, 1], outputRange: [0, 1, 0.8, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 0.9] }) },
          { translateX: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, sway, sway * 0.3] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${spin}deg`] }) },
        ],
      }}
    />
  );
}

function Sparkle({ x, y, size, delay, height }) {
  const v = useAnimatedValue(0);
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(Math.max(0, 2600 - delay)),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [delay, v]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: x * W,
        top: y * height,
        opacity: v,
        transform: [
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] }) },
        ],
      }}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={STAR} fill="#FFFFFF" />
      </Svg>
    </Animated.View>
  );
}

function Slide({ slide, index, scrollX, enter, reduceMotion, s, children }) {
  const [photoH, setPhotoH] = useState(0);
  const zoom = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(zoom, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(zoom, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, zoom]);

  const range = [(index - 1) * W, index * W, (index + 1) * W];
  const swipe = reduceMotion
    ? null
    : {
        photoX: scrollX.interpolate({ inputRange: range, outputRange: [-W * 0.45, 0, W * 0.45], extrapolate: 'clamp' }),
        photoScale: scrollX.interpolate({ inputRange: range, outputRange: [1.15, 1, 1.15], extrapolate: 'clamp' }),
        photoTurn: scrollX.interpolate({ inputRange: range, outputRange: ['-6deg', '0deg', '6deg'], extrapolate: 'clamp' }),
        textX: scrollX.interpolate({ inputRange: range, outputRange: [W * 0.35, 0, -W * 0.35], extrapolate: 'clamp' }),
        bodyX: scrollX.interpolate({ inputRange: range, outputRange: [W * 0.6, 0, -W * 0.6], extrapolate: 'clamp' }),
        fade: scrollX.interpolate({ inputRange: range, outputRange: [0, 1, 0], extrapolate: 'clamp' }),
      };
  const enterY = enter.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });

  return (
    <View style={{ width: W, flex: 1 }}>
      <View style={s.photoWrap} onLayout={e => setPhotoH(e.nativeEvent.layout.height)}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            swipe && {
              transform: [
                { translateX: swipe.photoX },
                { scale: Animated.multiply(swipe.photoScale, zoom.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] })) },
                { rotate: swipe.photoTurn },
              ],
            },
          ]}
        >
          {slide.art ? (
            <View style={s.photo}>
              <SlideArt kind={slide.art} reduceMotion={reduceMotion} />
            </View>
          ) : (
            <Image source={slide.image} style={s.photo} resizeMode="cover" />
          )}
        </Animated.View>
        {!reduceMotion && photoH > 0 && (
          <>
            {PETALS.map((p, i) => (
              <Petal key={`p${i}`} {...p} height={photoH} />
            ))}
            {SPARKLES.map((sp, i) => (
              <Sparkle key={`s${i}`} {...sp} height={photoH} />
            ))}
          </>
        )}
        {children}
      </View>
      <View style={s.content}>
        <Animated.View
          style={{
            opacity: swipe ? Animated.multiply(swipe.fade, enter) : enter,
            transform: [{ translateX: swipe ? swipe.textX : 0 }, { translateY: enterY }],
          }}
        >
          <Text style={s.title}>{slide.title}</Text>
        </Animated.View>
        <Animated.View
          style={{
            opacity: swipe ? Animated.multiply(swipe.fade, enter) : enter,
            transform: [{ translateX: swipe ? swipe.bodyX : 0 }, { translateY: Animated.multiply(enterY, 1.6) }],
          }}
        >
          <Text style={s.body}>{slide.body}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

function NextButton({ page, onPress, colors, s, reduceMotion }) {
  const progress = useAnimatedValue((page + 1) / SLIDES.length);
  const pulse = useAnimatedValue(0);
  const press = useAnimatedValue(1);
  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: (page + 1) / SLIDES.length,
      duration: reduceMotion ? 0 : 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [page, reduceMotion, progress]);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, pulse]);
  const pressTo = toValue => Animated.spring(press, { toValue, speed: 40, bounciness: 10, useNativeDriver: true }).start();
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => pressTo(0.9)}
      onPressOut={() => pressTo(1)}
      accessibilityRole="button"
      accessibilityLabel="Next"
    >
      <Animated.View style={[s.nextWrap, { transform: [{ scale: press }] }]}>
        {!reduceMotion && (
          <Animated.View
            pointerEvents="none"
            style={[
              s.nextPulse,
              {
                borderColor: colors.authAccent,
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.35] }) }],
              },
            ]}
          />
        )}
        <Svg width={64} height={64} viewBox="0 0 64 64" style={StyleSheet.absoluteFill}>
          <Circle cx={32} cy={32} r={RING_R} stroke={colors.authBorder} strokeWidth={2.5} fill="none" />
          <AnimatedCircle
            cx={32}
            cy={32}
            r={RING_R}
            stroke={colors.authAccent}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${RING_C} ${RING_C}`}
            strokeDashoffset={progress.interpolate({ inputRange: [0, 1], outputRange: [RING_C, 0] })}
            transform="rotate(-90 32 32)"
          />
        </Svg>
        <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.arrowBtn}>
          <ChevronRightIcon size={15} color="#fff" />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

function GetStarted({ onPress, colors, s, reduceMotion }) {
  const [width, setWidth] = useState(0);
  const shine = useAnimatedValue(0);
  const breathe = useAnimatedValue(0);
  const shift = useAnimatedValue(0);
  const press = useAnimatedValue(1);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(shine, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(shine, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.delay(1400),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(breathe, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(breathe, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(shift, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(shift, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ),
    ]);
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, shine, breathe, shift]);
  const pressTo = toValue => Animated.spring(press, { toValue, speed: 40, bounciness: 10, useNativeDriver: true }).start();
  return (
    <Pressable onPress={onPress} onPressIn={() => pressTo(0.95)} onPressOut={() => pressTo(1)} style={s.ctaFull} accessibilityRole="button">
      <Animated.View style={{ transform: [{ scale: press }] }}>
        <Animated.View
          pointerEvents="none"
          style={[
            s.ctaGlow,
            {
              backgroundColor: colors.authAccent,
              opacity: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] }),
              transform: [{ scaleX: breathe.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.02] }) }],
            },
          ]}
        />
        <View style={s.ctaFullFill} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
          {reduceMotion || width === 0 ? (
            <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          ) : (
            <>
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: width * 2,
                  transform: [{ translateX: shift.interpolate({ inputRange: [0, 1], outputRange: [0, -width] }) }],
                }}
              >
                <LinearGradient
                  colors={[...colors.authGradientCta, colors.authGradientCta[0], colors.authGradientCta[1]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: 90,
                  transform: [
                    { translateX: shine.interpolate({ inputRange: [0, 1], outputRange: [-120, width + 30] }) },
                    { skewX: '-20deg' },
                  ],
                }}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </>
          )}
          <Text style={s.ctaFullTx}>Get Started</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function WelcomeScreen() {
  const { dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const scrollRef = useRef(null);
  const scrollX = useAnimatedValue(0);
  const enter = useAnimatedValue(reduceMotion ? 1 : 0);
  const [page, setPage] = useState(0);
  const isLast = page === SLIDES.length - 1;
  useEffect(() => {
    if (reduceMotion) {
      enter.setValue(1);
      return undefined;
    }
    const anim = Animated.timing(enter, {
      toValue: 1,
      duration: 900,
      delay: 250,
      easing: Easing.out(Easing.back(1.4)),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, enter]);
  function onScrollEnd(e) {
    setPage(Math.round(e.nativeEvent.contentOffset.x / W));
  }
  function goNext() {
    const next = Math.min(page + 1, SLIDES.length - 1);
    scrollRef.current?.scrollTo({ x: next * W, animated: true });
    setPage(next);
  }
  function goToSignup() {
    dispatch({ type: A.SET_PARTNER_INTENT, value: false });
    dispatch({ type: A.SET_AUTH_SCREEN, screen: 'signup' });
  }
  function goToPartnerSignup() {
    dispatch({ type: A.SET_PARTNER_INTENT, value: true });
    dispatch({ type: A.SET_AUTH_SCREEN, screen: 'signup' });
  }
  return (
    <LinearGradient colors={colors.authGradient} start={{ x: 0, y: 0 }} end={{ x: 0.35, y: 1 }} style={s.screen}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => (
          <Slide key={i} slide={slide} index={i} scrollX={scrollX} enter={enter} reduceMotion={reduceMotion} s={s}>
            <View style={[s.dots, { bottom: 16 }]}>
              {SLIDES.map((_, d) => (
                <View key={d} style={[s.dot, { width: d === i ? 16 : 5, backgroundColor: d === i ? '#fff' : 'rgba(255,255,255,0.55)' }]} />
              ))}
            </View>
          </Slide>
        ))}
      </Animated.ScrollView>

      <View style={s.footer}>
        {isLast ? (
          <GetStarted onPress={goToSignup} colors={colors} s={s} reduceMotion={reduceMotion} />
        ) : (
          <View style={s.footerRow}>
            <Text style={s.counter}>
              {page + 1}/{SLIDES.length}
            </Text>
            <NextButton page={page} onPress={goNext} colors={colors} s={s} reduceMotion={reduceMotion} />
          </View>
        )}
      </View>

      {!isLast && (
        <Pressable onPress={goToSignup} style={[s.skip, { top: insets.top + 16 }]}>
          <Text style={s.skipTx}>Skip</Text>
        </Pressable>
      )}

      <Pressable onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'login' })} style={s.loginLink}>
        <Text style={s.loginLinkTx}>
          Already have an account? <Text style={{ color: colors.authAccent, fontWeight: '700' }}>Login</Text>
        </Text>
      </Pressable>
      <Pressable onPress={goToPartnerSignup} style={[s.partnerLink, { marginBottom: insets.bottom + 14 }]}>
        <Text style={s.partnerLinkTx}>I have a partner invite</Text>
      </Pressable>
    </LinearGradient>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1 },
    photoWrap: { height: '75%', position: 'relative', overflow: 'hidden' },
    photo: { width: '100%', height: '100%' },
    dots: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', gap: 6, justifyContent: 'center' },
    dot: { height: 5, borderRadius: 99 },
    skip: {
      position: 'absolute',
      right: 16,
      paddingHorizontal: 11,
      paddingVertical: 5,
      borderRadius: 99,
      backgroundColor: 'rgba(0,0,0,0.28)',
    },
    skipTx: { fontSize: 11, fontWeight: '600', color: '#fff' },
    content: { flex: 1, paddingHorizontal: 26, paddingTop: 10, paddingBottom: 20 },
    title: { fontSize: 26, fontWeight: '600', letterSpacing: -0.2, lineHeight: 32, color: c.authHeading },
    body: { fontSize: 12, color: c.authBody, marginTop: 6, lineHeight: 18 },
    footer: { paddingHorizontal: 26, paddingBottom: 12 },
    footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    counter: { fontSize: 12, fontWeight: '700', color: c.authHeading },
    nextWrap: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
    nextPulse: { position: 'absolute', width: 64, height: 64, borderRadius: 32, borderWidth: 2 },
    arrowBtn: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
    ctaFull: { width: '100%' },
    ctaGlow: { position: 'absolute', left: 10, right: 10, top: 10, bottom: -6, borderRadius: 14 },
    ctaFullFill: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    ctaFullTx: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, color: '#fff' },
    loginLink: { alignItems: 'center', paddingTop: 4 },
    loginLinkTx: { fontSize: 12, color: c.authBody },
    partnerLink: {
      alignSelf: 'center',
      marginTop: 10,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 99,
      backgroundColor: 'rgba(255,255,255,0.55)',
    },
    partnerLinkTx: { fontSize: 12, fontWeight: '700', color: c.authAccent },
  });
}
