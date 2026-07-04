import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import { useRef, useEffect, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { GOALS } from '../../shared/constants/options.js';
import { useTheme } from '../../shared/styles/index.js';
import Button from '../../components/ui/Button.jsx';

function StepDots({ total, current, colors, s }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[s.dot, { width: i === current ? 20 : 8, backgroundColor: i === current ? colors.primary : colors.border }]} />
      ))}
    </View>
  );
}

function Step0({ draft, dispatch, colors, s }) {
  const bobAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bobAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(bobAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View>
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <Animated.View style={{ transform: [{ translateY: bobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }], marginBottom: 20 }}>
          <LinearGradient colors={colors.gradient.primary} style={s.logoMark}>
            <View style={s.logoDrop} />
          </LinearGradient>
        </Animated.View>
        <Text style={s.heroTitle}>Hi there,{'\n'}I'm <Text style={{ color: colors.primary }}>Spot it</Text></Text>
        <Text style={s.heroSub}>Your smart cycle companion.{'\n'}Set up in 3 quick steps.</Text>
      </View>
      <Text style={s.fieldLabel}>What should I call you?</Text>
      <TextInput
        value={draft.name}
        onChangeText={v => dispatch({ type: A.ONBOARD_FIELD, field: 'name', value: v })}
        placeholder="Your name"
        placeholderTextColor={colors.textFaint}
        style={s.input}
        returnKeyType="done"
      />
      <View style={{ marginTop: 10 }}>
        <Button onPress={() => dispatch({ type: A.NEXT_ONBOARD })} disabled={!draft.name.trim()}>
          Let's go →
        </Button>
      </View>
    </View>
  );
}

function Step1({ draft, dispatch, colors, s }) {
  return (
    <View>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Text style={s.stepEmoji}>📅</Text>
        <Text style={s.stepTitle}>When did your last{'\n'}period start?</Text>
        <Text style={s.stepSub}>This helps us calculate your cycle</Text>
      </View>
      <View style={s.dateCard}>
        <Text style={s.dateLabel}>Start date</Text>
        <TextInput
          value={draft.lastPeriod}
          onChangeText={v => dispatch({ type: A.ONBOARD_FIELD, field: 'lastPeriod', value: v })}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textFaint}
          style={s.dateInput}
          keyboardType="numeric"
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <View style={{ flex: 1 }}><Button variant="secondary" onPress={() => dispatch({ type: A.PREV_ONBOARD })}>← Back</Button></View>
        <View style={{ flex: 2 }}><Button onPress={() => dispatch({ type: A.NEXT_ONBOARD })}>Continue →</Button></View>
      </View>
    </View>
  );
}

function Step2({ draft, dispatch, colors, s }) {
  const cl = draft.cycleLength;
  return (
    <View>
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <Text style={s.stepEmoji}>🔄</Text>
        <Text style={s.stepTitle}>How long is your{'\n'}typical cycle?</Text>
        <Text style={s.stepSub}>Average is 28 days</Text>
      </View>
      <View style={s.sliderCard}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text style={[s.bigNum, { color: colors.primary }]}>{cl}<Text style={s.bigNumUnit}> days</Text></Text>
        </View>
        <View style={s.sliderRow}>
          <Pressable onPress={() => cl > 21 && dispatch({ type: A.ONBOARD_FIELD, field: 'cycleLength', value: cl - 1 })} style={s.sliderBtn}>
            <Text style={s.sliderBtnTx}>−</Text>
          </Pressable>
          <View style={s.sliderTrack}>
            <View style={[s.sliderFill, { width: `${((cl - 21) / 14) * 100}%` }]} />
          </View>
          <Pressable onPress={() => cl < 35 && dispatch({ type: A.ONBOARD_FIELD, field: 'cycleLength', value: cl + 1 })} style={s.sliderBtn}>
            <Text style={s.sliderBtnTx}>+</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={s.sliderTick}>21</Text><Text style={s.sliderTick}>28</Text><Text style={s.sliderTick}>35</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <View style={{ flex: 1 }}><Button variant="secondary" onPress={() => dispatch({ type: A.PREV_ONBOARD })}>← Back</Button></View>
        <View style={{ flex: 2 }}><Button onPress={() => dispatch({ type: A.NEXT_ONBOARD })}>Continue →</Button></View>
      </View>
    </View>
  );
}

function Step3({ draft, dispatch, colors, s }) {
  return (
    <View>
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <Text style={s.stepEmoji}>✨</Text>
        <Text style={s.stepTitle}>What brings you{'\n'}to Spot it?</Text>
        <Text style={s.stepSub}>We'll personalise your experience</Text>
      </View>
      <View style={{ gap: 10, marginBottom: 16 }}>
        {GOALS.map(g => {
          const sel = draft.goal === g.id;
          return (
            <Pressable key={g.id} onPress={() => dispatch({ type: A.ONBOARD_FIELD, field: 'goal', value: g.id })} style={[s.goalCard, sel && s.goalCardSel]}>
              <Text style={s.goalIcon}>{g.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.goalLabel, sel && { color: colors.primary }]}>{g.label}</Text>
                <Text style={s.goalDesc}>{g.desc}</Text>
              </View>
              {sel && <Text style={{ color: colors.primary, fontSize: 18 }}>✓</Text>}
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Button variant="secondary" onPress={() => dispatch({ type: A.PREV_ONBOARD })}>← Back</Button></View>
        <View style={{ flex: 2 }}><Button onPress={() => dispatch({ type: A.COMPLETE_ONBOARD })}>Start tracking →</Button></View>
      </View>
    </View>
  );
}

const STEPS = [Step0, Step1, Step2, Step3];

export default function OnboardingScreen() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { onboardStep, onboardDraft } = state;
  const insets = useSafeAreaInsets();
  const StepComp = STEPS[onboardStep] || Step0;

  return (
    <View style={[s.screen, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <StepDots total={STEPS.length} current={onboardStep} colors={colors} s={s} />
        <StepComp draft={onboardDraft} dispatch={dispatch} colors={colors} s={s} />
      </ScrollView>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background, paddingHorizontal: 24 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 36 },
    dot: { height: 8, borderRadius: 99 },
    logoMark: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    logoDrop: { width: 26, height: 35, borderTopLeftRadius: 13, borderTopRightRadius: 13, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, backgroundColor: c.white, transform: [{ rotate: '180deg' }] },
    heroTitle: { fontSize: 32, fontWeight: '800', color: c.textPrimary, textAlign: 'center', lineHeight: 38, letterSpacing: -0.5 },
    heroSub: { fontSize: 15, color: c.textMuted, textAlign: 'center', marginTop: 10, lineHeight: 22 },
    fieldLabel: { fontSize: 13, fontWeight: '700', color: c.textSecondary, marginBottom: 10 },
    input: { borderWidth: 1.5, borderColor: c.border, borderRadius: 16, padding: 14, fontSize: 17, fontWeight: '600', color: c.textPrimary, backgroundColor: c.surface, marginBottom: 8 },
    stepEmoji: { fontSize: 52, marginBottom: 12 },
    stepTitle: { fontSize: 28, fontWeight: '800', color: c.textPrimary, textAlign: 'center', lineHeight: 34, letterSpacing: -0.5 },
    stepSub: { fontSize: 14, color: c.textMuted, marginTop: 8, textAlign: 'center', lineHeight: 20 },
    dateCard: { backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    dateLabel: { fontSize: 14, color: c.textMuted, fontWeight: '600' },
    dateInput: { fontSize: 16, fontWeight: '700', color: c.textPrimary },
    sliderCard: { backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border, borderRadius: 20, padding: 24, marginBottom: 8 },
    sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    sliderTrack: { flex: 1, height: 6, backgroundColor: c.border, borderRadius: 99, overflow: 'hidden' },
    sliderFill: { height: '100%', backgroundColor: c.primary, borderRadius: 99 },
    sliderBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: c.background, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
    sliderBtnTx: { fontSize: 20, color: c.primary, fontWeight: '600' },
    sliderTick: { fontSize: 11, color: c.textDisabled },
    bigNum: { fontSize: 56, fontWeight: '800', letterSpacing: -1 },
    bigNumUnit: { fontSize: 18, color: c.textMuted, fontWeight: '400' },
    goalCard: { backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.border, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
    goalCardSel: { backgroundColor: c.primarySoft, borderColor: c.primary },
    goalIcon: { fontSize: 26 },
    goalLabel: { fontSize: 15, fontWeight: '700', color: c.textPrimary, marginBottom: 2 },
    goalDesc: { fontSize: 12.5, color: c.textMuted },
  });
}
