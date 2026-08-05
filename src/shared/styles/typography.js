// Main app (post-onboarding: Home/Calendar/Insights/Rewards/Profile/nav) —
// matches the "Spot it - MVP 1" design's Plus Jakarta Sans typeface.
export const FONT = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
  // Editorial serif used for display numerals (countdown days, predicted dates,
  // level names in hero cards) — distinct accent, not for body text.
  serif: 'Newsreader_400Regular',
};

// Onboarding/auth flow (Splash/Welcome/Login/Signup/.../first-run setup) —
// its own design pass used Manrope; kept separate from the main app's FONT.
export const ONBOARDING_FONT = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
};
