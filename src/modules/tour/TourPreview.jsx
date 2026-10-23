import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme, Text } from '../../shared/styles/index.js';
import { FONT } from '../../shared/styles/typography.js';
import { calendarPalette } from '../../shared/styles/colors.js';
import { CalendarIcon, InsightsIcon, RewardsIcon, BellIcon } from '../../components/ui/icons.jsx';
function DropIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}
function PeopleIcon({ color }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3.5} stroke={color} strokeWidth={1.8} />
      <Circle cx={16.5} cy={9.5} r={2.5} stroke={color} strokeWidth={1.8} />
      <Path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 6 2 6 5.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function Chip({ label, s, tone }) {
  return (
    <View style={[s.chip, tone === 'peach' ? s.chipPeach : s.chipPink]}>
      <Text style={s.chipText}>{label}</Text>
    </View>
  );
}
function Features({ s, c }) {
  const items = [
    ['Cycle', <DropIcon key="i" color={c.primary} />],
    ['Calendar', <CalendarIcon key="i" size={22} color={c.primary} />],
    ['Insights', <InsightsIcon key="i" size={22} color={c.primary} />],
    ['SpotPoints', <RewardsIcon key="i" size={22} color={c.tertiaryDeep} />],
    ['Reminders', <BellIcon key="i" size={22} color={c.primary} />],
    ['Partner', <PeopleIcon key="i" color={c.primary} />],
  ];
  return (
    <View style={s.grid}>
      {items.map(([label, icon]) => (
        <View key={label} style={s.tile}>
          {icon}
          <Text style={s.tileText}>{label}</Text>
        </View>
      ))}
    </View>
  );
}
function Countdown({ s, label, lead, value }) {
  return (
    <View style={s.center}>
      <Text style={s.eyebrow}>{label}</Text>
      <Text style={s.serif}>
        {lead}
        <Text style={s.serifAccent}>{value}</Text>
      </Text>
    </View>
  );
}
function PeriodRange({ s, c, cal }) {
  const days = [4, 5, 6, 7, 8, 9, 10];
  return (
    <View style={{ gap: 10 }}>
      <Text style={s.small}>October</Text>
      <View style={s.week}>
        {days.map(d => {
          const edge = d === 6 || d === 10;
          const inside = d > 6 && d < 10;
          return (
            <View key={d} style={[s.day, edge && { backgroundColor: cal.period }, inside && { backgroundColor: cal.tint.period }]}>
              <Text style={[s.dayText, edge && { color: c.white }]}>{d}</Text>
            </View>
          );
        })}
      </View>
      <View style={s.pill}>
        <Text style={s.small}>6 – 10 October · 5 days</Text>
      </View>
    </View>
  );
}
function Month({ s, cal }) {
  const tones = ['', '', 'period', 'period', 'period', '', '', '', '', 'fertile', 'fertile', 'fertile', 'ovulation', ''];
  return (
    <View style={{ gap: 10 }}>
      <View style={s.monthGrid}>
        {tones.map((t, i) => (
          <View key={i} style={[s.monthDay, t && { backgroundColor: cal.tint[t] }]}>
            <View style={[s.dot, t && { backgroundColor: cal[t] }]} />
          </View>
        ))}
      </View>
      <View style={s.legend}>
        {[
          ['Period', cal.period],
          ['Fertile', cal.fertile],
          ['Ovulation', cal.ovulation],
        ].map(([label, color]) => (
          <View key={label} style={s.legendItem}>
            <View style={[s.dot, { backgroundColor: color }]} />
            <Text style={s.small}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
function Bars({ s, c }) {
  return (
    <View style={s.bars}>
      {[28, 30, 27, 29, 28, 31].map((v, i) => (
        <View key={i} style={[s.bar, { height: (v - 22) * 9, backgroundColor: i === 5 ? c.primary : c.primaryLight }]} />
      ))}
    </View>
  );
}
function Points({ s }) {
  return (
    <View style={s.row3}>
      {[
        ['120', 'SpotPoints'],
        ['3 days', 'Streak'],
        ['Blush', 'Level'],
      ].map(([value, label]) => (
        <View key={label} style={s.stat}>
          <Text style={s.statValue}>{value}</Text>
          <Text style={s.small}>{label}</Text>
        </View>
      ))}
    </View>
  );
}
function Notification({ s, text }) {
  return (
    <View style={s.notice}>
      <Text style={s.noticeApp}>Spot it</Text>
      <Text style={s.noticeText}>{text}</Text>
    </View>
  );
}
function Share({ s, c }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={s.notice}>
        <View style={s.shareRow}>
          <PeopleIcon color={c.primary} />
          <View>
            <Text style={s.noticeText}>Shared with your partner</Text>
            <Text style={s.small}>They can see, not change</Text>
          </View>
        </View>
      </View>
      <View style={s.row2}>
        <View style={s.halfTile}>
          <Text style={s.noticeText}>Export my data</Text>
        </View>
        <View style={s.halfTile}>
          <Text style={s.noticeText}>Delete anytime</Text>
        </View>
      </View>
    </View>
  );
}
function DayLog({ s }) {
  return (
    <View style={s.notice}>
      <Text style={s.noticeApp}>Tuesday 7 October</Text>
      <View style={s.chips}>
        <Chip s={s} label="Flow: Medium" />
        <Chip s={s} label="Calm" tone="peach" />
        <Chip s={s} label="Cramps" />
      </View>
    </View>
  );
}
function CheckIn({ s, name }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={s.noticeText}>How did you support {name || 'her'} today?</Text>
      <View style={s.chips}>
        <Chip s={s} label="Checked in on her" />
        <Chip s={s} label="Brought her snacks" tone="peach" />
        <Chip s={s} label="Listened to her" />
      </View>
    </View>
  );
}
export default function TourPreview({ kind, partnerName }) {
  const { colors: c, isDark } = useTheme();
  const s = useMemo(() => createStyles(c), [c]);
  const cal = calendarPalette[isDark ? 'dark' : 'light'];
  const hers = partnerName ? `${partnerName}'s` : 'Her';
  const body = {
    welcome: <Features s={s} c={c} />,
    cycle: <Countdown s={s} label="Next period" lead="Starts in " value="12 days" />,
    log: <PeriodRange s={s} c={c} cal={cal} />,
    mood: (
      <View style={{ gap: 10 }}>
        <Text style={s.noticeText}>How are you feeling today?</Text>
        <View style={s.chips}>
          <Chip s={s} label="Happy" tone="peach" />
          <Chip s={s} label="Calm" tone="peach" />
          <Chip s={s} label="Cramps" />
          <Chip s={s} label="Headache" />
        </View>
      </View>
    ),
    calendar: <Month s={s} cal={cal} />,
    insights: <Bars s={s} c={c} />,
    points: <Points s={s} />,
    reminders: <Notification s={s} text="Your period is predicted to start in 2 days." />,
    share: <Share s={s} c={c} />,
    partnerWelcome: <Countdown s={s} label={`${hers} cycle`} lead={`${hers} period starts in `} value="12 days" />,
    partnerLogs: <DayLog s={s} />,
    partnerCheckIn: <CheckIn s={s} name={partnerName} />,
    partnerReminder: <Notification s={s} text={`${hers} period is expected to start in 5 days.`} />,
  }[kind];
  return (
    <LinearGradient colors={[c.primarySoft, c.tertiarySoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.box}>
      {body}
    </LinearGradient>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    box: { height: 168, borderRadius: 22, padding: 16, justifyContent: 'center' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
    tile: {
      width: '31%',
      height: 62,
      borderRadius: 14,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },
    tileText: { fontSize: 8.5, fontWeight: '600', color: c.textSecondary },
    center: { gap: 8 },
    eyebrow: { fontSize: 8.5, fontWeight: '700', color: c.tertiaryDeep, textTransform: 'uppercase', letterSpacing: 1 },
    serif: { fontFamily: FONT.serif, fontSize: 24, lineHeight: 30, color: c.textPrimary },
    serifAccent: { fontFamily: FONT.serif, fontSize: 24, color: c.primaryDark },
    small: { fontSize: 9, fontWeight: '600', color: c.textSecondary },
    week: { flexDirection: 'row', gap: 5 },
    day: { flex: 1, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    dayText: { fontSize: 9.5, fontWeight: '600', color: c.textPrimary },
    pill: { backgroundColor: c.surface, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
    monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    monthDay: { width: '12%', height: 28, borderRadius: 9, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'transparent' },
    legend: { flexDirection: 'row', gap: 12 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 12, height: 100 },
    bar: { width: 22, borderRadius: 6 },
    row3: { flexDirection: 'row', gap: 8 },
    stat: { flex: 1, backgroundColor: c.surface, borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 4 },
    statValue: { fontSize: 13, fontWeight: '700', color: c.textPrimary },
    notice: { backgroundColor: c.surface, borderRadius: 14, padding: 14, gap: 6 },
    noticeApp: { fontSize: 8.5, fontWeight: '700', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
    noticeText: { fontSize: 10.5, fontWeight: '600', color: c.textPrimary, lineHeight: 16 },
    shareRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    row2: { flexDirection: 'row', gap: 8 },
    halfTile: { flex: 1, backgroundColor: c.surface, borderRadius: 14, padding: 12 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: { borderRadius: 99, paddingVertical: 6, paddingHorizontal: 10 },
    chipPink: { backgroundColor: c.surface },
    chipPeach: { backgroundColor: c.tertiarySoft, borderWidth: 1, borderColor: c.border },
    chipText: { fontSize: 9, fontWeight: '600', color: c.textPrimary },
  });
}
