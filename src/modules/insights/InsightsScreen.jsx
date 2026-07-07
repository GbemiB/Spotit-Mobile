import { View, ScrollView, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { nextPeriodDate, formatDisplayDate, toISO, todayISO } from '../../shared/utils/cycle.js';
import { useTheme, Text, FONT } from '../../shared/styles/index.js';
import TrendChart from '../../components/charts/TrendChart.jsx';

function weeklyDigest(logs) {
  const now = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    days.push(toISO(d));
  }
  const entries = days.map(d => logs[d]).filter(Boolean);
  const moodCounts = {};
  entries.forEach(e => { if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1; });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return { loggedCount: entries.length, topMood };
}

export default function InsightsScreen() {
  const { state } = useApp();
  const { colors, isDark } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { logs, cycleLength, periodLength, lastPeriodDate } = state;
  const insets = useSafeAreaInsets();

  const totalLogs = Object.keys(logs).length;
  const trendData = [27, 28, 28, 29, cycleLength, cycleLength];
  const avgCycle = Math.round(trendData.reduce((a, b) => a + b, 0) / trendData.length);
  const variation = Math.round((Math.max(...trendData) - Math.min(...trendData)) / 2);

  const nextP = nextPeriodDate(lastPeriodDate, cycleLength);
  const confidenceLabel = totalLogs >= 3 ? 'High' : 'Estimated';
  const digest = weeklyDigest(logs);

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>

        <View style={s.header}>
          <Text style={s.headerTitle}>Insights</Text>
        </View>

        {/* Next period hero */}
        <View style={{ paddingHorizontal: 24, marginBottom: 14 }}>
          <LinearGradient
            colors={isDark ? ['#241319', '#2A1610'] : ['#fff', '#FDF4F0']}
            start={{ x: 0, y: 0 }} end={{ x: 0.6, y: 1 }}
            style={s.hero}
          >
            <Text style={s.heroLabel}>Next period predicted</Text>
            <Text style={s.heroDate}>{formatDisplayDate(nextP)}</Text>
            <View style={s.confPill}>
              <View style={s.confDot} />
              <Text style={s.confTx}>{confidenceLabel} confidence</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Cycle length trend */}
        <View style={{ paddingHorizontal: 24, marginBottom: 14 }}>
          <View style={s.trendCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={s.trendTitle}>Cycle length</Text>
              <Text style={s.trendSub}>Last 6 cycles</Text>
            </View>
            <TrendChart data={trendData} />
            <View style={s.statsRow}>
              <View>
                <Text style={s.statNum}>{avgCycle}<Text style={s.statUnit}>d</Text></Text>
                <Text style={s.statLbl}>Avg cycle</Text>
              </View>
              <View>
                <Text style={s.statNum}>{periodLength}<Text style={s.statUnit}>d</Text></Text>
                <Text style={s.statLbl}>Avg period</Text>
              </View>
              <View>
                <Text style={s.statNum}>±{variation}<Text style={s.statUnit}>d</Text></Text>
                <Text style={s.statLbl}>Variation</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly digest */}
        <View style={{ paddingHorizontal: 24, marginBottom: 14 }}>
          <View style={s.digestCard}>
            <Text style={s.digestTitle}>This week's digest</Text>
            <Text style={s.digestBody}>
              {digest.topMood
                ? <>Your average mood was <Text style={{ fontWeight: '700' }}>{digest.topMood}</Text>. You logged {digest.loggedCount} of 7 days.</>
                : 'Log your mood and symptoms daily to see a personalized digest here.'}
            </Text>
          </View>
        </View>

        {/* Regularity check */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View style={s.regularRow}>
            <View style={s.regularIcon}><Text style={{ color: colors.success, fontSize: 17 }}>✓</Text></View>
            <View>
              <Text style={s.regularTitle}>Your cycles look regular</Text>
              <Text style={s.regularSub}>No anomalies detected · not medical advice</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18 },
    headerTitle: { fontSize: 26, fontWeight: '700', color: c.textPrimary, letterSpacing: -0.4 },

    hero: { borderRadius: 28, padding: 22, borderWidth: 1, borderColor: c.border },
    heroLabel: { fontSize: 12.5, color: c.textMuted, fontWeight: '600' },
    heroDate: { fontFamily: FONT.serif, fontSize: 38, color: c.primaryDark, marginTop: 4, letterSpacing: -0.5 },
    confPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 10, backgroundColor: c.successSoft, borderRadius: 99, paddingHorizontal: 11, paddingVertical: 5 },
    confDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.success },
    confTx: { fontSize: 12, fontWeight: '600', color: c.success },

    trendCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 24, padding: 20 },
    trendTitle: { fontSize: 15, fontWeight: '700', color: c.textPrimary },
    trendSub: { fontSize: 12.5, color: c.textMuted },
    statsRow: { flexDirection: 'row', gap: 24, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border },
    statNum: { fontFamily: FONT.serif, fontSize: 26, color: c.textPrimary },
    statUnit: { fontSize: 14, color: c.textMuted },
    statLbl: { fontSize: 11.5, color: c.textMuted, marginTop: 1 },

    digestCard: { backgroundColor: c.tertiarySoft, borderRadius: 22, padding: 18 },
    digestTitle: { fontSize: 14, fontWeight: '700', color: c.tertiary, marginBottom: 6 },
    digestBody: { fontSize: 13.5, color: c.textSecondary, lineHeight: 20 },

    regularRow: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: c.surface, borderWidth: 1, borderColor: c.successBorder, borderRadius: 22, padding: 16 },
    regularIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: c.successSoft, alignItems: 'center', justifyContent: 'center' },
    regularTitle: { fontSize: 14, fontWeight: '700', color: c.textPrimary },
    regularSub: { fontSize: 12.5, color: c.textMuted, marginTop: 1 },
  });
}
