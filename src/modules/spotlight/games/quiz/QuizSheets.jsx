import { View, StyleSheet } from 'react-native';
import BottomSheet from '../../../../components/ui/BottomSheet.jsx';
import { useTheme, Text, FONT } from '../../../../shared/styles/index.js';
import { LockIcon } from '../../../../components/ui/icons.jsx';
import { GradientButton, Icon, Pop, HEART, SPARKLE } from '../../common/motion/effects.jsx';
import { quizColors } from '../../common/style/theme.js';
import { Ghost } from '../../common/ui/Sheets.jsx';
import { freeLevelsText } from '../../common/wording.js';

function Rule({ icon, color, children }) {
  const { colors: c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon d={icon} size={16} color={color} fill={icon === HEART} />
      <Text style={{ flex: 1, fontSize: 11, lineHeight: 17, color: c.textSecondary }}>{children}</Text>
    </View>
  );
}

function Rules({ settings, levelLives }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  if (!settings) return null;
  const rounds = settings.rounds;
  const lives = levelLives || settings.lives;
  const hintCost = settings.hintCost;
  return (
    <View style={{ gap: 10 }}>
      <Rule icon="M4 6h16M4 12h16M4 18h10" color={c.primaryDark}>
        {rounds} quick rounds: is it a myth or a fact?
      </Rule>
      <Rule icon={HEART} color={c.primary}>
        {lives === 1 ? '1 heart. One wrong answer ends the game.' : `${lives} hearts. A wrong answer costs one.`}
      </Rule>
      <Rule icon={SPARKLE} color={q.gold}>
        Stuck? A hint costs {hintCost} SP, free on free levels.
      </Rule>
      <Rule icon="M5 12.5l4.2 4.2L19 7" color={q.green}>
        Finish with a heart left to clear the level.
      </Rule>
    </View>
  );
}

export function InfoSheet({ open, kind, topic, balance, settings, reduceMotion, onClose, onShowMine }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  return (
    <BottomSheet open={open} onClose={onClose}>
      {kind === 'locked' && (
        <>
          <Pop reduceMotion={reduceMotion} trigger={open} style={{ alignItems: 'center' }}>
            <View style={[styles.badge, { backgroundColor: q.goldSoft }]}>
              <LockIcon size={24} color={q.goldDeep} />
            </View>
          </Pop>
          <Text style={[styles.title, { color: c.textPrimary }]}>
            {topic?.name} opens at {topic?.minAge}
          </Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            This topic opens by itself when you turn {topic?.minAge}. Until then, there is plenty more to explore.
          </Text>
          <View style={{ height: 16 }} />
          <GradientButton
            colors={q.button}
            reduceMotion={reduceMotion}
            onPress={onShowMine}
            label={<Text style={styles.btnTx}>Show topics for me</Text>}
          />
          <Ghost label="Got it" onPress={onClose} />
        </>
      )}
      {kind === 'how' && (
        <>
          <Text style={[styles.title, { color: c.textPrimary, marginTop: 0 }]}>How it works</Text>
          <View style={[styles.box, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Rules settings={settings} />
          </View>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            {freeLevelsText(settings?.freeLevels)} Higher levels cost SP to unlock. Challenges never pay SP back.
          </Text>
          <Ghost label="Close" onPress={onClose} />
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  badge: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badgeTx: { fontSize: 26, fontWeight: '800' },
  kicker: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginTop: 14 },
  title: { fontFamily: FONT.serif, fontSize: 26, lineHeight: 32, textAlign: 'center', marginTop: 6 },
  free: {
    alignSelf: 'center',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    overflow: 'hidden',
    marginTop: 8,
  },
  box: { borderWidth: 1.5, borderRadius: 20, padding: 16, marginTop: 16, marginBottom: 14 },
  body: { fontSize: 11.5, lineHeight: 18, textAlign: 'center', marginTop: 8 },
  big: { fontSize: 34, fontWeight: '800', textAlign: 'center', marginTop: 6 },
  fine: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 10, marginBottom: 14 },
  btnTx: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
