import { View, Pressable, StyleSheet } from 'react-native';
import { useMemo, useState } from 'react';
import { useApp } from '../../shared/store/AppContext.jsx';
import { A } from '../../shared/store/actions.js';
import { useTheme, Text, TextInput, FONT } from '../../shared/styles/index.js';
import BottomSheet from '../../components/ui/BottomSheet.jsx';
import Button from '../../components/ui/Button.jsx';
import * as partnerApi from '../../shared/api/partner.js';
import { loveIcon, loveLine, timeAgo, replyText } from '../../shared/utils/partnerLove.js';
import { useReduceMotion } from '../dashboard/HeroCardFx.jsx';
import { Heart, Beating, BurstHeart, Appear, PressScale } from './PartnerCheckInCard.jsx';
const NOTE_MAX = 120;
const BURST = [
  [-18, -20, 0],
  [18, -22, 60],
  [0, -30, 120],
];
const SENT_BURST = [
  [-44, -20, 0],
  [44, -24, 80],
  [-30, 34, 140],
  [32, 30, 200],
];
function HeartButton({ on, onPress, reduceMotion, c, s }) {
  const [burst, setBurst] = useState(0);
  return (
    <PressScale
      onPress={() => {
        if (!on) setBurst(n => n + 1);
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={on ? 'Take back your heart' : 'Send a heart'}
      accessibilityState={{ selected: on }}
      style={[s.heartBtn, { backgroundColor: on ? c.primarySoft : c.background }]}
    >
      {burst > 0 && !reduceMotion
        ? BURST.map(([x, y, delay], i) => (
            <View key={`${burst}-${i}`} style={s.burstHost}>
              <BurstHeart x={x} y={y} delay={delay} color={[c.primaryLight, c.tertiary, c.primary][i]} />
            </View>
          ))
        : null}
      <Heart size={20} color={on ? c.primary : c.primaryLight} />
    </PressScale>
  );
}
export default function LoveFromPartnerSheet({ open, onClose, items, date, partnerName }) {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const reduceMotion = useReduceMotion();
  const [replying, setReplying] = useState(null);
  const [sent, setSent] = useState(false);
  const [heart, setHeart] = useState(true);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const name = partnerName || 'your partner';
  const quick = state.partnerQuickReplies || [];
  async function save(item, body) {
    const result = await partnerApi.replyToLove(item.id, body, state.accessToken);
    dispatch({ type: A.PARTNER_LOVE_REPLIED, date, id: item.id, replyHeart: result.replyHeart, replyNote: result.replyNote });
  }
  async function toggleHeart(item) {
    if (!item.id) return;
    try {
      await save(item, { heart: !item.replyHeart, note: item.replyNote });
    } catch (e) {
      dispatch({ type: A.SHOW_TOAST, icon: '🌸', text: e.message });
    }
  }
  function startReply(item) {
    setReplying(item);
    setSent(false);
    setHeart(true);
    setNote(item.replyNote || '');
  }
  function backToList() {
    setReplying(null);
    setSent(false);
  }
  function close() {
    backToList();
    onClose();
  }
  const ready = heart || note.trim().length > 0;
  async function send() {
    if (!ready || busy || !replying?.id) return;
    setBusy(true);
    try {
      await save(replying, { heart, note: note.trim() || null });
      setSent(true);
    } catch (e) {
      dispatch({ type: A.SHOW_TOAST, icon: '🌸', text: e.message });
    } finally {
      setBusy(false);
    }
  }
  const title = sent ? 'Sent ♡' : replying ? 'Tell ' + name + ' how it felt' : 'Today from ' + name;
  return (
    <BottomSheet open={open} onClose={close} title={title} closeLabel={replying && !sent ? 'Cancel' : 'Close'} avoidKeyboard>
      {!replying && (
        <View>
          {items.map((item, i) => {
            const reply = replyText(item);
            return (
              <Appear key={item.id || i} delay={i * 60} reduceMotion={reduceMotion}>
                <View style={[s.card, !reply && s.cardFresh]}>
                  <View style={s.row}>
                    <View style={s.icon}>
                      <Text style={s.iconTx}>{loveIcon(item)}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={item.kind === 'text' ? s.itemNote : s.itemTx}>{loveLine(item)}</Text>
                      <Text style={s.time}>{timeAgo(item.sentAt)}</Text>
                    </View>
                    <HeartButton on={item.replyHeart} onPress={() => toggleHeart(item)} reduceMotion={reduceMotion} c={colors} s={s} />
                  </View>
                  {reply ? (
                    <Appear reduceMotion={reduceMotion} style={s.bubbleRow}>
                      <View style={s.bubble}>
                        <Text style={s.bubbleTx}>{item.replyNote ? `“${reply}”` : reply}</Text>
                      </View>
                    </Appear>
                  ) : null}
                  <Pressable onPress={() => startReply(item)} hitSlop={8} style={s.replyLink} accessibilityRole="button">
                    <Text style={s.replyLinkTx}>{item.replyNote ? 'Change your reply' : 'Reply with a note'}</Text>
                  </Pressable>
                </View>
              </Appear>
            );
          })}
        </View>
      )}
      {replying && !sent && (
        <Appear reduceMotion={reduceMotion}>
          <Pressable onPress={backToList} hitSlop={10} style={s.back} accessibilityRole="button">
            <Text style={s.backTx}>‹ Back</Text>
          </Pressable>
          <View style={s.theirs}>
            <Text style={s.theirsName}>{`${name} · ${timeAgo(replying.sentAt)}`}</Text>
            <Text style={s.theirsTx}>{`${loveIcon(replying)} ${loveLine(replying)}`}</Text>
          </View>
          <PressScale
            onPress={() => setHeart(h => !h)}
            accessibilityRole="switch"
            accessibilityState={{ checked: heart }}
            style={[s.heartToggle, heart && { borderColor: colors.primary, backgroundColor: colors.primarySoft }]}
          >
            <Heart size={20} color={heart ? colors.primary : colors.primaryLight} />
            <Text style={s.heartToggleTx}>{heart ? 'Your heart is on it ♡' : 'Add your heart'}</Text>
          </PressScale>
          <View style={s.chips}>
            {quick.map(label => (
              <PressScale
                key={label}
                onPress={() => setNote(label)}
                style={[s.chip, note === label && { borderColor: colors.primary, backgroundColor: colors.primarySoft }]}
              >
                <Text style={s.chipTx}>{label}</Text>
              </PressScale>
            ))}
          </View>
          <TextInput
            value={note}
            onChangeText={v => setNote(v.slice(0, NOTE_MAX))}
            placeholder="It meant a lot that you…"
            placeholderTextColor={colors.textFaint}
            maxLength={NOTE_MAX}
            multiline
            style={s.noteInput}
            accessibilityLabel="Your note"
          />
          <Text style={s.counter}>{`${note.length}/${NOTE_MAX}`}</Text>
          <View style={[s.sendWrap, { opacity: ready ? 1 : 0.6 }]}>
            <Button onPress={send} disabled={busy || !ready}>
              {busy ? 'Sending…' : `Send to ${name} ♡`}
            </Button>
          </View>
        </Appear>
      )}
      {replying && sent && (
        <Appear reduceMotion={reduceMotion} style={{ alignItems: 'center' }}>
          <View style={s.sentHeart}>
            {!reduceMotion &&
              SENT_BURST.map(([x, y, delay], i) => (
                <View key={i} style={s.sentBurstHost}>
                  <BurstHeart x={x} y={y} delay={delay} color={[colors.primaryLight, colors.tertiary, colors.primary][i % 3]} />
                </View>
              ))}
            <Beating reduceMotion={reduceMotion}>
              <View style={s.sentCircle}>
                <Heart size={32} color={colors.primary} />
              </View>
            </Beating>
          </View>
          <Text style={s.sentTitle}>Sent ♡</Text>
          <Text style={s.sentSub}>{`${name} will feel this.`}</Text>
          <View style={{ alignSelf: 'stretch', marginTop: 16, marginBottom: 8 }}>
            <Button onPress={backToList}>Done</Button>
          </View>
        </Appear>
      )}
    </BottomSheet>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    card: {
      marginTop: 10,
      backgroundColor: c.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.border,
      padding: 10,
      paddingBottom: 2,
    },
    cardFresh: { borderColor: c.primarySoftBorder, backgroundColor: c.primarySoft },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    icon: { width: 34, height: 34, borderRadius: 17, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
    iconTx: { fontSize: 17, lineHeight: 22 },
    itemTx: { fontSize: 12, fontWeight: '600', color: c.textPrimary, lineHeight: 16 },
    itemNote: { fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 13.5, lineHeight: 18, color: c.textPrimary },
    time: { fontSize: 9.5, color: c.textSecondary, marginTop: 2 },
    heartBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    burstHost: { position: 'absolute', left: 8, top: 8 },
    bubbleRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
    bubble: {
      maxWidth: '82%',
      backgroundColor: c.primary,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 4,
      paddingVertical: 7,
      paddingHorizontal: 12,
    },
    bubbleTx: { fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 13, color: c.white },
    replyLink: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 2 },
    replyLinkTx: { fontSize: 10.5, fontWeight: '700', color: c.primaryDark },
    back: { alignSelf: 'flex-start', paddingVertical: 6, marginTop: -6, marginBottom: 4 },
    backTx: { fontSize: 12, fontWeight: '700', color: c.primaryDark },
    theirs: {
      alignSelf: 'flex-start',
      maxWidth: '85%',
      backgroundColor: c.background,
      borderWidth: 1,
      borderColor: c.border,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      borderBottomLeftRadius: 4,
      paddingVertical: 9,
      paddingHorizontal: 12,
    },
    theirsName: { fontSize: 9.5, fontWeight: '700', color: c.tertiaryDeep },
    theirsTx: { fontSize: 13, color: c.textPrimary, marginTop: 2 },
    heartToggle: {
      marginTop: 14,
      minHeight: 50,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    heartToggleTx: { fontSize: 12, fontWeight: '700', color: c.primaryDark },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
    chip: {
      borderWidth: 1.5,
      borderColor: c.primarySoftBorder,
      backgroundColor: c.surface,
      borderRadius: 99,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    chipTx: { fontSize: 11, fontWeight: '700', color: c.primaryDark },
    noteInput: {
      marginTop: 12,
      minHeight: 64,
      maxHeight: 110,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.background,
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 10,
      fontFamily: FONT.serif,
      fontStyle: 'italic',
      fontSize: 13.5,
      color: c.textPrimary,
    },
    counter: { fontSize: 9.5, color: c.textSecondary, textAlign: 'right', marginTop: 3 },
    sendWrap: { marginTop: 12, marginBottom: 8 },
    sentHeart: { width: 72, height: 72, marginTop: 6 },
    sentBurstHost: { position: 'absolute', left: 4, top: 4 },
    sentCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
    sentTitle: { fontFamily: FONT.serif, fontSize: 22, lineHeight: 28, color: c.textPrimary, marginTop: 12 },
    sentSub: { fontFamily: FONT.serif, fontStyle: 'italic', fontSize: 14, lineHeight: 20, color: c.textSecondary, marginTop: 2 },
  });
}
