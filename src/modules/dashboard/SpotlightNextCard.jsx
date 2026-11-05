import { View, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { useMemo, useEffect, useState } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme, Text } from '../../shared/styles/index.js';
import { useAnimatedValue } from './HeroCardFx.jsx';
import { RiseIn } from './HomeFx.jsx';
import * as spotlightApi from '../../shared/api/spotlight.js';
import * as quizApi from '../../shared/api/quiz.js';
import { nextMove } from './spotlightNext.js';

export default function SpotlightNextCard({ token, refreshKey, style, reduceMotion, onPress }) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [move, setMove] = useState(null);
  const bob = useAnimatedValue(0);
  const press = useAnimatedValue(1);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    Promise.all([spotlightApi.getHome(token), quizApi.getHome(token).catch(() => null)])
      .then(([home, quiz]) => {
        if (!cancelled) setMove(nextMove(home, quiz));
      })
      .catch(() => {
        if (!cancelled) setMove(null);
      });
    return () => {
      cancelled = true;
    };
  }, [token, refreshKey]);

  useEffect(() => {
    if (reduceMotion || !move) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, move, bob]);

  if (!move) return null;
  const pressTo = toValue => Animated.spring(press, { toValue, speed: 40, bounciness: 8, useNativeDriver: true }).start();

  return (
    <RiseIn index={2} style={style} reduceMotion={reduceMotion}>
      <Pressable
        onPress={onPress}
        onPressIn={() => pressTo(0.97)}
        onPressOut={() => pressTo(1)}
        accessibilityRole="button"
        accessibilityLabel={`Open Spotlight. ${move.title}`}
      >
        <Animated.View style={[s.card, { transform: [{ scale: press }] }]}>
          <View style={s.tile}>
            <Animated.View style={{ transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }] }}>
              <Svg width={26} height={26} viewBox="0 0 24 24">
                <Path d="M12 3l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2z" fill={colors.primary} />
                <Circle cx="19" cy="5" r="1.6" fill={colors.tertiary} />
              </Svg>
            </Animated.View>
          </View>
          <View style={s.body}>
            <Text style={s.kick}>SPOTLIGHT · YOUR NEXT MOVE</Text>
            <Text style={s.title}>{move.title}</Text>
            {!!move.sub && <Text style={s.sub}>{move.sub}</Text>}
            {!!move.chip && (
              <View style={s.chip}>
                <Text style={s.chipText}>{move.chip}</Text>
              </View>
            )}
          </View>
          <View style={s.go}>
            <Svg width={13} height={13} viewBox="0 0 24 24">
              <Path d="M8 5v14l11-7z" fill={isDark ? colors.primaryLight : colors.primaryDark} />
            </Svg>
          </View>
        </Animated.View>
      </Pressable>
    </RiseIn>
  );
}

function createStyles(c, isDark) {
  const soft = isDark ? 'rgba(226,100,124,0.16)' : c.primarySoft;
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 20,
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0 : 0.06,
      shadowRadius: 18,
    },
    tile: { width: 48, height: 48, borderRadius: 16, backgroundColor: soft, alignItems: 'center', justifyContent: 'center' },
    body: { flex: 1, minWidth: 0 },
    kick: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: isDark ? c.primaryLight : c.primaryDark },
    title: { fontSize: 14, fontWeight: '700', color: c.textPrimary, marginTop: 2 },
    sub: { fontSize: 11.5, lineHeight: 16, color: c.textSecondary, marginTop: 3 },
    chip: {
      alignSelf: 'flex-start',
      marginTop: 7,
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 999,
      backgroundColor: isDark ? 'rgba(78,158,120,0.18)' : '#E6F3EC',
    },
    chipText: { fontSize: 10, fontWeight: '800', color: isDark ? '#6BBF9B' : '#2F7454' },
    go: { width: 34, height: 34, borderRadius: 17, backgroundColor: soft, alignItems: 'center', justifyContent: 'center' },
  });
}
