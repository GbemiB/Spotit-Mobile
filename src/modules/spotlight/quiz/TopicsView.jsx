import { View, ScrollView, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useTheme, Text, FONT } from '../../../shared/styles/index.js';
import { LockIcon } from '../../../components/ui/icons.jsx';
import { Rise, PressScale, Icon } from '../common/SpotlightFx.jsx';
import SpChip from '../common/SpChip.jsx';
import { tone } from '../common/theme.js';
import { TopicGrid } from '../common/TopicTile.jsx';
import { freeLevelsShort } from '../common/wording.js';

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

const LOAD_AHEAD = 400;

export default function TopicsView({
  insets,
  balance,
  groups,
  chips,
  filter,
  onFilter,
  hasMore,
  loading,
  loadingMore,
  onLoadMore,
  isTeen,
  freeLevels,
  total,
  reduceMotion,
  onBack,
  onOpenTopic,
  onLocked,
  onOpenPoints,
}) {
  const { colors: c, isDark } = useTheme();
  const s = useMemo(() => createStyles(c), [c]);
  function nearEnd({ nativeEvent: e }) {
    if (hasMore && !loadingMore && e.layoutMeasurement.height + e.contentOffset.y >= e.contentSize.height - LOAD_AHEAD) onLoadMore();
  }
  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
      onScroll={nearEnd}
      scrollEventThrottle={100}
    >
      <Rise index={0} reduceMotion={reduceMotion} style={s.top}>
        <BackRow label="Spotlight" onPress={onBack} />
        <SpChip balance={balance} onPress={onOpenPoints} reduceMotion={reduceMotion} />
      </Rise>
      <Rise index={1} reduceMotion={reduceMotion} style={s.head}>
        <Text style={s.title}>Know Yourself</Text>
        <Text style={s.sub}>
          {total} topics · {freeLevelsShort(freeLevels)}
        </Text>
      </Rise>
      <Rise index={2} reduceMotion={reduceMotion}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 4 }}
        >
          <Chip label="All" active={filter === 'all'} onPress={() => onFilter('all')} />
          {chips.map(g => (
            <Chip key={g.key} label={g.label} active={filter === g.key} onPress={() => onFilter(g.key)} />
          ))}
        </ScrollView>
      </Rise>
      {isTeen && (
        <Rise index={3} reduceMotion={reduceMotion} style={s.section}>
          <View style={[s.teen, { backgroundColor: tone('gold', isDark).bg, borderColor: tone('gold', isDark).line }]}>
            <LockIcon size={16} color={tone('gold', isDark).ink} />
            <Text style={[s.teenTx, { color: c.textSecondary }]}>
              Some topics open when you’re older. Everything else is ready for you.
            </Text>
          </View>
        </Rise>
      )}
      {loading ? <Text style={s.more}>Loading topics…</Text> : null}
      {groups.map((g, gi) => (
        <Rise key={g.key} index={4 + gi} reduceMotion={reduceMotion} style={s.section}>
          <View style={s.groupHead}>
            <Text style={s.groupTitle}>{g.label}</Text>
            <Text style={s.count}>{chips.find(ch => ch.key === g.key)?.count ?? g.items.length}</Text>
          </View>
          <TopicGrid
            items={g.items}
            reduceMotion={reduceMotion}
            onOpen={item => (item.locked ? onLocked(item.topic) : onOpenTopic(item.topic.id))}
          />
        </Rise>
      ))}
      {loadingMore ? <Text style={s.more}>Loading more…</Text> : null}
      {hasMore && !loadingMore && !loading ? (
        <PressScale onPress={onLoadMore} accessibilityLabel="Show more topics">
          <Text style={[s.more, { color: c.primaryDark, fontWeight: '700' }]}>Show more topics</Text>
        </PressScale>
      ) : null}
    </ScrollView>
  );
}

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
    more: { fontSize: 11, color: c.textMuted, textAlign: 'center', marginTop: 18, paddingVertical: 8 },
  });
}
