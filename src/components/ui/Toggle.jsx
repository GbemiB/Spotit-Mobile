import { View, Pressable, Animated, StyleSheet } from 'react-native';
import { useRef, useEffect, useMemo } from 'react';
import { useTheme, Text } from '../../shared/styles/index.js';

export default function Toggle({ value, onChange, label, description }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [value]);

  const bgColor = anim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(140,120,125,0.32)', colors.primary] });
  const thumbX = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 23] });

  return (
    <Pressable onPress={() => onChange(!value)} style={s.row}>
      {(label || description) && (
        <View style={s.labelWrap}>
          {label && <Text style={s.label}>{label}</Text>}
          {description && <Text style={s.desc}>{description}</Text>}
        </View>
      )}
      <Animated.View style={[s.track, { backgroundColor: bgColor }]}>
        <Animated.View style={[s.thumb, { transform: [{ translateX: thumbX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    labelWrap: { flex: 1, marginRight: 14 },
    label: { fontSize: 15, fontWeight: '600', color: c.textPrimary },
    desc: { fontSize: 12.5, color: c.textMuted, marginTop: 2 },
    track: { width: 48, height: 28, borderRadius: 14 },
    thumb: {
      position: 'absolute', top: 3, width: 22, height: 22, borderRadius: 11, backgroundColor: c.white,
      shadowColor: c.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2
    },
  });
}
