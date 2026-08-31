import { View, Image, ScrollView, Pressable, Dimensions, StyleSheet } from 'react-native';
import { useRef, useState, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text } from '../../shared/styles/index.js';
import { ChevronRightIcon } from '../../components/ui/icons.jsx';
const { width: W } = Dimensions.get('window');
const SLIDES = [
  {
    image: require('../../../assets/illus-rhythm.png'),
    title: "Know your body's rhythm",
    body: 'A few taps a day builds a picture only you have — no guesswork, just patterns.',
  },
  {
    image: require('../../../assets/illus-fertility.png'),
    title: 'Know your fertile window',
    body: 'We track ovulation and your fertile days so you always know where you stand.',
  },
  {
    image: require('../../../assets/illus-reminder.png'),
    title: 'Never miss a reminder',
    body: 'Gentle nudges for logging, periods, and ovulation — right when you need them.',
  },
];
export default function WelcomeScreen() {
  const { dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [page, setPage] = useState(0);
  const isLast = page === SLIDES.length - 1;
  function onScroll(e) {
    setPage(Math.round(e.nativeEvent.contentOffset.x / W));
  }
  function goNext() {
    const next = Math.min(page + 1, SLIDES.length - 1);
    scrollRef.current?.scrollTo({ x: next * W, animated: true });
    setPage(next);
  }
  function goToSignup() {
    dispatch({ type: A.SET_AUTH_SCREEN, screen: 'signup' });
  }
  return (
    <LinearGradient colors={colors.authGradient} start={{ x: 0, y: 0 }} end={{ x: 0.35, y: 1 }} style={s.screen}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={{ width: W, flex: 1 }}>
            <View style={s.photoWrap}>
              <Image source={slide.image} style={s.photo} resizeMode="cover" />
              <View style={[s.dots, { bottom: 16 }]}>
                {SLIDES.map((_, d) => (
                  <View
                    key={d}
                    style={[s.dot, { width: d === i ? 16 : 5, backgroundColor: d === i ? '#fff' : 'rgba(255,255,255,0.55)' }]}
                  />
                ))}
              </View>
            </View>
            <View style={s.content}>
              <Text style={s.title}>{slide.title}</Text>
              <Text style={s.body}>{slide.body}</Text>
              <View style={s.footer}>
                {i === SLIDES.length - 1 ? (
                  <Pressable onPress={goToSignup} style={s.ctaFull}>
                    <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.ctaFullFill}>
                      <Text style={s.ctaFullTx}>Get Started</Text>
                    </LinearGradient>
                  </Pressable>
                ) : (
                  <View style={s.footerRow}>
                    <Text style={s.counter}>
                      {i + 1}/{SLIDES.length}
                    </Text>
                    <Pressable onPress={goNext}>
                      <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.arrowBtn}>
                        <ChevronRightIcon size={15} color="#fff" />
                      </LinearGradient>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {!isLast && (
        <Pressable onPress={goToSignup} style={[s.skip, { top: insets.top + 16 }]}>
          <Text style={s.skipTx}>Skip</Text>
        </Pressable>
      )}

      <Pressable
        onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'login' })}
        style={[s.loginLink, { paddingBottom: insets.bottom + 14 }]}
      >
        <Text style={s.loginLinkTx}>
          Already have an account? <Text style={{ color: colors.authAccent, fontWeight: '700' }}>Login</Text>
        </Text>
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
    title: { fontSize: 26, fontWeight: '600', letterSpacing: -0.2, lineHeight: 27, color: c.authHeading },
    body: { fontSize: 12, color: c.authBody, marginTop: 6, lineHeight: 18 },
    footer: { marginTop: 'auto' },
    footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    counter: { fontSize: 12, fontWeight: '700', color: c.authHeading },
    arrowBtn: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
    ctaFull: { width: '100%' },
    ctaFullFill: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    ctaFullTx: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, color: '#fff' },
    loginLink: { alignItems: 'center', paddingTop: 4 },
    loginLinkTx: { fontSize: 12, color: c.authBody },
  });
}
