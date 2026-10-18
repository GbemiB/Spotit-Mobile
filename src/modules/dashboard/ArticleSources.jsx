import { View, Pressable, Linking, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme, Text } from '../../shared/styles/index.js';

export default function ArticleSources({ references }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const items = (Array.isArray(references) ? references : []).filter(r => r?.label && /^https:\/\//.test(r.url || ''));

  return (
    <View style={s.wrap}>
      {items.length > 0 && (
        <>
          <Text style={s.heading}>Sources</Text>
          {items.map((r, i) => (
            <Pressable
              key={`${r.url}-${i}`}
              onPress={() => Linking.openURL(r.url).catch(() => {})}
              accessibilityRole="link"
              accessibilityLabel={`Source ${i + 1}: ${r.label}`}
              style={({ pressed }) => [s.row, pressed && { opacity: 0.6 }]}
            >
              <Text style={s.num}>{i + 1}.</Text>
              <Text style={s.label}>{r.label}</Text>
              <Svg
                width={11}
                height={11}
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.textMuted}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <Path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
              </Svg>
            </Pressable>
          ))}
        </>
      )}
      <Text style={s.disclaimer}>For general information only — not a substitute for medical advice.</Text>
    </View>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    wrap: { marginTop: 18, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
    heading: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase', color: c.textMuted, marginBottom: 6 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5 },
    num: { fontSize: 11, color: c.textMuted, width: 14 },
    label: {
      flex: 1,
      fontSize: 11,
      color: c.textSecondary,
      lineHeight: 16,
      textDecorationLine: 'underline',
      textDecorationColor: c.border,
    },
    disclaimer: { fontSize: 10, color: c.textMuted, lineHeight: 15, marginTop: 10, fontStyle: 'italic' },
  });
}
