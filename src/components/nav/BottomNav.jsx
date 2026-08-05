import { View, Pressable, Animated, StyleSheet } from 'react-native';
import { useRef, useEffect, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text } from '../../shared/styles/index.js';
import { HomeIcon, CalendarIcon, InsightsIcon, RewardsIcon } from '../ui/icons.jsx';

const TABS = [
  { key: 'home', label: 'Home', Icon: HomeIcon },
  { key: 'cal', label: 'Calendar', Icon: CalendarIcon },
  { key: 'log', label: null, Icon: null },
  { key: 'insights', label: 'Insights', Icon: InsightsIcon },
  { key: 'rewards', label: 'Rewards', Icon: RewardsIcon },
];

export default function BottomNav({ screen, dispatch }) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const fabScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });

  return (
    <BlurView intensity={70} tint={isDark ? 'dark' : 'light'} style={[s.nav, { paddingBottom: insets.bottom || 10 }]}>
      {TABS.map(tab => {
        if (tab.key === 'log') {
          return (
            <Pressable key="log" onPress={() => dispatch({ type: A.OPEN_LOG })} style={s.fabWrap}>
              <Animated.View style={{ transform: [{ scale: fabScale }] }}>
                <LinearGradient colors={colors.gradient.fabAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.fab}>
                  <Text style={s.fabPlus}>+</Text>
                </LinearGradient>
              </Animated.View>
            </Pressable>
          );
        }
        const active = screen === tab.key;
        const iconColor = active ? colors.primaryDark : colors.textDisabled;
        const Icon = tab.Icon;
        return (
          <Pressable key={tab.key} onPress={() => dispatch({ type: A.GO, screen: tab.key })} style={s.tab}>
            <Icon size={22} color={iconColor} />
            <Text style={[s.tabLabel, { color: iconColor }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </BlurView>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    nav: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-around',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    tab: { alignItems: 'center', gap: 4, width: 56, paddingBottom: 2 },
    tabLabel: { fontSize: 10, fontWeight: '700' },
    fabWrap: { marginTop: -22, width: 56, alignItems: 'center' },
    fab: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 14,
      elevation: 8,
    },
    fabPlus: { fontSize: 28, color: c.white, fontWeight: '300', lineHeight: 34 },
  });
}
