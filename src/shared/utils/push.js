import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as devicesApi from '../api/devices.js';
import { getDeviceId, isDeviceRegistered, clearDeviceRegistration } from './device.js';
const PUSH_TOKEN_KEY = 'spotit_push_token';
const PROMPT_SEEN_KEY = 'spotit_push_prompt_seen';
// Must match the channelId the server puts on every reminder.
export const REMINDER_CHANNEL = 'reminders';
const supported = Platform.OS === 'ios' || Platform.OS === 'android';
// Where a tap on a reminder lands: the server names a screen, these are the app's tab keys.
const SCREEN_TABS = { home: 'home', calendar: 'cal', insights: 'insights' };
// Call once at startup. Without a handler a reminder that arrives while the app is open is not shown at all.
export function configureNotifications() {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}
// Android 13+ shows no permission prompt and issues no token until a channel exists.
async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
    name: 'Reminders',
    description: 'Period, ovulation and logging reminders',
    importance: Notifications.AndroidImportance.HIGH,
  });
}
function toState(settings) {
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) return 'granted';
  return settings.canAskAgain ? 'undetermined' : 'denied';
}
// 'granted' | 'undetermined' (the system prompt can still be shown) | 'denied' (only the phone's settings can change it) | 'unsupported'
export async function getPermissionState() {
  if (!supported) return 'unsupported';
  try {
    return toState(await Notifications.getPermissionsAsync());
  } catch {
    return 'unsupported';
  }
}
export async function requestPermission() {
  if (!supported) return 'unsupported';
  try {
    await ensureChannel();
    return toState(await Notifications.requestPermissionsAsync());
  } catch {
    return 'unsupported';
  }
}
export function deviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}
async function fetchPushToken() {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  await ensureChannel();
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}
// Builds before 1.1 registered a random device id where the push address now goes. Remove that row once.
async function dropLegacyRegistration(accessToken) {
  if (!(await isDeviceRegistered())) return;
  await devicesApi.unregisterDevice(await getDeviceId(), accessToken);
  await clearDeviceRegistration();
}
// Registers this phone for reminders when permission allows, and refreshes its time zone. Safe to call on every
// launch and every return to the foreground; it never throws, because reminders must not break sign-in.
export async function syncPushRegistration(accessToken) {
  if (!supported || !accessToken) return 'unsupported';
  const permission = await getPermissionState();
  try {
    await dropLegacyRegistration(accessToken);
    if (permission !== 'granted') return permission;
    const pushToken = await fetchPushToken();
    if (!pushToken) return permission;
    const previous = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (previous && previous !== pushToken) await devicesApi.unregisterDevice(previous, accessToken).catch(() => {});
    await devicesApi.registerDevice({ pushToken, platform: Platform.OS, timeZone: deviceTimeZone() }, accessToken);
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, pushToken);
  } catch {}
  return permission;
}
// Call before signing out or deleting the account, while the access token still works.
export async function unlinkPush(accessToken) {
  try {
    await dropLegacyRegistration(accessToken);
    const pushToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (pushToken) await devicesApi.unregisterDevice(pushToken, accessToken);
  } catch {}
  await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
  await clearDeviceRegistration();
}
export async function wasPromptSeen() {
  return (await AsyncStorage.getItem(PROMPT_SEEN_KEY)) === '1';
}
export async function markPromptSeen() {
  await AsyncStorage.setItem(PROMPT_SEEN_KEY, '1');
}
// The tab a tapped reminder should open, or null when the notification is not one of ours.
export function tabForResponse(response) {
  const screen = response?.notification?.request?.content?.data?.screen;
  return SCREEN_TABS[screen] ?? null;
}
// Calls onOpen(tab) for a reminder tapped while the app runs, and for the one that launched it.
export function listenForReminderTaps(onOpen) {
  if (!supported) return () => {};
  const launchedBy = tabForResponse(Notifications.getLastNotificationResponse());
  if (launchedBy) {
    Notifications.clearLastNotificationResponse();
    onOpen(launchedBy);
  }
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const tab = tabForResponse(response);
    if (tab) onOpen(tab);
  });
  return () => subscription.remove();
}
// Calls onReceived() when a reminder arrives while the app is open, so the bell can refresh.
export function listenForReminders(onReceived) {
  if (!supported) return () => {};
  const subscription = Notifications.addNotificationReceivedListener(() => onReceived());
  return () => subscription.remove();
}
