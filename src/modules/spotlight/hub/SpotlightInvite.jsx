import { Modal, View, StyleSheet } from 'react-native';
import { useTheme, Text, FONT } from '../../../shared/styles/index.js';
import { GradientButton, PressScale, Icon, Pop, Twinkle, SPARKLE, HEART } from '../common/motion/effects.jsx';
import { quizColors } from '../common/style/theme.js';
import { freeLevelsText } from '../common/wording.js';

export default function SpotlightInvite({ visible, balance, pick, freeLevels, reduceMotion, onPlay, onLater }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={[styles.overlay, { backgroundColor: c.overlay }]}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border, shadowColor: q.shadow }]}>
          <Pop reduceMotion={reduceMotion} trigger={visible} style={{ alignItems: 'center' }}>
            <View style={[styles.badge, { backgroundColor: c.primarySoft }]}>
              <Icon d={SPARKLE} size={28} color={c.primary} fill />
              <Twinkle size={9} color={q.gold} reduceMotion={reduceMotion} style={{ position: 'absolute', top: 8, right: 8 }} />
              <Twinkle
                size={7}
                color={q.peach}
                delay={600}
                reduceMotion={reduceMotion}
                style={{ position: 'absolute', bottom: 10, left: 9 }}
              />
            </View>
          </Pop>
          <Text style={[styles.kicker, { color: q.gold }]}>Spotlight</Text>
          <Text style={[styles.title, { color: c.textPrimary }]}>
            Use your SP points to try some <Text style={{ color: c.primary }}>challenges</Text>
          </Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            Quick myth-or-fact rounds on women’s health. {freeLevelsText(freeLevels)}
          </Text>
          <View style={[styles.box, { backgroundColor: c.background, borderColor: c.border }]}>
            {pick && (
              <View style={styles.row}>
                <Icon d={HEART} size={14} color={c.primary} fill />
                <Text style={[styles.rowTx, { color: c.textPrimary }]} numberOfLines={1}>
                  Today’s pick: {pick.topic.name} · Level {pick.level.n}
                </Text>
                <Text
                  style={[styles.tag, { color: pick.free ? q.green : q.goldDeep, backgroundColor: pick.free ? q.greenSoft : q.goldSoft }]}
                >
                  {pick.free ? 'Free' : `${pick.level.cost} SP`}
                </Text>
              </View>
            )}
            <View style={styles.row}>
              <Icon d={SPARKLE} size={14} color={q.gold} fill />
              <Text style={[styles.rowTx, { color: c.textPrimary }]}>You have {balance.toLocaleString()} SP</Text>
            </View>
          </View>
          <GradientButton
            colors={q.button}
            reduceMotion={reduceMotion}
            onPress={onPlay}
            style={{ alignSelf: 'stretch' }}
            label={<Text style={styles.btnTx}>Let’s play</Text>}
            icon={<Icon d="M5 12h13M13 6l6 6-6 6" size={14} color="#FFFFFF" width={2.2} />}
          />
          <PressScale onPress={onLater} accessibilityLabel="Maybe later">
            <View style={styles.later}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: c.textMuted }}>Maybe later</Text>
            </View>
          </PressScale>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingTop: 26,
    paddingHorizontal: 22,
    paddingBottom: 8,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 34,
    elevation: 12,
  },
  badge: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  kicker: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginTop: 14 },
  title: { fontFamily: FONT.serif, fontSize: 24, lineHeight: 30, textAlign: 'center', marginTop: 6 },
  body: { fontSize: 11.5, lineHeight: 18, textAlign: 'center', marginTop: 8 },
  box: {
    alignSelf: 'stretch',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 16,
    marginBottom: 16,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7 },
  rowTx: { flex: 1, fontSize: 11.5, fontWeight: '600' },
  tag: { fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, overflow: 'hidden' },
  btnTx: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  later: { height: 46, alignItems: 'center', justifyContent: 'center' },
});
