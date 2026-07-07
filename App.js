import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { Newsreader_400Regular } from '@expo-google-fonts/newsreader';
import * as SplashScreenNative from 'expo-splash-screen';
import { useCallback, useRef } from 'react';
import { AppProvider, useApp } from './src/shared/store/AppContext.jsx';
import { A } from './src/shared/store/actions.js';
import { ThemeProvider, useTheme } from './src/shared/styles/index.js';
import { AUTH_SCREENS, OnboardingScreen, TAB_SCREENS, DEFAULT_TAB_SCREEN } from './src/shared/navigation/screens.js';
import LogSheet from './src/modules/tracker/LogSheet.jsx';
import BottomNav from './src/components/nav/BottomNav.jsx';
import Toast from './src/components/ui/Toast.jsx';

function AppContent() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const { onboarded, authDone, authScreen, screen, logOpen, toast } = state;

  if (!authDone) {
    const AuthScreen = AUTH_SCREENS[authScreen];
    if (AuthScreen) return <AuthScreen />;
  }

  if (!onboarded) return <OnboardingScreen />;

  const Screen = TAB_SCREENS[screen] || DEFAULT_TAB_SCREEN;

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <Screen />
      <BottomNav screen={screen} dispatch={dispatch} />
      {logOpen && <LogSheet />}
      {toast && <Toast icon={toast.icon} text={toast.text} onDismiss={() => dispatch({ type: A.CLEAR_TOAST })} />}
    </View>
  );
}

SplashScreenNative.preventAutoHideAsync();

const MIN_SPLASH_MS = 3200;

// Dev-only override to preview a theme regardless of the user's Appearance
// setting. Set to 'light' or 'dark' to force it; null defers to state.themePref.
const DEV_FORCE_SCHEME = null;

function ThemedApp() {
  const { state } = useApp();
  const scheme = DEV_FORCE_SCHEME || (state.themePref === 'system' ? null : state.themePref);
  return (
    <ThemeProvider scheme={scheme}>
      <AppContent />
    </ThemeProvider>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Newsreader_400Regular,
  });
  const mountedAt = useRef(Date.now());

  const onLayoutRootView = useCallback(async () => {
    if (!fontsLoaded) return;
    const remaining = MIN_SPLASH_MS - (Date.now() - mountedAt.current);
    setTimeout(() => SplashScreenNative.hideAsync(), Math.max(0, remaining));
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <AppProvider>
        <ThemedApp />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
});
