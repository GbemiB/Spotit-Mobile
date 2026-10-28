import { View, ScrollView, StyleSheet } from 'react-native';
import { useMemo, useState } from 'react';
import { useTheme, Text, FONT } from '../../shared/styles/index.js';
import { LockIcon } from '../../components/ui/icons.jsx';
import { Rise, PressScale, Icon } from './SpotlightFx.jsx';
import { SpChip } from './HubView.jsx';
import { tone, GROUP_ICONS } from './quizTheme.js';

export function BackRow({ label, onPress }) {
  const { colors: c } = useTheme();
  return (
    <PressScale onPress={onPress} accessibilityLabel={`Back to ${label}`}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 38, paddingRight: 8 }}>
        <Icon d="M15 5l-7 7 7 7" size={18} color={c.primaryDark} width={2.2} />
        <Text style={{ fontSize: 12, fontWeight: '700', color: c.primaryDark }}>{label}</Text>
      </View>
    </PressScale>
  );
}

function Chip({ label, active, onPress }) {
  const { colors: c } = useTheme();
  return (
    <PressScale onPress={onPress} accessibilityLabel={label}>
      <View
        style={{
          height: 34,
          paddingHorizontal: 14,
          borderRadius: 99,
          justifyContent: 'center',
          borderWidth: 1.5,
          backgroundColor: active ? c.primaryDark : c.surface,
          borderColor: active ? c.primaryDark : c.border,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#FFFFFF' : c.textSecondary }}>{label}</Text>
      </View>
    </PressScale>
  );
}

function TopicRow({ item, onPress }) {
  const { colors: c, isDark } = useTheme();
  const t = tone(item.locked ? 'locked' : item.topic.tone, isDark);
  return (
    <PressScale
      onPress={onPress}
      accessibilityLabel={item.locked ? `${item.topic.name}, opens at 18` : `${item.topic.name}, ${item.status.label}`}
    >
      <View style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={[styles.rowIcon, { backgroundColor: t.bg, borderColor: t.line }]}>
          {item.locked ? <LockIcon size={18} color={t.ink} /> : <Icon d={GROUP_ICONS[item.topic.group]} color={t.ink} />}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.rowName, { color: item.locked ? c.textMuted : c.textPrimary }]} numberOfLines={1}>
            {item.topic.name}
          </Text>
          {item.locked ? (
            <Text style={{ fontSize: 10, color: c.textMuted, marginTop: 2 }}>Opens at 18</Text>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
              <View style={[styles.bar, { backgroundColor: c.border }]}>
                <View style={{ width: `${Math.max(item.status.pct, 3)}%`, height: '100%', borderRadius: 99, backgroundColor: t.ink }} />
              </View>
              <Text style={{ fontSize: 9.5, fontWeight: '600', color: t.ink }}>{item.status.label}</Text>
            </View>
          )}
        </View>
        {item.locked ? (
          <Text style={[styles.age, { color: c.textMuted, borderColor: c.border }]}>18+</Text>
        ) : (
          <Icon d="M9 5l7 7-7 7" size={16} color={c.primaryDark} width={2} />
        )}
      </View>
    </PressScale>
  );
}

export default function TopicsView({ insets, balance, groups, isTeen, total, reduceMotion, onBack, onOpenTopic, onLocked, onOpenPoints }) {
  const { colors: c, isDark } = useTheme();
  const s = useMemo(() => createStyles(c), [c]);
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? groups : groups.filter(g => g.key === filter);
  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      <Rise index={0} reduceMotion={reduceMotion} style={s.top}>
        <BackRow label="Spotlight" onPress={onBack} />
        <SpChip balance={balance} onPress={onOpenPoints} reduceMotion={reduceMotion} />
      </Rise>
      <Rise index={1} reduceMotion={reduceMotion} style={s.head}>
        <Text style={s.title}>Know Yourself</Text>
        <Text style={s.sub}>{total} topics · levels 1–3 of every topic are free</Text>
      </Rise>
      <Rise index={2} reduceMotion={reduceMotion}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 4 }}
        >
          <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          {groups.map(g => (
            <Chip key={g.key} label={g.label} active={filter === g.key} onPress={() => setFilter(g.key)} />
          ))}
        </ScrollView>
      </Rise>
      {isTeen && (
        <Rise index={3} reduceMotion={reduceMotion} style={s.section}>
          <View style={[s.teen, { backgroundColor: tone('gold', isDark).bg, borderColor: tone('gold', isDark).line }]}>
            <LockIcon size={16} color={tone('gold', isDark).ink} />
            <Text style={[s.teenTx, { color: c.textSecondary }]}>Some topics open when you turn 18. Everything else is ready for you.</Text>
          </View>
        </Rise>
      )}
      {shown.map((g, gi) => (
        <Rise key={g.key} index={4 + gi} reduceMotion={reduceMotion} style={s.section}>
          <View style={s.groupHead}>
            <Text style={s.groupTitle}>{g.label}</Text>
            <Text style={s.count}>{g.items.length}</Text>
          </View>
          <View style={{ gap: 10 }}>
            {g.items.map(item => (
              <TopicRow key={item.topic.id} item={item} onPress={() => (item.locked ? onLocked(item.topic) : onOpenTopic(item.topic.id))} />
            ))}
          </View>
        </Rise>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 20, borderWidth: 1.5 },
  rowIcon: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rowName: { fontFamily: FONT.serif, fontSize: 17, lineHeight: 21 },
  bar: { flex: 1, maxWidth: 90, height: 5, borderRadius: 99, overflow: 'hidden' },
  age: { fontSize: 9.5, fontWeight: '700', borderWidth: 1, borderRadius: 99, paddingHorizontal: 7, paddingVertical: 3 },
});

function createStyles(c) {
  return StyleSheet.create({
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingRight: 24,
      marginBottom: 8,
    },
    head: { paddingHorizontal: 24, marginBottom: 14 },
    title: { fontFamily: FONT.serif, fontSize: 30, lineHeight: 36, color: c.textPrimary },
    sub: { fontSize: 11, color: c.textMuted, marginTop: 4 },
    section: { paddingHorizontal: 24, marginTop: 18 },
    teen: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 16, borderWidth: 1 },
    teenTx: { flex: 1, fontSize: 10.5, lineHeight: 16 },
    groupHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
    groupTitle: { fontSize: 13, fontWeight: '700', color: c.textPrimary },
    count: { fontSize: 10, color: c.textMuted },
  });
}
