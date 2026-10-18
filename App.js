import { View, StyleSheet, AppState } from 'react-native';
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
import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './src/shared/store/AppContext.jsx';
import { A } from './src/shared/store/actions.js';
import { ThemeProvider, useTheme, OnboardingFontScope } from './src/shared/styles/index.js';
import { AUTH_SCREENS, OnboardingScreen, TAB_SCREENS, DEFAULT_TAB_SCREEN } from './src/shared/navigation/screens.js';
import PeriodPickerSheet from './src/modules/tracker/PeriodPickerSheet.jsx';
import BottomNav from './src/components/nav/BottomNav.jsx';
import Toast from './src/components/ui/Toast.jsx';
import * as logsApi from './src/shared/api/logs.js';
import * as cycleApi from './src/shared/api/cycle.js';
import * as billingApi from './src/shared/api/billing.js';
import * as usersApi from './src/shared/api/users.js';
import * as rewardsApi from './src/shared/api/rewards.js';
import * as shopApi from './src/shared/api/shop.js';
import * as contentApi from './src/shared/api/content.js';
import { toISO, todayISO } from './src/shared/utils/cycle.js';
import ConfirmModal from './src/components/ui/ConfirmModal.jsx';
import UpdateRequiredScreen from './src/modules/update/UpdateRequiredScreen.jsx';
import * as appApi from './src/shared/api/app.js';
import { currentBuild, requiredUpdate } from './src/shared/utils/appVersion.js';
import {
  configureNotifications,
  syncPushRegistration,
  requestPermission,
  wasPromptSeen,
  markPromptSeen,
  listenForReminderTaps,
  listenForReminders,
} from './src/shared/utils/push.js';

configureNotifications();

function PrivacyScreen() {
  const { colors } = useTheme();
  return <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />;
}
function AppContent() {
  const { state, dispatch } = useApp();
  const { colors } = useTheme();
  const {
    onboarded,
    authDone,
    authScreen,
    screen,
    periodPickerOpen,
    toast,
    accessToken,
    lastPeriodDate,
    cycleLength,
    periodLength,
    today,
  } = state;
  const [resumedAt, setResumedAt] = useState(0);
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        dispatch({ type: A.TODAY_CHANGED, today: todayISO() });
        setResumedAt(Date.now());
      }
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: A.TODAY_CHANGED, today: todayISO() }), 60000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!authDone || !onboarded) return;
    const now = new Date();
    const from = toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60));
    const to = toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14));
    logsApi
      .getLogsInRange({ from, to }, accessToken)
      .then(data => dispatch({ type: A.LOGS_HYDRATED, from, to, logs: data.logs || {} }))
      .catch(() => {});
  }, [authDone, onboarded, today]);
  const [askReminders, setAskReminders] = useState(false);
  useEffect(() => {
    if (!authDone || !accessToken) return;
    (async () => {
      const permission = await syncPushRegistration(accessToken);
      if (permission === 'undetermined' && onboarded && !(await wasPromptSeen())) setAskReminders(true);
    })();
  }, [authDone, onboarded, accessToken, resumedAt]);
  async function answerReminderPrompt(accepted) {
    setAskReminders(false);
    await markPromptSeen();
    if (accepted && (await requestPermission()) === 'granted') await syncPushRegistration(accessToken);
  }
  function refreshInbox() {
    usersApi
      .getInbox(accessToken)
      .then(data => dispatch({ type: A.INBOX_HYDRATED, ...data }))
      .catch(() => {});
  }
  useEffect(() => {
    if (!authDone || !onboarded) return;
    refreshInbox();
    return listenForReminders(refreshInbox);
  }, [authDone, onboarded, accessToken, resumedAt]);
  useEffect(() => {
    if (!authDone || !onboarded) return;
    return listenForReminderTaps(tab => dispatch({ type: A.GO, screen: tab }));
  }, [authDone, onboarded]);
  useEffect(() => {
    if (!authDone || !onboarded) return;
    cycleApi
      .getCurrent(accessToken)
      .then(status => dispatch({ type: A.CYCLE_STATUS_HYDRATED, status }))
      .catch(() => {});
  }, [authDone, onboarded, lastPeriodDate, cycleLength, periodLength, today]);
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
      .getLevels(accessToken)
      .then(levels => dispatch({ type: A.LEVELS_HYDRATED, levels }))
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
  useEffect(() => {
    if (!authDone || !onboarded) return;
    contentApi
      .getFeed(10, accessToken)
      .then(data => dispatch({ type: A.CONTENT_HYDRATED, items: data.items || [] }))
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
      {periodPickerOpen && <PeriodPickerSheet />}
      {toast && <Toast icon={toast.icon} text={toast.text} onDismiss={() => dispatch({ type: A.CLEAR_TOAST })} />}
      <ConfirmModal
        visible={askReminders}
        title="Turn on reminders?"
        message="Get a heads-up before your period and ovulation, with the days counted down for you. You choose which reminders you get in Profile."
        confirmLabel="Turn on"
        cancelLabel="Not now"
        onConfirm={() => answerReminderPrompt(true)}
        onCancel={() => answerReminderPrompt(false)}
      />
    </View>
  );
}
SplashScreenNative.preventAutoHideAsync();
const MIN_SPLASH_MS = 300;
const appMountedAt = Date.now();
const DEV_FORCE_SCHEME = null;
function ThemedApp() {
  const { state, ready } = useApp();
  const [appIsActive, setAppIsActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => setAppIsActive(next === 'active'));
    return () => sub.remove();
  }, []);
  const [updateNeeded, setUpdateNeeded] = useState(null);
  useEffect(() => {
    if (!appIsActive) return;
    const build = currentBuild();
    if (build == null) return;
    appApi
      .getVersionPolicy()
      .then(policy => setUpdateNeeded(requiredUpdate(policy, build)))
      .catch(() => {});
  }, [appIsActive]);
  useEffect(() => {
    if (!ready) return;
    const remaining = MIN_SPLASH_MS - (Date.now() - appMountedAt);
    setTimeout(() => SplashScreenNative.hideAsync(), Math.max(0, remaining));
  }, [ready]);
  if (!ready) return null;
  const scheme = DEV_FORCE_SCHEME || (state.themePref === 'system' ? null : state.themePref);
  return (
    <ThemeProvider scheme={scheme}>
      {updateNeeded ? <UpdateRequiredScreen storeUrl={updateNeeded.storeUrl} /> : <AppContent />}
      {!appIsActive && <PrivacyScreen />}
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
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemedApp />
      </AppProvider>
    </SafeAreaProvider>
  );
}
const s = StyleSheet.create({ root: { flex: 1 } });
