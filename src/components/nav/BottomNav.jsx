import { View, Pressable, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text } from '../../shared/styles/index.js';

const TABS = [
  { key: 'home',     label: 'Home',     icon: '🏠' },
  { key: 'cal',      label: 'Calendar', icon: '📅' },
  { key: 'log',      label: null,       icon: null  },
  { key: 'insights', label: 'Insights', icon: '📊' },
  { key: 'rewards',  label: 'Rewards',  icon: '🏆' },
];

export default function BottomNav({ screen, dispatch }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.nav, { paddingBottom: insets.bottom || 10 }]}>
      {TABS.map((tab) => {
        if (tab.key === 'log') {
          return (
            <Pressable key="log" onPress={() => dispatch({ type: A.OPEN_LOG })} style={s.fabWrap}>
              <LinearGradient
                colors={colors.gradient.fabAccent}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={s.fab}
              >
                <Text style={s.fabPlus}>+</Text>
              </LinearGradient>
            </Pressable>
          );
        }
        const active = screen === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => dispatch({ type: A.GO, screen: tab.key })}
            style={s.tab}
          >
            <Text style={[s.tabIcon, { opacity: active ? 1 : 0.45 }]}>{tab.icon}</Text>
            <Text style={[s.tabLabel, { color: active ? colors.primaryDark : colors.textDisabled }]}>{tab.label}</Text>
            {active && <View style={s.activeDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    nav: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-around',
      backgroundColor: c.background,
      paddingTop: 10,
      borderTopWidth: 1.5,
      borderTopColor: c.border,
    },
    tab:       { alignItems: 'center', gap: 3, width: 56, paddingBottom: 2 },
    tabIcon:   { fontSize: 20 },
    tabLabel:  { fontSize: 10, fontWeight: '700' },
    activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: c.primary, marginTop: 2 },
    fabWrap:   { marginTop: -20, width: 56, alignItems: 'center' },
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
