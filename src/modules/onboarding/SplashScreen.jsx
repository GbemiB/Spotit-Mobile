import { View, Animated, StyleSheet } from 'react-native';
import { useRef, useEffect, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text } from '../../shared/styles/index.js';
import LogoMark from '../../components/ui/LogoMark.jsx';

const SPLASH_MS = 2000;

function Dot({ color, delay }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  return <Animated.View style={[styles.dot, { backgroundColor: color, transform: [{ translateY }] }]} />;
}

export default function SplashScreen() {
  const { dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const t = setTimeout(() => dispatch({ type: A.SET_AUTH_SCREEN, screen: 'welcome' }), SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <LinearGradient colors={colors.splashGradient} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={s.screen}>
      <LogoMark size={96} />
      <Text style={s.wordmark}>
        Spot<Text style={{ color: colors.primary }}> it</Text>
      </Text>
      <Text style={s.tagline}>Track your body, gently</Text>
      <View style={s.dots}>
        <Dot color={colors.primary} delay={0} />
        <Dot color={colors.primaryLight} delay={150} />
        <Dot color={colors.primaryLight} delay={300} />
      </View>
    </LinearGradient>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    wordmark: { marginTop: 20, fontSize: 22, fontWeight: '700', letterSpacing: -0.3, color: c.authHeading },
    tagline: { marginTop: 5, fontSize: 11.5, color: c.textMuted },
    dots: { position: 'absolute', bottom: 60, flexDirection: 'row', gap: 6 },
  });
}

const styles = StyleSheet.create({
  dot: { width: 6, height: 6, borderRadius: 3 },
});
