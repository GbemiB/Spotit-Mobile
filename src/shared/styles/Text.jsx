import { createContext, useContext } from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { FONT, ONBOARDING_FONT } from './typography.js';

export const FontSetContext = createContext(FONT);

// Wraps the onboarding/auth flow so its Text components render in Manrope
// instead of the main app's Plus Jakarta Sans.
export function OnboardingFontScope({ children }) {
  return <FontSetContext.Provider value={ONBOARDING_FONT}>{children}</FontSetContext.Provider>;
}

export function weightFont(set, weight) {
  const map = {
    '400': set.regular, normal: set.regular,
    '500': set.medium,
    '600': set.semiBold,
    '700': set.bold, bold: set.bold,
    '800': set.extraBold,
  };
  return map[String(weight)] || set.regular;
}

export default function Text({ style, ...props }) {
  const set = useContext(FontSetContext);
  const flat = StyleSheet.flatten(style) || {};
  const fontFamily = weightFont(set, flat.fontWeight);
  return <RNText {...props} style={[{ fontFamily }, style]} />;
}
