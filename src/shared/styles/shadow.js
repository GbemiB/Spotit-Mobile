import { Platform } from 'react-native';
export const shadow = (depth = 1, shadowColor = '#2E2429') =>
  Platform.select({
    ios: { shadowColor, shadowOffset: { width: 0, height: depth * 3 }, shadowOpacity: 0.07 + depth * 0.02, shadowRadius: depth * 8 },
    android: { elevation: depth * 3 },
  });
