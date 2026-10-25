import { View, Pressable, ScrollView, Alert, Keyboard, Platform, StyleSheet } from 'react-native';
import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import {
  cycleDayOf,
  calendarDay,
  addDays,
  todayISO,
  formatDisplayDate,
  toISO,
  trackingStartOf,
  periodLogStartForMonth,
  periodAround,
} from '../../shared/utils/cycle.js';
import { MONTHS, PHASE_NOTES, PHASE_LABELS } from '../../shared/constants/cycle.js';
import { MOODS, SYMPTOMS, SYMPTOM_CATEGORIES } from '../../shared/constants/options.js';
import { useTheme, calendarPalette, Text, TextInput, FONT } from '../../shared/styles/index.js';
import CalendarGrid from '../../components/calendar/CalendarGrid.jsx';
import CalendarGuideSheet from './CalendarGuideSheet.jsx';
import PartnerDayLog from '../partner/PartnerDayLog.jsx';
import { viewerOf, calendarNote } from '../../shared/utils/viewer.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Toggle from '../../components/ui/Toggle.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import * as logsApi from '../../shared/api/logs.js';
import * as cycleApi from '../../shared/api/cycle.js';
import * as partnerApi from '../../shared/api/partner.js';
import { loveLine } from '../../shared/utils/partnerLove.js';
import { noteLogSaved } from '../../shared/utils/rateApp.js';
const MOOD_EMOJI = Object.fromEntries(MOODS.map(m => [m.id, m.emoji]));
const SYMPTOM_CATEGORY_BY_ID = Object.fromEntries(SYMPTOMS.map(s => [s.id, s.category]));
function toOptions(list, iconMap, key = 'icon') {
  return list.map(o => ({ id: o.id, label: o.label, [key]: iconMap[o.id] }));
}
function withCategory(list) {
  return list.map(o => ({ ...o, category: SYMPTOM_CATEGORY_BY_ID[o.id] || 'Other' }));
}
function groupByCategory(options) {
  const byCategory = {};
  options.forEach(o => {
    const cat = o.category || 'Other';
    (byCategory[cat] ||= []).push(o);
  });
  const known = SYMPTOM_CATEGORIES.filter(cat => byCategory[cat]?.length).map(cat => ({ category: cat, items: byCategory[cat] }));
  return byCategory.Other ? [...known, { category: 'Other', items: byCategory.Other }] : known;
}
function SectionLabel({ children, s }) {
  return <Text style={s.secLabel}>{children}</Text>;
}
function ChipGroup({ label, items, selected, onSelect, multiSelect = false, shape = 'pill', s }) {
  return (
    <View style={s.section}>
      <SectionLabel s={s}>{label}</SectionLabel>
      <View style={s.chipRow}>
        {items.map(item => {
          const sel = multiSelect ? selected?.includes(item.id) : selected === item.id;
          const icon = item.emoji || item.icon;
          return (
            <Pressable key={item.id} onPress={() => onSelect(item.id)} style={[shape === 'rect' ? s.chipRect : s.chip, sel && s.chipSel]}>
              {icon ? <Text style={shape === 'rect' ? s.chipRectEmoji : s.chipEmoji}>{icon}</Text> : null}
              <Text
                style={[shape === 'rect' ? s.chipRectTx : s.chipTx, sel && s.chipTxSel]}
                numberOfLines={1}
                adjustsFontSizeToFit={shape === 'rect'}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
function SymptomPicker({ options, selected, onToggle, s }) {
  const groups = useMemo(() => groupByCategory(options), [options]);
  return (
    <View style={s.section}>
      <SectionLabel s={s}>Symptoms</SectionLabel>
      <View style={{ gap: 14 }}>
        {groups.map(g => (
          <View key={g.category}>
            <Text style={s.categoryLabel}>{g.category}</Text>
            <View style={s.chipRow}>
              {g.items.map(item => {
                const sel = selected.includes(item.id);
                return (
                  <Pressable key={item.id} onPress={() => onToggle(item.id)} style={[s.chip, sel && s.chipSel]}>
                    <Text style={[s.chipTx, sel && s.chipTxSel]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
function blankDraft(date) {
  return { date, mood: null, symptoms: [], notes: '', intimate: false };
}
function draftFrom(date, log) {
  return log
    ? {
        date,
        mood: log.mood || null,
        symptoms: log.symptoms ? [...log.symptoms] : [],
        notes: log.notes || '',
        intimate: log.intimate || false,
      }
    : blankDraft(date);
}
const LOVE_PREVIEW = 3;
export default function CalendarScreen() {
  const { state, dispatch } = useApp();
  const viewer = viewerOf(state);
  const { colors, isDark } = useTheme();
  const cal = calendarPalette[isDark ? 'dark' : 'light'];
  const s = useMemo(() => createStyles(colors), [colors]);
  const [guideOpen, setGuideOpen] = useState(false);
  const logStart = periodLogStartForMonth(state.viewYear, state.viewMonth, todayISO());
  const {
    viewYear,
    viewMonth,
    selDate,
    logs,
    cycleLength,
    periodLength,
    lastPeriodDate,
    trackingStartDate,
    accessToken,
    calendarPhases,
    periodPickerOpen,
    partnerLove,
  } = state;
  const insets = useSafeAreaInsets();
  const [deleting, setDeleting] = useState(false);
  const [removeAsk, setRemoveAsk] = useState(null);
  const [loveOpenFor, setLoveOpenFor] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [moodOptions, setMoodOptions] = useState(() => toOptions(MOODS, MOOD_EMOJI, 'emoji'));
  const [symptomOptions, setSymptomOptions] = useState(SYMPTOMS);
  const cycleState = { lastPeriodDate, cycleLength, periodLength, trackingStart: trackingStartDate };
  const selLog = logs[selDate];
  const goPrevMonth = useCallback(() => dispatch({ type: A.PREV_MONTH }), [dispatch]);
  const goNextMonth = useCallback(() => dispatch({ type: A.NEXT_MONTH }), [dispatch]);
  const selInfo = selDate
    ? (calendarPhases[selDate] ?? calendarDay(selDate, { ...cycleState, logs, todayIso: todayISO() }))
    : { phase: null, predicted: false, marker: null };
  const selPhaseKey = selInfo.phase;
  const trackingStart = trackingStartOf(trackingStartDate, lastPeriodDate);
  const beforeTracking = !!selDate && !!trackingStart && selDate < trackingStart;
  const inTrackedCycle =
    !!selDate && !!lastPeriodDate && selDate >= lastPeriodDate && (selInfo.predicted || selDate < addDays(lastPeriodDate, cycleLength));
  const selCycleDay = inTrackedCycle ? cycleDayOf(selDate, lastPeriodDate, cycleLength) : null;
  const selPhase = {
    key: selPhaseKey,
    label: selPhaseKey
      ? `${PHASE_LABELS[selPhaseKey]}${selInfo.predicted ? ' (predicted)' : ''}`
      : selInfo.marker === 'missed'
        ? 'No period logged'
        : selInfo.marker === 'expected'
          ? 'Period expected'
          : beforeTracking
            ? 'Before tracking started'
            : lastPeriodDate
              ? 'Not tracked'
              : 'No data yet',
    color: selPhaseKey ? cal[selPhaseKey] : null,
  };
  const isPeriodDay = !!selDate && selPhaseKey === 'period';
  const [formDraft, setFormDraft] = useState(() => draftFrom(selDate, logs[selDate]));
  const activeDraft = formDraft.date === selDate ? formDraft : draftFrom(selDate, selLog);
  function updateDraft(patch) {
    setFormDraft({ ...activeDraft, ...patch });
  }
  useEffect(() => {
    logsApi
      .getTemplate(accessToken)
      .then(data => {
        if (data?.mood?.length) setMoodOptions(toOptions(data.mood, MOOD_EMOJI, 'emoji'));
        if (data?.symptoms?.length) setSymptomOptions(withCategory(data.symptoms));
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    const from = toISO(new Date(viewYear, viewMonth, 1));
    const to = toISO(new Date(viewYear, viewMonth + 1, 0));
    logsApi
      .getLogsInRange({ from, to }, accessToken)
      .then(data => dispatch({ type: A.LOGS_HYDRATED, from, to, logs: data.logs || {} }))
      .catch(() => {});
    cycleApi
      .getCalendar({ year: viewYear, month: viewMonth + 1 }, accessToken)
      .then(data => {
        const phasesByDate = {};
        (data.days || []).forEach(d => {
          phasesByDate[d.date] = { phase: d.phase, predicted: !!d.predicted, marker: d.marker ?? null };
        });
        dispatch({ type: A.CALENDAR_PHASES_HYDRATED, phases: phasesByDate });
      })
      .catch(() => {});
    if (state.accountType !== 'partner') {
      partnerApi
        .getPartnerLove({ from, to }, accessToken)
        .then(data => dispatch({ type: A.PARTNER_LOVE_HYDRATED, from, to, items: data.items }))
        .catch(() => {});
    }
  }, [viewYear, viewMonth, lastPeriodDate, periodPickerOpen]);
  const scrollRef = useRef(null);
  const notesFocused = useRef(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, e => {
      setKeyboardHeight(e.endCoordinates.height);
      if (notesFocused.current) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    });
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  async function handleSaveLog() {
    if (saving) return;
    setError('');
    setSaving(true);
    try {
      const data = await logsApi.saveLog(selDate, activeDraft, accessToken);
      dispatch({
        type: A.SAVE_LOG,
        date: selDate,
        entry: { flow: data.flow, mood: data.mood, symptoms: data.symptoms, notes: data.notes, intimate: data.intimate },
        pointsAwarded: data.pointsAwarded,
        newBalance: data.newBalance,
        streak: data.streak,
        isNewEntry: data.isNewEntry,
      });
      noteLogSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function handleRemovePeriod() {
    const period = removeAsk;
    setRemoveAsk(null);
    if (!period || removing) return;
    setRemoving(true);
    try {
      const data = await logsApi.removePeriod(period.start, accessToken);
      dispatch({
        type: A.PERIOD_REMOVED,
        clearedEntries: data.clearedEntries,
        lastPeriodDate: data.lastPeriodDate,
        trackingStartDate: data.trackingStartDate,
      });
    } catch (e) {
      Alert.alert('Could not remove the period', e.message);
    } finally {
      setRemoving(false);
    }
  }
  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await logsApi.deleteLog(selDate, accessToken);
      dispatch({ type: A.DELETE_LOG, date: selDate });
    } catch (e) {
      Alert.alert('Could not delete entry', e.message);
    } finally {
      setDeleting(false);
    }
  }
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ paddingBottom: keyboardHeight ? keyboardHeight + 24 : insets.bottom + 110 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.headerRow}>
          <Text style={s.screenTitle}>Calendar</Text>
          <View style={s.monthNav}>
            <Pressable onPress={() => dispatch({ type: A.PREV_MONTH })} style={s.navBtn}>
              <Text style={s.navArrow}>‹</Text>
            </Pressable>
            <Pressable onPress={() => dispatch({ type: A.NEXT_MONTH })} style={s.navBtn}>
              <Text style={s.navArrow}>›</Text>
            </Pressable>
            <Text style={s.monthTitle}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
          </View>
        </View>
        <View style={s.subRow}>
          <Text style={[s.screenSub, s.subText]}>Tap any day to see it, or swipe to change month.</Text>
          {!selDate && logStart && !viewer.isPartner && (
            <Pressable
              onPress={() => dispatch({ type: A.OPEN_PERIOD_PICKER, startDate: logStart })}
              style={s.logPeriodPill}
              accessibilityRole="button"
            >
              <Text style={s.logPeriodPillTx}>+ Log a period</Text>
            </Pressable>
          )}
        </View>

        <View style={s.phaseKeyWrap}>
          {['period', 'fertile', 'ovulation'].map(key => (
            <View key={key} style={s.phaseKeyItem}>
              <View style={[s.phaseKeyDot, { backgroundColor: cal.tint[key], borderColor: cal[key] }]} />
              <Text style={s.phaseKeyLabel}>{PHASE_LABELS[key]}</Text>
            </View>
          ))}
          <View style={s.phaseKeyItem}>
            <View style={[s.phaseKeyDot, s.phaseKeyDashed, { borderColor: cal.period }]} />
            <Text style={s.phaseKeyLabel}>Predicted period</Text>
          </View>
          <View style={s.phaseKeyItem}>
            <Text style={[s.phaseKeyToday, { color: cal.today }]}>{Number(todayISO().slice(8))}</Text>
            <Text style={s.phaseKeyLabel}>Today</Text>
          </View>
          <View style={s.phaseKeyItem}>
            <View style={[s.phaseKeyLogged, { backgroundColor: cal.dot }]} />
            <Text style={s.phaseKeyLabel}>Logged</Text>
          </View>
          <Pressable
            onPress={() => setGuideOpen(true)}
            style={s.infoBtn}
            accessibilityRole="button"
            accessibilityLabel="How to read your calendar"
            hitSlop={8}
          >
            <Text style={s.infoTx}>i</Text>
          </Pressable>
        </View>
        <CalendarGuideSheet open={guideOpen} onClose={() => setGuideOpen(false)} />
        <ConfirmModal
          visible={!!removeAsk}
          title="Remove this period?"
          message={
            removeAsk
              ? `This clears your period from ${formatDisplayDate(removeAsk.start)} to ${formatDisplayDate(removeAsk.end)}. Moods, symptoms and notes on those days stay.`
              : ''
          }
          confirmLabel="Remove"
          cancelLabel="Keep it"
          destructive
          onConfirm={handleRemovePeriod}
          onCancel={() => setRemoveAsk(null)}
        />

        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Card style={s.gridCard}>
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              selDate={selDate}
              logs={logs}
              cycleState={cycleState}
              phaseByDate={calendarPhases}
              onPrevMonth={goPrevMonth}
              onNextMonth={goNextMonth}
              onSelect={d => {
                setFormDraft(draftFrom(d, logs[d]));
                dispatch({ type: A.SEL_DATE, date: d });
              }}
            />
          </Card>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          {!selDate ? (
            <Card style={{ padding: 18, marginBottom: 14, borderRadius: 22 }}>
              <Text style={s.selDateLabel}>{`${MONTHS[viewMonth]} ${viewYear}`.toUpperCase()}</Text>
              <Text style={[s.selPhaseName, { marginTop: 8 }]}>Tap a day to see it</Text>
            </Card>
          ) : (
            <Card style={{ padding: 18, marginBottom: 14, borderRadius: 22 }}>
              <Text style={s.selDateLabel}>{formatDisplayDate(selDate).toUpperCase()}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8 }}>
                <View style={[s.phaseDot, { backgroundColor: selPhase.color }]} />
                <Text style={s.selPhaseName}>{selPhase.label}</Text>
                {selCycleDay != null && <Text style={s.cdTx}>Cycle day {selCycleDay}</Text>}
              </View>
              <Text style={s.phaseNote}>
                {selPhase.key
                  ? PHASE_NOTES[selPhase.key]
                  : beforeTracking
                    ? calendarNote('before-tracking', viewer)
                    : lastPeriodDate
                      ? 'This day falls outside the period, fertile, and ovulation windows we track.'
                      : calendarNote('no-period', viewer)}
              </Text>
              {selDate <= todayISO() && !viewer.isPartner && (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                  <View style={{ flex: 2 }}>
                    <Button
                      size="sm"
                      variant={selLog?.flow ? 'secondary' : 'primary'}
                      onPress={() => dispatch({ type: A.OPEN_PERIOD_PICKER, startDate: selDate })}
                    >
                      {selLog?.flow ? 'Edit this period' : 'Log period from this day'}
                    </Button>
                  </View>
                  {selLog?.flow ? (
                    <View style={{ flex: 1 }}>
                      <Button size="sm" variant="danger" onPress={() => setRemoveAsk(periodAround(logs, selDate))} disabled={removing}>
                        {removing ? 'Removing…' : 'Remove'}
                      </Button>
                    </View>
                  ) : null}
                </View>
              )}
            </Card>
          )}

          {!viewer.isPartner && selDate && partnerLove?.[selDate]?.length ? (
            <Card style={{ padding: 16, marginBottom: 14, borderRadius: 22 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={s.loveHeart}>♥</Text>
                <Text style={[s.loveTitle, { flex: 1 }]}>{`Love from ${partnerLove[selDate][0].partnerName || 'your partner'}`}</Text>
                {partnerLove[selDate].length > 1 ? <Text style={s.loveCount}>{`${partnerLove[selDate].length} today`}</Text> : null}
              </View>
              {(loveOpenFor === selDate ? partnerLove[selDate] : partnerLove[selDate].slice(-LOVE_PREVIEW)).map((item, i) => (
                <View key={i} style={s.loveItem}>
                  {item.kind === 'promise' ? (
                    <View style={s.loveChips}>
                      {item.labels.map(label => (
                        <View key={label} style={s.loveChip}>
                          <Text style={s.loveChipTx}>{label}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {item.kind === 'expression' ? <Text style={s.loveExpr}>{loveLine(item)}</Text> : null}
                  {item.note ? <Text style={s.loveNote}>{`“${item.note}”`}</Text> : null}
                </View>
              ))}
              {partnerLove[selDate].length > LOVE_PREVIEW ? (
                <Pressable
                  onPress={() => setLoveOpenFor(loveOpenFor === selDate ? null : selDate)}
                  hitSlop={8}
                  style={s.loveMore}
                  accessibilityRole="button"
                >
                  <Text style={s.loveMoreTx}>{loveOpenFor === selDate ? 'Show less' : `Show all ${partnerLove[selDate].length}`}</Text>
                </Pressable>
              ) : null}
            </Card>
          ) : null}

          {viewer.isPartner ? (
            <PartnerDayLog log={selDate ? selLog : null} name={viewer.name} />
          ) : isPeriodDay ? (
            <Card style={{ padding: 18, marginBottom: 14 }}>
              <Text style={s.logHeading}>{selLog ? 'Your log' : 'Log this day'}</Text>
              {selLog?.flow && (
                <View style={[s.logRow, { marginBottom: 16 }]}>
                  <Text style={s.logKey}>Flow</Text>
                  <Text style={s.logVal}>{selLog.flow}</Text>
                </View>
              )}

              <ChipGroup
                label="Mood"
                items={moodOptions}
                selected={activeDraft.mood}
                onSelect={id => updateDraft({ mood: id })}
                shape="rect"
                s={s}
              />
              <SymptomPicker
                options={symptomOptions}
                selected={activeDraft.symptoms}
                onToggle={id =>
                  updateDraft({
                    symptoms: activeDraft.symptoms.includes(id)
                      ? activeDraft.symptoms.filter(x => x !== id)
                      : [...activeDraft.symptoms, id],
                  })
                }
                s={s}
              />

              <View style={[s.section, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                <SectionLabel s={s}>Intimate activity</SectionLabel>
                <Toggle value={activeDraft.intimate} onChange={v => updateDraft({ intimate: v })} />
              </View>

              <View style={s.section}>
                <SectionLabel s={s}>Notes</SectionLabel>
                <TextInput
                  value={activeDraft.notes}
                  onChangeText={v => updateDraft({ notes: v })}
                  onFocus={() => {
                    notesFocused.current = true;
                    if (keyboardHeight) setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
                  }}
                  onBlur={() => {
                    notesFocused.current = false;
                  }}
                  placeholder="How are you feeling today?"
                  placeholderTextColor={colors.textFaint}
                  multiline
                  numberOfLines={3}
                  style={s.notesInput}
                  textAlignVertical="top"
                />
              </View>

              {error ? <Text style={s.errorTx}>{error}</Text> : null}

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                {selLog && (
                  <View style={{ flex: 1 }}>
                    <Button variant="danger" onPress={handleDelete} disabled={deleting}>
                      {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                  </View>
                )}
                <View style={{ flex: selLog ? 2 : 1 }}>
                  <Button onPress={handleSaveLog} disabled={saving}>
                    {saving ? 'Saving…' : 'Save entry →'}
                  </Button>
                </View>
              </View>
            </Card>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: 'transparent' },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 20,
      marginBottom: 8,
    },
    screenTitle: { fontSize: 24, fontWeight: '700', color: c.textPrimary, letterSpacing: -0.4 },
    monthNav: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    navBtn: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
    navArrow: { fontSize: 14, color: c.primaryDark, fontWeight: '500', lineHeight: 20 },
    monthTitle: { fontSize: 12, fontWeight: '500', color: c.primaryDark },
    screenSub: { fontSize: 11.5, color: c.textMuted, paddingHorizontal: 24, marginBottom: 18 },
    subRow: { flexDirection: 'row', alignItems: 'center', paddingRight: 24, marginBottom: 18, gap: 10 },
    subText: { flex: 1, marginBottom: 0 },
    logPeriodPill: {
      paddingHorizontal: 12,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.primarySoft,
      borderWidth: 1,
      borderColor: c.primarySoftBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loveHeart: { fontSize: 14, color: c.primary },
    loveCount: { fontSize: 10, fontWeight: '700', color: c.textSecondary },
    loveMore: { alignSelf: 'flex-start', marginTop: 10, paddingVertical: 6 },
    loveMoreTx: { fontSize: 11, fontWeight: '700', color: c.primaryDark },
    loveTitle: { fontSize: 12, fontWeight: '700', color: c.textPrimary },
    loveItem: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.border },
    loveExpr: { fontSize: 13, fontWeight: '700', color: c.primaryDark },
    loveChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    loveChip: {
      backgroundColor: c.primarySoft,
      borderWidth: 1,
      borderColor: c.primarySoftBorder,
      borderRadius: 99,
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    loveChipTx: { fontSize: 10.5, fontWeight: '700', color: c.primaryDark },
    loveNote: { fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 13, lineHeight: 19, color: c.textSecondary, marginTop: 6 },
    logPeriodPillTx: { fontSize: 11.5, fontWeight: '700', color: c.primaryDark },
    gridCard: {
      padding: 14,
      borderRadius: 28,
      shadowColor: c.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 20,
      elevation: 2,
    },
    phaseKeyWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 24, marginTop: 18, marginBottom: 16 },
    phaseKeyItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    phaseKeyDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5 },
    phaseKeyDashed: { borderStyle: 'dashed', backgroundColor: 'transparent' },
    phaseKeyToday: { fontSize: 10.5, fontWeight: '800' },
    phaseKeyLogged: { width: 5, height: 5, borderRadius: 3, marginHorizontal: 3 },
    infoBtn: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 'auto',
    },
    infoTx: { fontFamily: FONT.serif, fontSize: 14, color: c.textSecondary, marginTop: -1 },
    phaseKeyLabel: { fontSize: 10.5, color: c.textSecondary },
    selDateLabel: { fontSize: 10, color: c.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
    phaseDot: { width: 11, height: 11, borderRadius: 6 },
    selPhaseName: { fontFamily: FONT.serif, fontSize: 19, color: c.textPrimary },
    cdTx: { fontSize: 11, color: c.textMuted, marginLeft: 'auto' },
    phaseNote: { fontSize: 11, color: c.textSecondary, lineHeight: 20, marginTop: 8 },
    logHeading: { fontSize: 10, fontWeight: '600', color: c.textSecondary, marginBottom: 12 },
    logRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    logKey: { fontSize: 10, color: c.textMuted, fontWeight: '600' },
    logVal: { fontSize: 10, color: c.textPrimary, fontWeight: '600', textTransform: 'capitalize' },
    section: { marginBottom: 20 },
    secLabel: { fontSize: 11, fontWeight: '700', color: c.textSecondary, marginBottom: 10 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 13,
      paddingVertical: 9,
      borderRadius: 99,
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
    },
    chipRect: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
      paddingVertical: 9,
      borderRadius: 16,
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
      flexBasis: '22%',
      flexGrow: 1,
    },
    chipSel: { backgroundColor: c.primarySoft, borderColor: c.primary },
    chipEmoji: { fontSize: 12 },
    chipRectEmoji: { fontSize: 20 },
    chipTx: { fontSize: 11, fontWeight: '600', color: c.textSecondary },
    chipRectTx: { fontSize: 8, fontWeight: '600', color: c.textSecondary, marginTop: 3, textAlign: 'center' },
    chipTxSel: { color: c.primaryDark },
    notesInput: {
      backgroundColor: c.surface,
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: 16,
      padding: 14,
      fontSize: 12,
      color: c.textPrimary,
      minHeight: 80,
    },
    errorTx: { fontSize: 11, color: c.error, fontWeight: '600', marginTop: 4, marginBottom: 12, textAlign: 'center' },
    categoryLabel: {
      fontSize: 9.5,
      fontWeight: '700',
      color: c.textFaint,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 8,
    },
  });
}
