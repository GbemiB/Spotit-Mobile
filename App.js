import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { Newsreader_400Regular } from '@expo-google-fonts/newsreader';
import * as SplashScreenNative from 'expo-splash-screen';
import { useCallback, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './src/shared/store/AppContext.jsx';
import { A } from './src/shared/store/actions.js';
import { ThemeProvider, useTheme, OnboardingFontScope } from './src/shared/styles/index.js';
import { AUTH_SCREENS, OnboardingScreen, TAB_SCREENS, DEFAULT_TAB_SCREEN } from './src/shared/navigation/screens.js';
import LogSheet from './src/modules/tracker/LogSheet.jsx';
import BottomNav from './src/components/nav/BottomNav.jsx';
import Toast from './src/components/ui/Toast.jsx';
import * as logsApi from './src/shared/api/logs.js';
import * as devicesApi from './src/shared/api/devices.js';
import * as cycleApi from './src/shared/api/cycle.js';
import * as contentApi from './src/shared/api/content.js';
import * as billingApi from './src/shared/api/billing.js';
import * as usersApi from './src/shared/api/users.js';
import * as rewardsApi from './src/shared/api/rewards.js';
import * as shopApi from './src/shared/api/shop.js';
import { toISO } from './src/shared/utils/cycle.js';
import { getDeviceId, isDeviceRegistered, markDeviceRegistered } from './src/shared/utils/device.js';

function AppContent() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const { onboarded, authDone, authScreen, screen, logOpen, toast, accessToken } = state;

  // Home/Insights read state.logs directly without owning a fetch of their own — seed a
  // wide-enough window (covers the weekly digest and "logged today" check) once per session.
  useEffect(() => {
    if (!authDone || !onboarded) return;
    const today = new Date();
    const from = toISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 60));
    const to = toISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14));
    logsApi
      .getLogsInRange({ from, to }, accessToken)
      .then(data => dispatch({ type: A.LOGS_HYDRATED, logs: data.logs || {} }))
      .catch(() => {});
  }, [authDone, onboarded]);

  // Registers this install with the backend once, the first time we have an authenticated
  // session — not on every launch. pushToken is a local stand-in id (see utils/device.js)
  // until real push-notification infra (expo-notifications + an EAS project) is set up.
  useEffect(() => {
    if (!authDone || !accessToken) return;
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;
    (async () => {
      if (await isDeviceRegistered()) return;
      const pushToken = await getDeviceId();
      try {
        await devicesApi.registerDevice({ pushToken, platform: Platform.OS }, accessToken);
        await markDeviceRegistered();
      } catch {}
    })();
  }, [authDone, accessToken]);

  // Server-computed cycle day/phase/prediction — HomeScreen falls back to its local
  // calculation until this resolves, and whenever it fails (offline, etc).
  useEffect(() => {
    if (!authDone || !onboarded) return;
    cycleApi
      .getCurrent(accessToken)
      .then(status => dispatch({ type: A.CYCLE_STATUS_HYDRATED, status }))
      .catch(() => {});
  }, [authDone, onboarded]);

  // Public content feed for the Home screen's "For you today" carousel.
  useEffect(() => {
    if (!authDone || !onboarded) return;
    contentApi
      .getFeed(10, accessToken)
      .then(data => dispatch({ type: A.CONTENT_FEED_HYDRATED, items: data.items || [] }))
      .catch(() => {});
  }, [authDone, onboarded]);

  // Real subscription status from the backend replaces the old client-only isPremium flag.
  useEffect(() => {
    if (!authDone || !onboarded) return;
    billingApi
      .getStatus(accessToken)
      .then(data =>
        dispatch({
          type: A.SUBSCRIPTION_UPDATED,
          isPremium: data.isPremium,
          plan: data.plan,
          renewsAt: data.renewsAt,
          autoRenew: data.autoRenew,
        }),
      )
      .catch(() => {});
  }, [authDone, onboarded]);

  // Full profile — cycle/period length, goal, dob, name, theme — as persisted server-side.
  // Needed so a fresh install / different device lands on the real values instead of local
  // defaults; AsyncStorage's cached copy only covers the same device/session.
  useEffect(() => {
    if (!authDone || !onboarded) return;
    usersApi
      .getProfile(accessToken)
      .then(data => dispatch({ type: A.PROFILE_HYDRATED, ...data }))
      .catch(() => {});
    usersApi
      .getNotifications(accessToken)
      .then(data => dispatch({ type: A.NOTIFICATIONS_HYDRATED, ...data }))
      .catch(() => {});
  }, [authDone, onboarded]);

  // SpotPoints balance/streak, badges, weekly challenges, and the shop catalog — all
  // server-computed (PointsWriteService et al.), so this is the source of truth rather
  // than anything derived from local logs.
  useEffect(() => {
    if (!authDone || !onboarded) return;
    rewardsApi
      .getSummary(accessToken)
      .then(data => dispatch({ type: A.REWARDS_HYDRATED, ...data }))
      .catch(() => {});
    rewardsApi
      .getBadges(accessToken)
      .then(badges => dispatch({ type: A.BADGES_HYDRATED, badges }))
      .catch(() => {});
    rewardsApi
      .getChallenges(accessToken)
      .then(challenges => dispatch({ type: A.CHALLENGES_HYDRATED, challenges }))
      .catch(() => {});
    rewardsApi
      .getHistory({ limit: 20 }, accessToken)
      .then(data => dispatch({ type: A.HISTORY_HYDRATED, entries: data.entries || [] }))
      .catch(() => {});
    shopApi
      .getProducts(accessToken)
      .then(products => dispatch({ type: A.SHOP_PRODUCTS_HYDRATED, products }))
      .catch(() => {});
  }, [authDone, onboarded]);

  if (!authDone) {
    const AuthScreen = AUTH_SCREENS[authScreen];
    if (AuthScreen)
      return (
        <OnboardingFontScope>
          <AuthScreen />
        </OnboardingFontScope>
      );
  }

  if (!onboarded)
    return (
      <OnboardingFontScope>
        <OnboardingScreen />
      </OnboardingFontScope>
    );

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
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
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
