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
    400: set.regular,
    normal: set.regular,
    500: set.medium,
    600: set.semiBold,
    700: set.bold,
    bold: set.bold,
    800: set.extraBold,
  };
  return map[String(weight)] || set.regular;
}

// Body/label/caption copy across the app was sized in the 9-14px range and read as too
// small on real devices — bump just that range by ~1.5pt here, centrally, rather than
// touching every screen's StyleSheet. Larger display/heading sizes are left alone so the
// existing type hierarchy isn't thrown off.
const BODY_SIZE_CEILING = 14;
const BODY_SIZE_BUMP = 1.5;

export function scaledFontSize(size) {
  if (typeof size !== 'number') return size;
  return size <= BODY_SIZE_CEILING ? size + BODY_SIZE_BUMP : size;
}

export default function Text({ style, ...props }) {
  const set = useContext(FontSetContext);
  const flat = StyleSheet.flatten(style) || {};
  const fontFamily = weightFont(set, flat.fontWeight);
  const fontSize = scaledFontSize(flat.fontSize);
  return <RNText {...props} style={[{ fontFamily }, style, fontSize != null && { fontSize }]} />;
}
