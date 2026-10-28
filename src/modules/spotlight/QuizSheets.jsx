import { View, StyleSheet } from 'react-native';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
import { useTheme, Text, FONT } from '../../shared/styles/index.js';
import { LockIcon } from '../../components/ui/icons.jsx';
import { GradientButton, PressScale, Icon, Pop, HEART, SPARKLE } from './SpotlightFx.jsx';
import { quizColors } from './quizTheme.js';
import { HINT_COST, POINT_PACKS } from './sampleQuiz.js';

function Ghost({ label, onPress }) {
  const { colors: c } = useTheme();
  return (
    <PressScale onPress={onPress} accessibilityLabel={label}>
      <View style={{ height: 46, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: c.textMuted }}>{label}</Text>
      </View>
    </PressScale>
  );
}

function Rule({ icon, color, children }) {
  const { colors: c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon d={icon} size={16} color={color} fill={icon === HEART} />
      <Text style={{ flex: 1, fontSize: 11, lineHeight: 17, color: c.textSecondary }}>{children}</Text>
    </View>
  );
}

function Rules() {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  return (
    <View style={{ gap: 10 }}>
      <Rule icon="M4 6h16M4 12h16M4 18h10" color={c.primaryDark}>
        5 quick rounds: is it a myth or a fact?
      </Rule>
      <Rule icon={HEART} color={c.primary}>
        3 hearts. A wrong answer costs one.
      </Rule>
      <Rule icon={SPARKLE} color={q.gold}>
        Stuck? A hint costs {HINT_COST} SP.
      </Rule>
      <Rule icon="M5 12.5l4.2 4.2L19 7" color={q.green}>
        Finish with a heart left to clear the level.
      </Rule>
    </View>
  );
}

function Row({ label, value, strong }) {
  const { colors: c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ fontSize: 11.5, color: c.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 12, fontWeight: strong ? '800' : '700', color: c.textPrimary }}>{value}</Text>
    </View>
  );
}

function Packs({ need }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  return (
    <View style={{ gap: 10 }}>
      {POINT_PACKS.map((p, i) => (
        <View
          key={p.id}
          style={[
            styles.pack,
            { backgroundColor: c.surface, borderColor: i === 0 ? c.primaryDark : c.border, borderWidth: i === 0 ? 2 : 1.5 },
          ]}
        >
          <View style={[styles.packIcon, { backgroundColor: q.goldSoft }]}>
            <Icon d="M12 7.6l1.3 2.8 3 .3-2.3 2 .7 2.9-2.7-1.6-2.7 1.6.7-2.9-2.3-2 3-.3z" size={18} color={q.gold} fill />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: c.textPrimary }}>{p.sp} SP</Text>
            {p.bonus > 0 && <Text style={{ fontSize: 10, fontWeight: '600', color: q.green }}>+{p.bonus} bonus</Text>}
          </View>
          <Text style={{ fontSize: 12, fontWeight: '700', color: c.textSecondary }}>{p.price}</Text>
        </View>
      ))}
      {need > 0 && <Text style={{ fontSize: 10, color: c.textMuted, textAlign: 'center' }}>Any pack covers the {need} SP you need.</Text>}
    </View>
  );
}

export function LevelSheet({ open, mode, level, topic, balance, reduceMotion, onClose, onStart }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  if (!level || !topic) return <BottomSheet open={false} onClose={onClose} />;
  const need = Math.max(0, level.cost - balance);
  const replay = level.state === 'cleared';
  return (
    <BottomSheet open={open} onClose={onClose}>
      <Pop reduceMotion={reduceMotion} trigger={open} style={{ alignItems: 'center' }}>
        <View style={[styles.badge, { backgroundColor: mode === 'short' ? q.goldSoft : c.primarySoft }]}>
          {mode === 'short' ? (
            <LockIcon size={24} color={q.goldDeep} />
          ) : (
            <Text style={[styles.badgeTx, { color: c.primaryDark }]}>{level.n}</Text>
          )}
        </View>
      </Pop>
      <Text style={[styles.kicker, { color: q.gold }]}>
        {topic.name} · Level {level.n}
      </Text>
      <Text style={[styles.title, { color: c.textPrimary }]}>{mode === 'short' ? `You need ${need} more SP` : level.name}</Text>
      {mode === 'start' && (
        <>
          <Text style={[styles.free, { color: q.green, backgroundColor: q.greenSoft }]}>{replay ? 'Replay · free' : 'Free level'}</Text>
          <View style={[styles.box, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Rules />
          </View>
          <GradientButton colors={q.button} reduceMotion={reduceMotion} onPress={onStart} label={<Text style={styles.btnTx}>Start</Text>} />
        </>
      )}
      {mode === 'unlock' && (
        <>
          <View style={[styles.box, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Row label="Unlock cost" value={`${level.cost} SP`} />
            <Row label="Your balance" value={`${balance} SP`} />
            <View style={{ height: 1, backgroundColor: c.border, marginVertical: 4 }} />
            <Row label="After unlocking" value={`${balance - level.cost} SP`} strong />
          </View>
          <Text style={[styles.fine, { color: c.textMuted }]}>SP is taken when the level starts. Playing it again costs again.</Text>
          <GradientButton
            colors={q.button}
            reduceMotion={reduceMotion}
            onPress={onStart}
            label={<Text style={styles.btnTx}>Unlock for {level.cost} SP</Text>}
          />
        </>
      )}
      {mode === 'short' && (
        <>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            {level.name} costs {level.cost} SP and you have {balance}. Keep logging and checking in to earn more, or top up with a pack.
          </Text>
          <View style={{ marginTop: 14 }}>
            <Packs need={need} />
          </View>
          <Text style={[styles.fine, { color: c.textMuted }]}>Points packs are coming soon. Bought SP is for challenges only.</Text>
          <GradientButton
            disabled
            colors={q.goldButton}
            reduceMotion={reduceMotion}
            label={<Text style={styles.btnTx}>Buy with Google Play</Text>}
          />
        </>
      )}
      <Ghost label={mode === 'short' ? 'Earn SP for free' : 'Not now'} onPress={onClose} />
    </BottomSheet>
  );
}

export function InfoSheet({ open, kind, topic, balance, reduceMotion, onClose, onShowMine }) {
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
          <Text style={[styles.title, { color: c.textPrimary }]}>{topic?.name} opens at 18</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            This topic is for adults. It opens by itself on your 18th birthday. Until then, there is plenty more to explore.
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
            <Rules />
          </View>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            Levels 1 to 3 of every topic are free. Higher levels cost SP to unlock. Challenges never pay SP back.
          </Text>
          <Ghost label="Close" onPress={onClose} />
        </>
      )}
      {kind === 'points' && (
        <>
          <Text style={[styles.title, { color: c.textPrimary, marginTop: 0 }]}>Your SpotPoints</Text>
          <Text style={[styles.big, { color: c.textPrimary }]}>{balance.toLocaleString()} SP</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            Earn SP by logging, checking in and tracking your mood. Spend it on higher levels and hints.
          </Text>
          <View style={{ marginTop: 14 }}>
            <Packs need={0} />
          </View>
          <Text style={[styles.fine, { color: c.textMuted }]}>Points packs are coming soon.</Text>
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
  pack: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18 },
  packIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
