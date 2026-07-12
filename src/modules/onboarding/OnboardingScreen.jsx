import { View, Pressable, ScrollView, ActivityIndicator, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useState, useMemo, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { GOALS } from '../../shared/constants/options.js';
import { MONTHS, DAYS_SHORT } from '../../shared/constants/cycle.js';
import { daysInMonth } from '../../shared/utils/cycle.js';
import { useTheme, Text } from '../../shared/styles/index.js';
import { CalendarIcon } from '../../components/ui/icons.jsx';
import * as onboardingApi from '../../shared/api/onboarding.js';

// Icons aren't part of the backend's goal template (that's presentation, not data) —
// map the returned goal ids back to the emoji GOALS already defines locally.
const GOAL_ICONS = Object.fromEntries(GOALS.map(g => [g.id, g.icon]));

const MIN_AGE_YEARS = 13;
const MAX_AGE_YEARS = 100;

function dateToISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateDisplay(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Custom month-grid picker (same approach as the app's own CalendarGrid.jsx) instead of
// the native OS picker — neither iOS nor Android exposes a font API for their native date
// pickers, so getting the calendar text to a specific size/weight requires drawing it ourselves.
function CalendarDatePicker({ value, maximumDate, minimumDate, onSelect, colors, s }) {
  const initial = value ? new Date(value) : maximumDate;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const min = startOfDay(minimumDate);
  const max = startOfDay(maximumDate);
  const selected = value ? startOfDay(new Date(value)) : null;

  const first = new Date(viewYear, viewMonth, 1).getDay();
  const count = daysInMonth(viewYear, viewMonth);
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= count; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  const atMinMonth = viewYear === min.getFullYear() && viewMonth === min.getMonth();
  const atMaxMonth = viewYear === max.getFullYear() && viewMonth === max.getMonth();

  function prevMonth() {
    if (atMinMonth) return;
    let m = viewMonth - 1, y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    setViewMonth(m); setViewYear(y);
  }
  function nextMonth() {
    if (atMaxMonth) return;
    let m = viewMonth + 1, y = viewYear;
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m); setViewYear(y);
  }

  return (
    <View style={s.pickerCard}>
      <View style={s.pickerHeader}>
        <Pressable onPress={prevMonth} disabled={atMinMonth} hitSlop={8} style={{ opacity: atMinMonth ? 0.3 : 1 }}>
          <Text style={s.pickerNav}>‹</Text>
        </Pressable>
        <Text style={s.pickerTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
        <Pressable onPress={nextMonth} disabled={atMaxMonth} hitSlop={8} style={{ opacity: atMaxMonth ? 0.3 : 1 }}>
          <Text style={s.pickerNav}>›</Text>
        </Pressable>
      </View>
      <View style={s.pickerDow}>
        {DAYS_SHORT.map((x, i) => <Text key={i} style={s.pickerDowTx}>{x}</Text>)}
      </View>
      <View style={s.pickerGrid}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={s.pickerCell} />;
          const date = startOfDay(new Date(viewYear, viewMonth, d));
          const disabled = date < min || date > max;
          const isSel = !!selected && isSameDay(date, selected);
          return (
            <Pressable key={i} disabled={disabled} onPress={() => onSelect(date)} style={s.pickerCell}>
              <View style={[s.pickerDayCircle, isSel && { backgroundColor: colors.primary }]}>
                <Text style={[s.pickerDayTx, isSel && { color: colors.white }, disabled && { color: colors.authLabel }]}>
                  {d}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function StepDots({ total, current, colors, s }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[s.dot, { width: i === current ? 20 : 8, backgroundColor: i === current ? colors.primary : colors.authBorder }]} />
      ))}
    </View>
  );
}

// Shared by both date fields in AboutYouStep (DOB and last period) — one calendar-picker
// pattern instead of a free-text date input, so day/month/year can't go out of range.
function DateField({ value, placeholder, onChange, maximumDate, minimumDate, colors, s }) {
  const [show, setShow] = useState(false);

  function handleSelect(date) {
    onChange(dateToISO(date));
    setShow(false);
  }

  return (
    <View>
      <Pressable onPress={() => setShow(v => !v)} style={s.dateField}>
        <CalendarIcon size={16} />
        <Text style={[s.dateFieldTx, !value && { color: colors.authLabel }]}>
          {value ? formatDateDisplay(value) : placeholder}
        </Text>
      </Pressable>
      {show && (
        <CalendarDatePicker
          value={value}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onSelect={handleSelect}
          colors={colors}
          s={s}
        />
      )}
    </View>
  );
}

function AboutYouStep({ draft, dispatch, colors, s }) {
  const today = new Date();
  const maxDob = new Date(today.getFullYear() - MIN_AGE_YEARS, today.getMonth(), today.getDate());
  const minDob = new Date(today.getFullYear() - MAX_AGE_YEARS, today.getMonth(), today.getDate());
  const minLastPeriod = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
  const dobComplete = !!draft.dob;

  return (
    <View>
      <Text style={s.eyebrow}>STEP 1 OF 3</Text>
      <Text style={s.stepTitle}>A little about you</Text>
      <Text style={s.stepSub}>This helps us personalize your predictions from day one.</Text>

      <Text style={[s.fieldLabel, { marginTop: 22 }]}>Date of birth</Text>
      <DateField
        value={draft.dob}
        placeholder="Select your date of birth"
        onChange={v => dispatch({ type: A.ONBOARD_FIELD, field: 'dob', value: v })}
        maximumDate={maxDob}
        minimumDate={minDob}
        colors={colors}
        s={s}
      />
      <Text style={s.fieldHint}>You must be at least {MIN_AGE_YEARS} to use Spot it.</Text>

      <Text style={s.fieldLabel}>Last menstrual period</Text>
      <DateField
        value={draft.lastPeriod}
        placeholder="Select your last period date"
        onChange={v => dispatch({ type: A.ONBOARD_FIELD, field: 'lastPeriod', value: v })}
        maximumDate={today}
        minimumDate={minLastPeriod}
        colors={colors}
        s={s}
      />
      <Text style={s.fieldHint}>If you remember the first day of your last period, add it — otherwise skip and we'll estimate as you log.</Text>
      <Pressable onPress={() => dispatch({ type: A.ONBOARD_FIELD, field: 'lastPeriod', value: '' })}>
        <Text style={s.skipTx}>I don't remember</Text>
      </Pressable>

      <Pressable disabled={!dobComplete} onPress={() => dispatch({ type: A.NEXT_ONBOARD })} style={{ marginTop: 24, opacity: dobComplete ? 1 : 0.5 }}>
        <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
          <Text style={s.ctaTx}>Continue</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

function LengthStepper({ label, hint, value, min, max, onChange, s }) {
  return (
    <View style={s.stepperRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.stepperLabel}>{label}</Text>
        <Text style={s.stepperHint}>{hint}</Text>
      </View>
      <View style={s.stepperCtrl}>
        <Pressable onPress={() => value > min && onChange(value - 1)} style={s.stepBtnCtrl}>
          <Text style={s.stepBtnTx}>−</Text>
        </Pressable>
        <Text style={s.stepVal}>{value}</Text>
        <Pressable onPress={() => value < max && onChange(value + 1)} style={s.stepBtnCtrl}>
          <Text style={s.stepBtnTx}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CycleStep({ draft, dispatch, colors, s }) {
  return (
    <View>
      <Text style={s.eyebrow}>STEP 2 OF 3</Text>
      <Text style={s.stepTitle}>Your cycle basics</Text>
      <Text style={s.stepSub}>Rough numbers are fine — we'll refine these as you log.</Text>

      <View style={{ marginTop: 22, gap: 12 }}>
        <LengthStepper
          label="Cycle length" hint="Days between periods"
          value={draft.cycleLength} min={21} max={45}
          onChange={v => dispatch({ type: A.ONBOARD_FIELD, field: 'cycleLength', value: v })}
          s={s}
        />
        <LengthStepper
          label="Period length" hint="Days of bleeding"
          value={draft.periodLength} min={2} max={10}
          onChange={v => dispatch({ type: A.ONBOARD_FIELD, field: 'periodLength', value: v })}
          s={s}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
        <Pressable onPress={() => dispatch({ type: A.PREV_ONBOARD })} style={s.backBtn}>
          <Text style={s.backBtnTx}>← Back</Text>
        </Pressable>
        <Pressable onPress={() => dispatch({ type: A.NEXT_ONBOARD })} style={{ flex: 2 }}>
          <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
            <Text style={s.ctaTx}>Continue</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function GoalsStep({ draft, dispatch, colors, s, goals, loading, error, onComplete }) {
  return (
    <View>
      <Text style={s.eyebrow}>STEP 3 OF 3</Text>
      <Text style={s.stepTitle}>What brings you to Spot it?</Text>
      <Text style={s.stepSub}>We'll personalise your experience</Text>

      <View style={{ gap: 10, marginTop: 22, marginBottom: 8 }}>
        {goals.map(g => {
          const sel = draft.goal === g.id;
          return (
            <Pressable key={g.id} onPress={() => dispatch({ type: A.ONBOARD_FIELD, field: 'goal', value: g.id })} style={[s.goalCard, sel && s.goalCardSel]}>
              <Text style={s.goalIcon}>{GOAL_ICONS[g.id] || '🌸'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.goalLabel, sel && { color: colors.primaryDark }]}>{g.label}</Text>
                <Text style={s.goalDesc}>{g.description}</Text>
              </View>
              {sel && <Text style={{ color: colors.primaryDark, fontSize: 18 }}>✓</Text>}
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={s.errorTx}>{error}</Text> : null}

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <Pressable onPress={() => dispatch({ type: A.PREV_ONBOARD })} style={s.backBtn}>
          <Text style={s.backBtnTx}>← Back</Text>
        </Pressable>
        <Pressable disabled={loading} onPress={onComplete} style={{ flex: 2, opacity: loading ? 0.6 : 1 }}>
          <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.ctaTx}>Start tracking →</Text>}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const STEPS = [AboutYouStep, CycleStep, GoalsStep];

export default function OnboardingScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { onboardStep, onboardDraft } = state;
  const insets = useSafeAreaInsets();
  const StepComp = STEPS[onboardStep] || STEPS[0];

  const [goals, setGoals] = useState(GOALS.map(g => ({ id: g.id, label: g.label, description: g.desc })));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // The goals template is what the UI calls first to render the goals step —
  // falls back to the local GOALS constant if the request fails so onboarding never blocks.
  useEffect(() => {
    onboardingApi.getTemplate(state.accessToken)
      .then(data => { if (data?.goals?.length) setGoals(data.goals); })
      .catch(() => {});
  }, []);

  async function handleComplete() {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const data = await onboardingApi.completeOnboarding({
        dob: onboardDraft.dob,
        lastPeriodDate: onboardDraft.lastPeriod,
        goal: onboardDraft.goal,
        cycleLength: onboardDraft.cycleLength,
        periodLength: onboardDraft.periodLength,
      }, state.accessToken);
      dispatch({ type: A.COMPLETE_ONBOARD, goal: data.goal, cycleLength: data.cycleLength, periodLength: data.periodLength });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={colors.authGradient} start={{ x: 0, y: 0 }} end={{ x: 0.35, y: 1 }} style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24, paddingHorizontal: 26 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}>
            {/* Progress (onboardStep/onboardDraft) is persisted, so closing here and logging
                back in later resumes exactly where the user left off. */}
            <Pressable onPress={() => dispatch({ type: A.LOGOUT })} hitSlop={10} style={s.closeBtn}>
              <Text style={s.closeBtnTx}>✕</Text>
            </Pressable>
          </View>
          <StepDots total={STEPS.length} current={onboardStep} colors={colors} s={s} />
          <StepComp draft={onboardDraft} dispatch={dispatch} colors={colors} s={s} goals={goals} loading={loading} error={error} onComplete={handleComplete} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 28 },
    dot: { height: 8, borderRadius: 99 },
    eyebrow: { fontSize: 9.5, letterSpacing: 1.2, color: c.authHeading, textTransform: 'uppercase', fontWeight: '700' },
    stepTitle: { fontSize: 23, fontWeight: '600', letterSpacing: -0.2, color: c.authHeading, marginTop: 8 },
    stepSub: { fontSize: 12, color: c.authBody, marginTop: 6, lineHeight: 18 },
    fieldLabel: { fontSize: 10, letterSpacing: 1, color: c.authLabel, textTransform: 'uppercase', fontWeight: '700', marginBottom: 8 },
    fieldHint: { fontSize: 11.5, color: c.authBody, marginBottom: 10, lineHeight: 16 },
    dateField: { height: 48, borderRadius: 12, backgroundColor: c.authInputBg, borderWidth: 1, borderColor: c.authInputBorder, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10, marginBottom: 8 },
    dateFieldTx: { fontSize: 12, fontWeight: '400', color: c.authHeading },
    pickerCard: { backgroundColor: c.authInputBg, borderWidth: 1, borderColor: c.authInputBorder, borderRadius: 16, padding: 14, marginBottom: 8 },
    pickerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
    pickerNav: { fontSize: 14, fontWeight: '400', color: c.authHeading, paddingHorizontal: 8 },
    pickerTitle: { fontSize: 12, fontWeight: '400', color: c.authHeading },
    pickerDow: { flexDirection: 'row', marginBottom: 4 },
    pickerDowTx: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '400', color: c.authLabel },
    pickerGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    pickerCell: { width: '14.28%', paddingVertical: 2, alignItems: 'center' },
    pickerDayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    pickerDayTx: { fontSize: 12, fontWeight: '400', color: c.authHeading },
    closeBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    closeBtnTx: { fontSize: 15, color: c.authBody, fontWeight: '600' },
    skipTx: { textAlign: 'center', fontSize: 12, fontWeight: '600', color: c.authBody, marginBottom: 8 },
    errorTx: { fontSize: 11, color: c.error, fontWeight: '600', marginTop: 4, marginBottom: 8, textAlign: 'center' },
    cta: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    ctaTx: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, color: '#fff' },
    backBtn: { flex: 1, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: c.authInputBg, borderWidth: 1, borderColor: c.authInputBorder },
    backBtnTx: { fontSize: 13, fontWeight: '600', color: c.authHeading },
    goalCard: { backgroundColor: c.authInputBg, borderWidth: 1.5, borderColor: c.authInputBorder, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
    goalCardSel: { backgroundColor: c.primarySoft, borderColor: c.primary },
    goalIcon: { fontSize: 24 },
    goalLabel: { fontSize: 13, fontWeight: '700', color: c.authHeading, marginBottom: 2 },
    goalDesc: { fontSize: 10.5, color: c.authBody },
    stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: c.authInputBg, borderWidth: 1, borderColor: c.authInputBorder, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16 },
    stepperLabel: { fontSize: 12, fontWeight: '400', color: c.authHeading },
    stepperHint: { fontSize: 11, color: c.authBody, marginTop: 2 },
    stepperCtrl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: c.authBorder, borderRadius: 12, overflow: 'hidden' },
    stepBtnCtrl: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    stepBtnTx: { fontSize: 17, color: c.primary, fontWeight: '600', lineHeight: 22 },
    stepVal: { fontSize: 12, fontWeight: '400', color: c.authHeading, paddingHorizontal: 10 },
  });
}
