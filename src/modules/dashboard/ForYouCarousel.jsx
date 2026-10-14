import { View, ScrollView, Pressable, Image, Animated, Easing, StyleSheet } from 'react-native';
import { useMemo, useEffect, useState } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme, Text } from '../../shared/styles/index.js';
import { useAnimatedValue, useReduceMotion } from './HeroCardFx.jsx';

const CARD_W = 220;
const IMAGE_H = 124;
const GAP = 12;
const SIDE = 24;

const TAG_ICONS = {
  Education: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5',
  Nutrition: 'M12 21c-4.4 0-8-3.6-8-8 0-5 4-9 9-9 2 0 4 .5 6 2-1.5 2-2 4-2 6 0 5-2 9-5 9zM12 21c0-5 1-9 5-13',
  Health: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
  Fitness: 'M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11',
  Wellness: 'M12 3c1 3.5 4 5 4 9a4 4 0 0 1-8 0c0-4 3-5.5 4-9zM5 14c2 0 4 1 5 3M19 14c-2 0-4 1-5 3',
  Mindfulness: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
  Tips: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z',
  Sponsored: 'M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z',
};
const SPARKLE = 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6';

function TagIcon({ tag, color, size = 12 }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d={TAG_ICONS[tag] || SPARKLE} />
    </Svg>
  );
}

function readMinutes(body) {
  const words = (body || '').replace(/\*\*/g, '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function FeedCard({ card, index, onPress, colors, s, reduceMotion }) {
  const enter = useAnimatedValue(reduceMotion ? 1 : 0);
  const zoom = useAnimatedValue(0);
  const press = useAnimatedValue(1);
  useEffect(() => {
    if (reduceMotion) {
      enter.setValue(1);
      return undefined;
    }
    const intro = Animated.timing(enter, {
      toValue: 1,
      duration: 800,
      delay: 900 + index * 150,
      easing: Easing.out(Easing.back(1.3)),
      useNativeDriver: true,
    });
    const drift = Animated.loop(
      Animated.sequence([
        Animated.timing(zoom, { toValue: 1, duration: 7000 + index * 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(zoom, { toValue: 0, duration: 7000 + index * 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    intro.start();
    drift.start();
    return () => {
      intro.stop();
      drift.stop();
    };
  }, [reduceMotion, index, enter, zoom]);
  const pressTo = toValue => Animated.spring(press, { toValue, speed: 40, bounciness: 8, useNativeDriver: true }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => pressTo(0.96)}
      onPressOut={() => pressTo(1)}
      accessibilityRole="button"
      accessibilityLabel={`${card.tag}: ${card.title}`}
    >
      <Animated.View
        style={[
          s.card,
          {
            opacity: enter,
            transform: [
              { translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [120, 0] }) },
              { rotate: enter.interpolate({ inputRange: [0, 1], outputRange: ['6deg', '0deg'] }) },
              { scale: press },
            ],
          },
        ]}
      >
        <View style={s.imageWrap}>
          <Animated.View style={{ transform: [{ scale: zoom.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] }}>
            <Image source={card.imageSource} style={s.image} resizeMode="cover" />
          </Animated.View>
          <View style={s.tagPill}>
            <TagIcon tag={card.tag} color={card.tagColor} />
            <Text style={[s.tagText, { color: card.tagColor }]}>{card.tag.toUpperCase()}</Text>
          </View>
        </View>
        <View style={s.body}>
          <Text style={s.title} numberOfLines={2}>
            {card.title}
          </Text>
          <View style={s.footer}>
            <View style={s.readTime}>
              <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round">
                <Circle cx={12} cy={12} r={9} />
                <Path d="M12 7v5l3 2" />
              </Svg>
              <Text style={s.readTimeText}>{readMinutes(card.body)} min read</Text>
            </View>
            <View style={s.readLink}>
              <Text style={s.readLinkText}>Read</Text>
              <Svg
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.primaryDark}
                strokeWidth={2.6}
                strokeLinecap="round"
              >
                <Path d="M9 6l6 6-6 6" />
              </Svg>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function ForYouCarousel({ items, onOpen }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const reduceMotion = useReduceMotion();
  const [page, setPage] = useState(0);
  const sparkle = useAnimatedValue(0);
  useEffect(() => {
    if (reduceMotion) return undefined;
    const anim = Animated.loop(Animated.timing(sparkle, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true }));
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, sparkle]);

  return (
    <View>
      <View style={s.headRow}>
        <Animated.View style={{ transform: [{ rotate: sparkle.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
          <Svg width={14} height={14} viewBox="0 0 24 24">
            <Path d="M12 1c.6 5 2.4 8.4 11 11-8.6 2.6-10.4 6-11 11-.6-5-2.4-8.4-11-11 8.6-2.6 10.4-6 11-11z" fill={colors.tertiary} />
          </Svg>
        </Animated.View>
        <Text style={s.heading}>For you today</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_W + GAP}
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: SIDE, gap: GAP, paddingVertical: 4 }}
        scrollEventThrottle={16}
        onScroll={e => setPage(Math.max(0, Math.min(items.length - 1, Math.round(e.nativeEvent.contentOffset.x / (CARD_W + GAP)))))}
        style={{ marginTop: 11 }}
      >
        {items.map((card, i) => (
          <FeedCard key={card.id} card={card} index={i} onPress={() => onOpen(card)} colors={colors} s={s} reduceMotion={reduceMotion} />
        ))}
      </ScrollView>
      {items.length > 1 && (
        <View style={s.dots}>
          {items.map((card, i) => (
            <View key={card.id} style={[s.dot, i === page && { width: 18, backgroundColor: colors.primary }]} />
          ))}
        </View>
      )}
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    headRow: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: SIDE },
    heading: { fontSize: 12.5, fontWeight: '700', letterSpacing: -0.1, color: c.textPrimary },
    card: { width: CARD_W, borderRadius: 20, overflow: 'hidden', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
    imageWrap: { height: IMAGE_H, overflow: 'hidden', backgroundColor: c.surfaceAlt },
    image: { width: CARD_W, height: IMAGE_H },
    tagPill: {
      position: 'absolute',
      top: 10,
      left: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      height: 24,
      borderRadius: 12,
      backgroundColor: c.surface,
      opacity: 0.95,
    },
    tagText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
    body: { padding: 13, paddingTop: 12 },
    title: { fontSize: 13, fontWeight: '600', color: c.textPrimary, lineHeight: 18, minHeight: 36 },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
    readTime: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    readTimeText: { fontSize: 10.5, color: c.textMuted, fontWeight: '600' },
    readLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    readLinkText: { fontSize: 11, fontWeight: '700', color: c.primaryDark },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 12 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.border },
  });
}
