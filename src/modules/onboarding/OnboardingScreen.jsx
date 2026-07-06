import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useState, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { GOALS } from '../../shared/constants/options.js';
import { useTheme, Text, TextInput } from '../../shared/styles/index.js';
import { CalendarIcon } from '../../components/ui/icons.jsx';

function StepDots({ total, current, colors, s }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[s.dot, { width: i === current ? 20 : 8, backgroundColor: i === current ? colors.primary : colors.authBorder }]} />
      ))}
    </View>
  );
}

function AboutYouStep({ draft, dispatch, colors, s }) {
  const [dd, mm, yyyy] = (draft.dob || '').split('-').reverse().concat(['', '', '']).slice(0, 3);
  // dob stored as YYYY-MM-DD; parts derived above as [dd, mm, yyyy] display order

  function updateDob(part, value) {
    const clean = value.replace(/[^0-9]/g, '');
    const parts = { dd, mm, yyyy, [part]: clean };
    const nextDob = (parts.dd || parts.mm || parts.yyyy) ? `${parts.yyyy}-${parts.mm}-${parts.dd}` : '';
    dispatch({ type: A.ONBOARD_FIELD, field: 'dob', value: nextDob });
  }

  const dobComplete = dd?.length === 2 && mm?.length === 2 && yyyy?.length === 4;

  return (
    <View>
      <Text style={s.eyebrow}>STEP 1 OF 2</Text>
      <Text style={s.stepTitle}>A little about you</Text>
      <Text style={s.stepSub}>This helps us personalize your predictions from day one.</Text>

      <Text style={[s.fieldLabel, { marginTop: 22 }]}>Date of birth</Text>
      <View style={s.dobRow}>
        <TextInput value={dd} onChangeText={v => updateDob('dd', v)} placeholder="DD" placeholderTextColor={colors.authLabel} keyboardType="number-pad" maxLength={2} style={[s.dobBox, { flex: 1 }]} />
        <TextInput value={mm} onChangeText={v => updateDob('mm', v)} placeholder="MM" placeholderTextColor={colors.authLabel} keyboardType="number-pad" maxLength={2} style={[s.dobBox, { flex: 1 }]} />
        <TextInput value={yyyy} onChangeText={v => updateDob('yyyy', v)} placeholder="YYYY" placeholderTextColor={colors.authLabel} keyboardType="number-pad" maxLength={4} style={[s.dobBox, { flex: 1.4 }]} />
      </View>

      <Text style={s.fieldLabel}>Last menstrual period</Text>
      <Text style={s.fieldHint}>If you remember the first day of your last period, add it — otherwise skip and we'll estimate as you log.</Text>
      <View style={s.lmpRow}>
        <CalendarIcon size={16} />
        <TextInput
          value={draft.lastPeriod}
          onChangeText={v => dispatch({ type: A.ONBOARD_FIELD, field: 'lastPeriod', value: v })}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.authLabel}
          keyboardType="numeric"
          style={s.lmpInput}
        />
      </View>
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

function GoalsStep({ draft, dispatch, colors, s }) {
  return (
    <View>
      <Text style={s.eyebrow}>STEP 2 OF 2</Text>
      <Text style={s.stepTitle}>What brings you to Spot it?</Text>
      <Text style={s.stepSub}>We'll personalise your experience</Text>

      <View style={{ gap: 10, marginTop: 22, marginBottom: 8 }}>
        {GOALS.map(g => {
          const sel = draft.goal === g.id;
          return (
            <Pressable key={g.id} onPress={() => dispatch({ type: A.ONBOARD_FIELD, field: 'goal', value: g.id })} style={[s.goalCard, sel && s.goalCardSel]}>
              <Text style={s.goalIcon}>{g.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.goalLabel, sel && { color: colors.primaryDark }]}>{g.label}</Text>
                <Text style={s.goalDesc}>{g.desc}</Text>
              </View>
              {sel && <Text style={{ color: colors.primaryDark, fontSize: 18 }}>✓</Text>}
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <Pressable onPress={() => dispatch({ type: A.PREV_ONBOARD })} style={s.backBtn}>
          <Text style={s.backBtnTx}>← Back</Text>
        </Pressable>
        <Pressable onPress={() => dispatch({ type: A.COMPLETE_ONBOARD })} style={{ flex: 2 }}>
          <LinearGradient colors={colors.authGradientCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.cta}>
            <Text style={s.ctaTx}>Start tracking →</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const STEPS = [AboutYouStep, GoalsStep];

export default function OnboardingScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { onboardStep, onboardDraft } = state;
  const insets = useSafeAreaInsets();
  const StepComp = STEPS[onboardStep] || STEPS[0];

  return (
    <LinearGradient colors={colors.authGradient} start={{ x: 0, y: 0 }} end={{ x: 0.35, y: 1 }} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24, paddingHorizontal: 26 }}
        keyboardShouldPersistTaps="handled"
      >
        <StepDots total={STEPS.length} current={onboardStep} colors={colors} s={s} />
        <StepComp draft={onboardDraft} dispatch={dispatch} colors={colors} s={s} />
      </ScrollView>
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
    dobRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
    dobBox: { height: 48, borderRadius: 12, backgroundColor: c.authInputBg, borderWidth: 1, borderColor: c.authInputBorder, textAlign: 'center', fontSize: 14, fontWeight: '600', color: c.authHeading },
    lmpRow: { height: 48, borderRadius: 12, backgroundColor: c.authInputBg, borderWidth: 1, borderColor: c.authInputBorder, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10, marginBottom: 12 },
    lmpInput: { flex: 1, fontSize: 13.5, color: c.authHeading },
    skipTx: { textAlign: 'center', fontSize: 12, fontWeight: '600', color: c.authBody, marginBottom: 8 },
    cta: { height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    ctaTx: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, color: '#fff' },
    backBtn: { flex: 1, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: c.authInputBg, borderWidth: 1, borderColor: c.authInputBorder },
    backBtnTx: { fontSize: 13, fontWeight: '600', color: c.authHeading },
    goalCard: { backgroundColor: c.authInputBg, borderWidth: 1.5, borderColor: c.authInputBorder, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
    goalCardSel: { backgroundColor: c.primarySoft, borderColor: c.primary },
    goalIcon: { fontSize: 26 },
    goalLabel: { fontSize: 15, fontWeight: '700', color: c.authHeading, marginBottom: 2 },
    goalDesc: { fontSize: 12.5, color: c.authBody },
  });
}
