import { View, Text, Image, ScrollView, Pressable, Animated, Dimensions, StyleSheet } from 'react-native';
import { useRef, useState, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme } from '../../shared/styles/index.js';
import Button from '../../components/ui/Button.jsx';

const { width: W } = Dimensions.get('window');

function getSlides(c) {
  return [
    {
      image: require('../../../assets/splash.png'),
      title: 'Know your body',
      body: 'Track your cycle, understand your patterns, and feel more in tune with yourself.',
      accent: c.primary,
    },
    {
      image: require('../../../assets/splash.png'),
      title: 'Small habits,\nreal support',
      body: 'Gentle nutrition and mood tips arrive exactly when your cycle calls for them.',
      accent: c.primary,
    },
    {
      image: require('../../../assets/splash.png'),
      title: 'Everything\nstays private',
      body: 'Your logs are yours alone. Its protected ',
      accent: c.primary,
    },
  ];
}

export default function WelcomeScreen() {
  const { dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const SLIDES = useMemo(() => getSlides(colors), [colors]);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [page, setPage] = useState(0);

  function onScroll(e) {
    const idx = Math.round(e.nativeEvent.contentOffset.x / W);
    setPage(idx);
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={{ flexGrow: 0 }}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[s.slide, { width: W }]}>
            <View style={s.slideCard}>
              {slide.image
                ? <Image source={slide.image} style={s.slideImg} resizeMode="contain" />
                : <Text style={s.slideEmoji}>{slide.emoji}</Text>
              }
              <Text style={[s.slideTitle, { color: slide.accent }]}>{slide.title}</Text>
              <Text style={s.slideBody}>{slide.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, { backgroundColor: i === page ? colors.primary : colors.border, width: i === page ? 20 : 8 }]} />
        ))}
      </View>

      {/* CTA */}
      <View style={s.cta}>
        <Button onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'signup' })}>
          Get started
        </Button>
        <Pressable
          onPress={() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'login' })}
          style={s.loginBtn}
        >
          <Text style={s.loginTx}>Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Log in</Text></Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24, paddingVertical: 20 },
    logoImg: { width: 40, height: 40 },
    logoText: { fontSize: 18, fontWeight: '800', color: c.textPrimary, letterSpacing: -0.5 },
    slide: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
    slideCard: { backgroundColor: c.background, borderRadius: 28, padding: 36, alignItems: 'center', minHeight: 300, justifyContent: 'center' },
    slideEmoji: { fontSize: 50, marginBottom: 20 },
    slideImg: { width: 84, height: 106, marginBottom: 20 },
    slideTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', lineHeight: 34, marginBottom: 16 },
    slideBody: { fontSize: 12, color: c.textSecondary, textAlign: 'center', lineHeight: 20 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20, marginBottom: 8 },
    dot: { height: 8, borderRadius: 99 },
    cta: { paddingHorizontal: 24, marginTop: 20, gap: 14 },
    loginBtn: { alignItems: 'center', paddingVertical: 4 },
    loginTx: { fontSize: 12, color: c.textMuted },
  });
}
