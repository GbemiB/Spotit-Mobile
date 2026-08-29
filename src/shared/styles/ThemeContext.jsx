import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { light, dark } from './colors.js';
const ThemeContext = createContext({ colors: light, scheme: 'light', isDark: false });
export function ThemeProvider({ children, scheme: forcedScheme }) {
  const systemScheme = useColorScheme();
  const scheme = forcedScheme || systemScheme || 'light';
  const value = useMemo(() => ({ colors: scheme === 'dark' ? dark : light, scheme, isDark: scheme === 'dark' }), [scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  return useContext(ThemeContext);
}
