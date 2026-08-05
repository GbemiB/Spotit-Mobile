import { View, ScrollView, StyleSheet } from 'react-native';
import { useMemo, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { nextPeriodDate, formatDisplayDate, toISO } from '../../shared/utils/cycle.js';
import { useTheme, Text, FONT } from '../../shared/styles/index.js';
import TrendChart from '../../components/charts/TrendChart.jsx';
import * as insightsApi from '../../shared/api/insights.js';

// Used until GET /insights/* resolves (or if it fails) — same shape the backend returns.
function localDigest(logs) {
  const now = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(toISO(d));
  }
  const entries = days.map(d => logs[d]).filter(Boolean);
  const moodCounts = {};
  entries.forEach(e => {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  return { loggedCount: entries.length, topMood };
}

// `ok` drives the card's visual treatment: true = success (green check), false = warning
// (amber !), null = neutral (nothing to judge yet — not the same as "looks fine").
function regularityCopy(regularity) {
  if (!regularity || regularity.status === 'insufficient_data') {
    return { title: 'Not enough data yet', sub: 'Log at least one period to see your regularity check here.', ok: null };
  }
  if (regularity.status === 'regular') {
    return { title: 'Your cycles look regular', sub: 'No anomalies detected · not medical advice', ok: true };
  }
  const title = regularity.status === 'unusual_period_length' ? 'Unusual period length detected' : 'Your cycle length has varied';
  const sub = (regularity.flags?.join(' ') || '') + (regularity.disclaimer ? ` ${regularity.disclaimer}` : '');
  return { title, sub, ok: false };
}

export default function InsightsScreen() {
  const { state, dispatch } = useApp();
  const { colors, isDark } = useTheme();
  const digestBg = isDark ? '#2A1810' : '#FBF2EC';
  const digestBody = isDark ? 'rgba(255,255,255,0.65)' : '#8A6E5E';
  const regularBorder = isDark ? 'rgba(255,255,255,0.10)' : '#EAF1EC';
  const s = useMemo(() => createStyles(colors), [colors]);
  const { logs, cycleLength, lastPeriodDate, accessToken, insights } = state;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    insightsApi
      .getTrends(6, accessToken)
      .then(trends => dispatch({ type: A.INSIGHTS_HYDRATED, insights: { trends } }))
      .catch(() => {});
    insightsApi
      .getWeeklyDigest(accessToken)
      .then(digest => dispatch({ type: A.INSIGHTS_HYDRATED, insights: { digest } }))
      .catch(() => {});
    insightsApi
      .getRegularity(accessToken)
      .then(regularity => dispatch({ type: A.INSIGHTS_HYDRATED, insights: { regularity } }))
      .catch(() => {});
  }, []);

  const totalLogs = Object.keys(logs).length;
  const trends = insights.trends;
  // A single cycle-length value (real or the backend's own default-cycle-length fallback) can't
  // show a trend or variation — need at least two logged cycles before that means anything.
  const trendData = trends?.cycleLengths ?? [];
  const hasTrendData = trendData.length >= 2;

  const nextP = nextPeriodDate(lastPeriodDate, cycleLength);
  const confidenceLabel = totalLogs >= 3 ? 'High' : 'Estimated';
  const digest = insights.digest ?? localDigest(logs);
  const regularity = regularityCopy(insights.regularity);

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
            start={{ x: 0, y: 0 }}
            end={{ x: 0.6, y: 1 }}
            style={s.hero}
          >
            {nextP ? (
              <>
                <Text style={s.heroLabel}>Next period predicted</Text>
                <Text style={s.heroDate}>{formatDisplayDate(nextP)}</Text>
                <View style={s.confPill}>
                  <View style={s.confDot} />
                  <Text style={s.confTx}>{confidenceLabel} confidence</Text>
                </View>
              </>
            ) : (
              <Text style={s.heroLabel}>Log your last period to see a prediction here</Text>
            )}
          </LinearGradient>
        </View>

        {/* Cycle length trend */}
        <View style={{ paddingHorizontal: 24, marginBottom: 14 }}>
          <View style={s.trendCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={s.trendTitle}>Cycle length</Text>
              {hasTrendData && <Text style={s.trendSub}>Last {trendData.length} cycles</Text>}
            </View>
            {hasTrendData ? (
              <>
                <TrendChart data={trendData} />
                <View style={s.statsRow}>
                  <View>
                    <Text style={s.statNum}>
                      {trends.avgCycleLength}
                      <Text style={s.statUnit}>d</Text>
                    </Text>
                    <Text style={s.statLbl}>Avg cycle</Text>
                  </View>
                  <View>
                    <Text style={s.statNum}>
                      {trends.avgPeriodLength}
                      <Text style={s.statUnit}>d</Text>
                    </Text>
                    <Text style={s.statLbl}>Avg period</Text>
                  </View>
                  <View>
                    <Text style={s.statNum}>
                      ±{trends.variationDays}
                      <Text style={s.statUnit}>d</Text>
                    </Text>
                    <Text style={s.statLbl}>Variation</Text>
                  </View>
                </View>
              </>
            ) : (
              <Text style={s.trendEmptyTx}>Log at least two periods to see your cycle length trend here.</Text>
            )}
          </View>
        </View>

        {/* Weekly digest */}
        <View style={{ paddingHorizontal: 24, marginBottom: 14 }}>
          <View style={[s.digestCard, { backgroundColor: digestBg }]}>
            <Text style={s.digestTitle}>This week&apos;s digest</Text>
            <Text style={[s.digestBody, { color: digestBody }]}>
              {digest.topMood ? (
                <>
                  Your average mood was <Text style={{ fontWeight: '700' }}>{digest.topMood}</Text>. You logged {digest.loggedCount} of 7
                  days.
                </>
              ) : (
                'Log your mood and symptoms daily to see a personalized digest here.'
              )}
            </Text>
          </View>
        </View>

        {/* Regularity check */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View
            style={[
              s.regularRow,
              { borderColor: regularity.ok === true ? regularBorder : regularity.ok === false ? colors.warningSoft : colors.border },
            ]}
          >
            <View
              style={[
                s.regularIcon,
                {
                  backgroundColor:
                    regularity.ok === true ? colors.successSoft : regularity.ok === false ? colors.warningSoft : colors.surfaceAlt,
                },
              ]}
            >
              <Text
                style={{
                  color: regularity.ok === true ? colors.success : regularity.ok === false ? colors.warning : colors.textMuted,
                  fontSize: 15,
                }}
              >
                {regularity.ok === true ? '✓' : regularity.ok === false ? '!' : '·'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.regularTitle}>{regularity.title}</Text>
              <Text style={s.regularSub}>{regularity.sub}</Text>
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
    headerTitle: { fontSize: 24, fontWeight: '700', color: c.textPrimary, letterSpacing: -0.4 },

    hero: { borderRadius: 28, padding: 22, borderWidth: 1, borderColor: c.border },
    heroLabel: { fontSize: 10.5, color: c.textMuted, fontWeight: '600' },
    heroDate: { fontFamily: FONT.serif, fontSize: 36, color: c.primaryDark, marginTop: 4, letterSpacing: -0.5 },
    confPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      marginTop: 10,
      backgroundColor: c.successSoft,
      borderRadius: 99,
      paddingHorizontal: 11,
      paddingVertical: 5,
    },
    confDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.success },
    confTx: { fontSize: 10, fontWeight: '600', color: c.success },

    trendCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 24, padding: 20 },
    trendTitle: { fontSize: 13, fontWeight: '700', color: c.textPrimary },
    trendSub: { fontSize: 10.5, color: c.textMuted },
    trendEmptyTx: { fontSize: 11.5, color: c.textMuted, lineHeight: 17, marginTop: 14 },
    statsRow: { flexDirection: 'row', gap: 24, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border },
    statNum: { fontFamily: FONT.serif, fontSize: 24, color: c.textPrimary },
    statUnit: { fontSize: 12, color: c.textMuted },
    statLbl: { fontSize: 9.5, color: c.textMuted, marginTop: 1 },

    digestCard: { backgroundColor: c.tertiarySoft, borderRadius: 22, padding: 18 },
    digestTitle: { fontSize: 12, fontWeight: '700', color: c.tertiaryDeep, marginBottom: 6 },
    digestBody: { fontSize: 11.5, color: c.textSecondary, lineHeight: 18 },

    regularRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderRadius: 22,
      padding: 16,
    },
    regularIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
    regularTitle: { fontSize: 12, fontWeight: '700', color: c.textPrimary },
    regularSub: { fontSize: 10.5, color: c.textMuted, marginTop: 1 },
  });
}
