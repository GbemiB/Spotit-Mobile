import { Modal, View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useMemo, useRef, useState } from 'react';
import { useTheme, Text } from '../../shared/styles/index.js';
import { FONT } from '../../shared/styles/typography.js';
import Button from '../../components/ui/Button.jsx';
import TourPreview from './TourPreview.jsx';
export default function WelcomeTour({ visible, cards, partnerName, onDone }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const scroller = useRef(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const card = cards[index] || cards[0];
  const last = index === cards.length - 1;
  function goTo(next) {
    const target = Math.max(0, Math.min(cards.length - 1, next));
    setIndex(target);
    scroller.current?.scrollTo({ x: target * width, animated: true });
  }
  function onSwipeEnd(e) {
    if (!width) return;
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  }
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone} statusBarTranslucent>
      <View style={s.overlay}>
        <View style={s.card}>
          <View onLayout={e => setWidth(e.nativeEvent.layout.width)}>
            <ScrollView
              ref={scroller}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onSwipeEnd}
              scrollEnabled={width > 0}
            >
              {cards.map((item, i) => (
                <View key={item.key} style={[s.page, { width }]}>
                  <TourPreview key={i === index ? 'shown' : 'waiting'} kind={item.key} partnerName={partnerName} />
                  <Text style={s.title}>{item.title}</Text>
                  <Text style={s.body}>{item.body}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
          <View style={s.footer}>
            <View style={s.side} />
            <View style={s.dots} accessibilityLabel={`Card ${index + 1} of ${cards.length}`}>
              {cards.map((item, i) => (
                <View key={item.key} style={[s.dot, i < index && s.dotDone, i === index && s.dotNow]} />
              ))}
            </View>
            <Pressable onPress={onDone} hitSlop={14} style={s.side} accessibilityRole="button" accessibilityLabel="Skip the tour">
              <Text style={s.skip}>Skip</Text>
            </Pressable>
          </View>
          <View style={s.actions}>
            {index > 0 && (
              <View style={{ flex: 1 }}>
                <Button size="sm" variant="secondary" onPress={() => goTo(index - 1)}>
                  Back
                </Button>
              </View>
            )}
            <View style={{ flex: 2 }}>
              <Button size="sm" onPress={() => (last ? onDone() : goTo(index + 1))}>
                {card.next}
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
function createStyles(c) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: c.overlay, alignItems: 'center', justifyContent: 'center', padding: 28 },
    card: {
      width: '100%',
      maxWidth: 340,
      backgroundColor: c.surface,
      borderRadius: 28,
      padding: 18,
      borderWidth: 1,
      borderColor: c.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.25,
      shadowRadius: 40,
      elevation: 14,
    },
    skip: { fontSize: 11, fontWeight: '600', color: c.textSecondary },
    page: { gap: 6 },
    title: { fontFamily: FONT.serif, fontSize: 22, lineHeight: 28, color: c.textPrimary, marginTop: 6 },
    body: { fontSize: 12, lineHeight: 18, color: c.textSecondary, minHeight: 36 },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
    side: { width: 44, alignItems: 'flex-end' },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.border },
    dotDone: { backgroundColor: c.primaryLight },
    dotNow: { width: 18, backgroundColor: c.primary },
    actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  });
}
