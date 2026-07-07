import { Pressable, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Text } from '../../shared/styles/index.js';

function getVariants(c) {
  return {
    primary:   { colors: c.gradient.primaryAccent, text: c.white },
    secondary: { colors: [c.surface, c.surface], text: c.primaryDark, border: c.border },
    ghost:     { colors: ['transparent', 'transparent'], text: c.primaryDark },
    danger:    { colors: [c.errorSoft, c.errorSoft], text: c.error, border: c.errorBorder },
  };
}

export default function Button({ children, variant = 'primary', onPress, disabled, style, size = 'md' }) {
  const { colors } = useTheme();
  const s = useMemo(() => createStyles(colors), [colors]);
  const VARIANTS = useMemo(() => getVariants(colors), [colors]);
  const v   = VARIANTS[variant] || VARIANTS.primary;
  const pad = size === 'sm' ? { paddingVertical: 10, paddingHorizontal: 16 } : { paddingVertical: 15, paddingHorizontal: 22 };
  const fs  = size === 'sm' ? 12 : 13;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [{ opacity: pressed || disabled ? 0.7 : 1 }, style]}
    >
      <LinearGradient
        colors={v.colors}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[s.base, pad, v.border && { borderWidth: 1.5, borderColor: v.border }]}
      >
        <Text style={[s.label, { fontSize: fs, color: v.text }]}>{children}</Text>
      </LinearGradient>
    </Pressable>
  );
}

function createStyles(c) {
  return StyleSheet.create({
    base:  { borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    label: { fontWeight: '600', letterSpacing: 0.3 },
  });
}
