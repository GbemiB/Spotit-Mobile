import { View, StyleSheet } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme, phases, Text } from '../../shared/styles/index.js';
import { FONT } from '../../shared/styles/typography.js';
import { calendarPalette } from '../../shared/styles/colors.js';
import { BellIcon, LockIcon } from '../../components/ui/icons.jsx';
import PointsCard from '../dashboard/PointsCard.jsx';
import { useReduceMotion, FadeIn, RiseText, AnimatedCycleBar } from '../dashboard/HeroCardFx.jsx';
const CYCLE = 28;
const DAY = 20;
const OV_DAY = CYCLE - 14;
const MOODS = [
  ['😊', 'Happy'],
  ['😌', 'Calm'],
  ['😐', 'Okay'],
  ['😔', 'Low'],
  ['🥺', 'Tender'],
];
const SUPPORT = ['Checked in on her', 'Brought her snacks', 'Listened to her'];
function PeopleIcon({ color, size = 16 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3.5} stroke={color} strokeWidth={1.8} />
      <Circle cx={16.5} cy={9.5} r={2.5} stroke={color} strokeWidth={1.8} />
      <Path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M15 14.5c3 0 6 2 6 5.5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
function EyeIcon({ color }) {
  return (
    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <Circle cx={12} cy={12} r={3} />
    </Svg>
  );
}
function useLater(delay, reduceMotion) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const id = setTimeout(() => setOn(true), delay);
    return () => clearTimeout(id);
  }, [delay, reduceMotion]);
  return reduceMotion || on;
}
function Hero({ s, c, isDark, headline, viewOnly, reduceMotion }) {
  return (
    <View style={s.card}>
      <View style={[s.glow, { top: -50, right: -40, backgroundColor: isDark ? 'rgba(220,90,116,0.30)' : '#FCE3DC' }]} />
      <View style={[s.glow, { bottom: -60, left: -50, backgroundColor: isDark ? 'rgba(214,162,78,0.24)' : '#F6E6CC' }]} />
      <View style={s.labelRow}>
        <Text style={s.phaseLabel}>Every day on Home</Text>
        {viewOnly && (
          <FadeIn delay={700} reduceMotion={reduceMotion}>
            <View style={s.viewOnly}>
              <EyeIcon color={c.primaryDark} />
              <Text style={s.viewOnlyTx}>View only</Text>
            </View>
          </FadeIn>
        )}
      </View>
      <RiseText style={s.heroLine} delay={250} reduceMotion={reduceMotion}>
        {headline}
      </RiseText>
      <View style={{ marginTop: 10 }}>
        <AnimatedCycleBar
          value={DAY / CYCLE}
          colors={c.gradient.primaryAccent}
          trackColor={c.border}
          accent={c.primary}
          surface={c.surface}
          height={8}
          fertile={{ start: (OV_DAY - 6) / CYCLE, end: OV_DAY / CYCLE }}
          fertileColor={isDark ? 'rgba(95,169,140,0.85)' : 'rgba(95,169,140,0.8)'}
          ovulation={(OV_DAY - 0.5) / CYCLE}
          ovulationColor={phases.ovulation}
          reduceMotion={reduceMotion}
        />
      </View>
      <View style={s.dayRow}>
        {[
          ['Period', c.primary],
          ['Fertile', phases.fertile],
          ['Ovulation', phases.ovulation],
        ].map(([label, color]) => (
          <View key={label} style={s.legendItem}>
            <View style={[s.dot, { backgroundColor: color }]} />
            <Text style={s.legendTx}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
function Month({ s, c, cal, reduceMotion }) {
  const tones = [
    null,
    'period',
    'period',
    'period',
    'period',
    'period',
    null,
    null,
    'fertile',
    'fertile',
    'fertile',
    'fertile',
    'fertile',
    'fertile',
    'ovulation',
  ];
  const delays = { period: 150, fertile: 550, ovulation: 950 };
  return (
    <View style={s.card}>
      <View style={s.weekRow}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <Text key={i} style={s.dow}>
            {d}
          </Text>
        ))}
      </View>
      <View style={s.monthGrid}>
        {tones.slice(1).map((t, i) => {
          const day = (
            <View
              style={[
                s.monthDay,
                t === 'period' && { borderWidth: 1.5, borderStyle: 'dashed', borderColor: cal.period },
                (t === 'fertile' || t === 'ovulation') && { backgroundColor: cal.tint[t] },
              ]}
            >
              <Text style={[s.dayNum, t === 'period' && { color: c.primaryDark }]}>{i + 1}</Text>
            </View>
          );
          return (
            <View key={i} style={s.monthCell}>
              {t ? (
                <FadeIn delay={delays[t]} reduceMotion={reduceMotion}>
                  {day}
                </FadeIn>
              ) : (
                day
              )}
            </View>
          );
        })}
      </View>
      <View style={s.legend}>
        {[
          ['Period', cal.period],
          ['Fertile', cal.fertile],
          ['Ovulation', cal.ovulation],
        ].map(([label, color]) => (
          <View key={label} style={s.legendItem}>
            <View style={[s.dot, { backgroundColor: color }]} />
            <Text style={s.legendTx}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
function Mood({ s, c, reduceMotion }) {
  const picked = useLater(900, reduceMotion);
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>How are you feeling today?</Text>
      <View style={s.moodGrid}>
        {MOODS.map(([emoji, label]) => {
          const on = picked && label === 'Calm';
          return (
            <View key={label} style={[s.mood, on && { borderWidth: 2, borderColor: c.primary, backgroundColor: c.primarySoft }]}>
              <Text style={s.emoji}>{emoji}</Text>
              <Text style={s.moodTx}>{label}</Text>
            </View>
          );
        })}
      </View>
      {picked && (
        <FadeIn delay={200} reduceMotion={reduceMotion}>
          <View style={s.reply}>
            <Text style={s.replyTx}>A calm day, nice. Saved to today’s log.</Text>
          </View>
        </FadeIn>
      )}
    </View>
  );
}
function Row({ s, icon, iconBg, label, sub, right, last }) {
  return (
    <View style={[s.row, last && { borderBottomWidth: 0 }]}>
      <View style={[s.rowIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={s.rowSub}>{sub}</Text>
      </View>
      {right}
    </View>
  );
}
function Control({ s, c, reduceMotion }) {
  const on = useLater(800, reduceMotion);
  return (
    <View style={[s.card, { padding: 0 }]}>
      <Row
        s={s}
        icon={<BellIcon size={16} color={c.primaryDark} />}
        iconBg={c.primarySoft}
        label="Reminders"
        sub="Before your period"
        right={
          <View style={[s.track, { backgroundColor: on ? c.primary : c.border }]}>
            <View style={[s.thumb, on && { left: 22 }]} />
          </View>
        }
      />
      <Row
        s={s}
        icon={<PeopleIcon color={c.primaryDark} />}
        iconBg={c.primarySoft}
        label="Partner"
        sub="Invite them to follow along"
        right={<Text style={s.link}>Invite</Text>}
      />
      <Row
        s={s}
        icon={<LockIcon size={16} color={c.tertiaryDeep} />}
        iconBg={c.tertiarySoft}
        label="Your data"
        sub="Export or delete any time"
        last
      />
    </View>
  );
}
function CheckIn({ s, c, name, reduceMotion }) {
  const first = useLater(700, reduceMotion);
  const second = useLater(1300, reduceMotion);
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{`How did you support ${name || 'her'} today?`}</Text>
      <View style={s.chips}>
        {SUPPORT.map((label, i) => {
          const on = (i === 0 && first) || (i === 2 && second);
          return (
            <View key={label} style={[s.chip, on && { borderColor: c.primary, backgroundColor: c.primarySoft }]}>
              <Text style={[s.chipTx, { color: on ? c.primaryDark : c.textSecondary }]}>{label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
function Notice({ s, c, text, reduceMotion }) {
  return (
    <FadeIn delay={200} from="top" reduceMotion={reduceMotion}>
      <View style={[s.card, s.notice]}>
        <View style={[s.rowIcon, { backgroundColor: c.primarySoft }]}>
          <BellIcon size={16} color={c.primaryDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.noticeApp}>Spot it · now</Text>
          <Text style={s.noticeTx}>{text}</Text>
        </View>
      </View>
    </FadeIn>
  );
}
export default function TourPreview({ kind, partnerName }) {
  const { colors: c, isDark } = useTheme();
  const s = useMemo(() => createStyles(c), [c]);
  const reduceMotion = useReduceMotion();
  const cal = calendarPalette[isDark ? 'dark' : 'light'];
  const her = partnerName ? `${partnerName}’s` : 'Her';
  const body = {
    welcome: (
      <Hero
        s={s}
        c={c}
        isDark={isDark}
        headline="Your period, fertile days and ovulation, counted down for you"
        reduceMotion={reduceMotion}
      />
    ),
    calendar: <Month s={s} c={c} cal={cal} reduceMotion={reduceMotion} />,
    log: <Mood s={s} c={c} reduceMotion={reduceMotion} />,
    points: <PointsCard levelName="Blush" points={120} pct={0.6} toNextText="80 SP to Petal" onPress={() => {}} />,
    control: <Control s={s} c={c} reduceMotion={reduceMotion} />,
    partnerWelcome: (
      <Hero s={s} c={c} isDark={isDark} headline={`${her} cycle, counted down for you`} viewOnly reduceMotion={reduceMotion} />
    ),
    partnerCheckIn: <CheckIn s={s} c={c} name={partnerName} reduceMotion={reduceMotion} />,
    partnerReminder: <Notice s={s} c={c} text={`${her} period is expected to start in 5 days.`} reduceMotion={reduceMotion} />,
  }[kind];
  return (
    <LinearGradient colors={[c.primarySoft, c.tertiarySoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.box}>
      {body}
    </LinearGradient>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    box: { height: 150, borderRadius: 20, padding: 8, justifyContent: 'center' },
    card: { borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, padding: 10, overflow: 'hidden' },
    glow: { position: 'absolute', width: 140, height: 140, borderRadius: 70 },
    labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    phaseLabel: { fontSize: 9, fontWeight: '700', color: c.tertiary, textTransform: 'uppercase', letterSpacing: 1 },
    viewOnly: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.primarySoft,
      borderRadius: 99,
      paddingVertical: 4,
      paddingHorizontal: 9,
    },
    viewOnlyTx: { fontSize: 9, fontWeight: '700', color: c.primaryDark },
    heroLine: { fontFamily: FONT.serif, fontSize: 16, lineHeight: 21, color: c.textPrimary, marginTop: 5 },
    dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    weekRow: { flexDirection: 'row' },
    dow: { flex: 1, textAlign: 'center', fontSize: 9, fontWeight: '600', color: c.textSecondary },
    monthGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
    monthCell: { width: `${100 / 7}%`, padding: 2.5 },
    monthDay: { height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    dayNum: { fontSize: 10.5, fontWeight: '700', color: c.textSecondary },
    legend: { flexDirection: 'row', gap: 12, marginTop: 8, paddingHorizontal: 2 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    dot: { width: 7, height: 7, borderRadius: 4 },
    legendTx: { fontSize: 9, fontWeight: '600', color: c.textSecondary },
    cardTitle: { fontSize: 12, fontWeight: '700', color: c.textPrimary, paddingHorizontal: 2 },
    moodGrid: { flexDirection: 'row', gap: 5, marginTop: 8 },
    mood: {
      flex: 1,
      height: 50,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
    },
    emoji: { fontSize: 16, lineHeight: 22 },
    moodTx: { fontSize: 9, fontWeight: '600', color: c.textSecondary },
    reply: { marginTop: 8, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 14, backgroundColor: c.primarySoft },
    replyTx: { fontSize: 10, lineHeight: 16, color: c.textPrimary },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    rowIcon: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    rowLabel: { fontSize: 11, fontWeight: '600', color: c.textPrimary },
    rowSub: { fontSize: 9.5, color: c.textMuted, marginTop: 2 },
    track: { width: 44, height: 24, borderRadius: 12 },
    thumb: { position: 'absolute', top: 2, left: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: c.white },
    link: { fontSize: 10, fontWeight: '700', color: c.primaryDark },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
    chip: {
      paddingVertical: 6,
      paddingHorizontal: 11,
      borderRadius: 99,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background,
    },
    chipTx: { fontSize: 10.5, fontWeight: '600' },
    notice: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    noticeApp: { fontSize: 8.5, fontWeight: '700', color: c.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
    noticeTx: { fontSize: 11, fontWeight: '600', color: c.textPrimary, lineHeight: 16, marginTop: 3 },
  });
}
