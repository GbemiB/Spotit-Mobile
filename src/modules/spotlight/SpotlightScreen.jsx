import { View, ScrollView, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Text, FONT } from '../../shared/styles/index.js';
import { SparkleIcon } from '../../components/ui/icons.jsx';
export default function SpotlightScreen() {
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Spotlight</Text>
          <Text style={s.headerSub}>Play, learn and shine</Text>
        </View>
        <View style={{ paddingHorizontal: 24 }}>
          <LinearGradient
            colors={isDark ? ['#241319', '#2A1610'] : ['#FFF0F2', '#FBF1E0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.6, y: 1 }}
            style={s.hero}
          >
            <View style={s.iconCircle}>
              <SparkleIcon size={26} color={colors.primary} />
            </View>
            <Text style={s.heroTitle}>Games are on the way</Text>
            <Text style={s.heroBody}>Quizzes, challenges and games to play with your SpotPoints are coming to Spotlight soon.</Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: 'transparent' },
    header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18 },
    headerTitle: { fontSize: 24, fontWeight: '700', color: c.textPrimary, letterSpacing: -0.4 },
    headerSub: { fontSize: 11, color: c.textMuted, marginTop: 4 },
    hero: { borderRadius: 28, padding: 24, borderWidth: 1, borderColor: c.border, alignItems: 'center', gap: 10 },
    iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
    heroTitle: { fontFamily: FONT.serif, fontSize: 24, lineHeight: 30, color: c.textPrimary, textAlign: 'center' },
    heroBody: { fontSize: 11, lineHeight: 18, color: c.textSecondary, textAlign: 'center' },
  });
}
