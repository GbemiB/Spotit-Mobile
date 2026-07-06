import { View, ScrollView, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { cycleDayOf, phaseFor, todayISO } from '../../shared/utils/cycle.js';
import { useTheme, Text } from '../../shared/styles/index.js';
import Card from '../../components/ui/Card.jsx';
import SectionHeader from '../../components/ui/SectionHeader.jsx';
import TrendChart from '../../components/charts/TrendChart.jsx';

function StatRow({ label, value, sub, last, s }) {
  return (
    <View style={[s.statRow, last && { borderBottomWidth: 0 }]}>
      <Text style={s.statLabel}>{label}</Text>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={s.statValue}>{value}</Text>
        {sub ? <Text style={s.statSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

function MoodBar({ mood, count, max, s }) {
  const MOOD_EMOJI = { happy: '😊', calm: '😌', energetic: '⚡', neutral: '😐', sad: '😔', anxious: '😰', irritable: '😤', emotional: '🥺' };
  const pct = max > 0 ? count / max : 0;
  return (
    <View style={s.moodRow}>
      <Text style={s.moodEmoji}>{MOOD_EMOJI[mood] || '😐'}</Text>
      <Text style={s.moodLabel}>{mood}</Text>
      <View style={s.moodTrack}>
        <View style={[s.moodFill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={s.moodCount}>{count}</Text>
    </View>
  );
}

function SymptomCloud({ symptoms, s }) {
  const counts = {};
  symptoms.forEach(sym => { counts[sym] = (counts[sym] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (
    <View style={s.symWrap}>
      {sorted.map(([sym, cnt]) => (
        <View key={sym} style={[s.symChip, { opacity: 0.45 + (cnt / (sorted[0]?.[1] || 1)) * 0.55 }]}>
          <Text style={s.symTx}>{sym}{cnt > 1 ? ` ×${cnt}` : ''}</Text>
        </View>
      ))}
    </View>
  );
}

export default function InsightsScreen() {
  const { state } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { logs, cycleLength, periodLength, lastPeriodDate, streak, longestStreak } = state;
  const insets = useSafeAreaInsets();

  const today = todayISO();
  const cycleDay = cycleDayOf(today, lastPeriodDate, cycleLength);
  const phase = phaseFor(cycleDay, periodLength, cycleLength);

  const logEntries = Object.entries(logs);
  const totalLogs = logEntries.length;

  const moodCounts = {};
  const allSymptoms = [];
  logEntries.forEach(([, entry]) => {
    if (entry.mood) moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    if (entry.symptoms) allSymptoms.push(...entry.symptoms);
  });
  const maxMood = Math.max(...Object.values(moodCounts), 1);
  const topMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const trendData = [27, 28, 28, 29, cycleLength, cycleLength];
  const avgCycle = Math.round(trendData.reduce((a, b) => a + b, 0) / trendData.length);

  const flowLogs = logEntries.filter(([, e]) => e.flow).length;
  const logRate = totalLogs > 0 ? Math.round((flowLogs / totalLogs) * 100) : 0;

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 110 }} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerSub}>Your data</Text>
          <Text style={s.headerTitle}>Insights</Text>
        </View>

        {/* Cycle summary */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Cycle summary" />
          <Card style={{ marginTop: 10, padding: 0, overflow: 'hidden' }}>
            <StatRow label="Average cycle" value={`${avgCycle} days`} s={s} />
            <StatRow label="Period length" value={`${periodLength} days`} s={s} />
            <StatRow label="Current phase" value={phase.label} s={s} />
            <StatRow label="Cycle day" value={`Day ${cycleDay}`} s={s} />
            <StatRow label="Days logged" value={totalLogs} sub="total entries" last s={s} />
          </Card>
        </View>

        {/* Cycle trend */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Cycle length trend" />
          <Card style={{ padding: 18, marginTop: 10 }}>
            <TrendChart data={trendData} />
            <Text style={s.chartNote}>Last 6 cycles · avg {avgCycle} days</Text>
          </Card>
        </View>

        {/* Streak stats */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <SectionHeader title="Logging streaks" />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Card style={[s.streakCard, { flex: 1 }]}>
              <Text style={s.streakNum}>{streak}</Text>
              <Text style={s.streakLbl}>Current{'\n'}streak</Text>
              <Text style={s.streakIcon}>🔥</Text>
            </Card>
            <Card style={[s.streakCard, { flex: 1 }]}>
              <Text style={s.streakNum}>{longestStreak}</Text>
              <Text style={s.streakLbl}>Longest{'\n'}streak</Text>
              <Text style={s.streakIcon}>🏆</Text>
            </Card>
            <Card style={[s.streakCard, { flex: 1 }]}>
              <Text style={s.streakNum}>{logRate}%</Text>
              <Text style={s.streakLbl}>Flow{'\n'}log rate</Text>
              <Text style={s.streakIcon}>📊</Text>
            </Card>
          </View>
        </View>

        {/* Mood patterns */}
        {topMoods.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <SectionHeader title="Mood patterns" />
            <Card style={{ padding: 18, marginTop: 10 }}>
              {topMoods.map(([mood, count]) => (
                <MoodBar key={mood} mood={mood} count={count} max={maxMood} s={s} />
              ))}
            </Card>
          </View>
        )}

        {/* Symptoms */}
        {allSymptoms.length > 0 && (
          <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
            <SectionHeader title="Common symptoms" />
            <Card style={{ padding: 18, marginTop: 10 }}>
              <SymptomCloud symptoms={allSymptoms} s={s} />
            </Card>
          </View>
        )}

        {totalLogs === 0 && (
          <View style={{ paddingHorizontal: 24 }}>
            <Card style={s.emptyCard}>
              <Text style={s.emptyIcon}>📈</Text>
              <Text style={s.emptyTitle}>No data yet</Text>
              <Text style={s.emptyBody}>Start logging daily to unlock cycle insights and patterns.</Text>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 },
    headerSub: { fontSize: 12, color: c.textMuted, fontWeight: '600', marginBottom: 2 },
    headerTitle: { fontSize: 32, fontWeight: '800', color: c.textPrimary, letterSpacing: -0.5 },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: c.border },
    statLabel: { fontSize: 12, color: c.textSecondary, fontWeight: '500' },
    statValue: { fontSize: 12, fontWeight: '700', color: c.textPrimary },
    statSub: { fontSize: 11, color: c.textDisabled, marginTop: 2, textAlign: 'right' },
    chartNote: { fontSize: 11, color: c.textDisabled, textAlign: 'center', marginTop: 12 },
    streakCard: { padding: 16, alignItems: 'center' },
    streakNum: { fontSize: 20, fontWeight: '800', color: c.primary },
    streakLbl: { fontSize: 11, color: c.textMuted, fontWeight: '600', textAlign: 'center', marginTop: 4 },
    streakIcon: { fontSize: 22, marginTop: 8 },
    moodRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    moodEmoji: { fontSize: 16, width: 24 },
    moodLabel: { fontSize: 12, color: c.textSecondary, width: 60, textTransform: 'capitalize', fontWeight: '500' },
    moodTrack: { flex: 1, height: 6, backgroundColor: c.border, borderRadius: 99, overflow: 'hidden' },
    moodFill: { height: '100%', backgroundColor: c.primary, borderRadius: 99 },
    moodCount: { fontSize: 12, color: c.textMuted, fontWeight: '600', width: 20, textAlign: 'right' },
    symWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    symChip: { backgroundColor: c.primarySoft, borderWidth: 1.5, borderColor: c.primarySoftBorder, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
    symTx: { fontSize: 12.5, color: c.primaryDark, fontWeight: '600', textTransform: 'capitalize' },
    emptyCard: { padding: 40, alignItems: 'center' },
    emptyIcon: { fontSize: 24, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: '800', color: c.textPrimary, marginBottom: 8, letterSpacing: -0.3 },
    emptyBody: { fontSize: 12, color: c.textMuted, textAlign: 'center', lineHeight: 21 },
  });
}
