import { Pressable, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text } from '../../shared/styles/index.js';
import { HomeIcon, CalendarIcon, InsightsIcon, RewardsIcon } from '../ui/icons.jsx';

const TABS = [
  { key: 'home', label: 'Home', Icon: HomeIcon },
  { key: 'cal', label: 'Calendar', Icon: CalendarIcon },
  { key: 'insights', label: 'Insights', Icon: InsightsIcon },
  { key: 'rewards', label: 'Rewards', Icon: RewardsIcon },
];

export default function BottomNav({ screen, dispatch }) {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  return (
    <BlurView intensity={70} tint={isDark ? 'dark' : 'light'} style={[s.nav, { paddingBottom: insets.bottom || 10 }]}>
      {TABS.map(tab => {
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
    tabLabel: { fontSize: 8, fontWeight: '700' },
  });
}
