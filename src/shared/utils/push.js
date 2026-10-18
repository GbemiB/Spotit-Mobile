import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as devicesApi from '../api/devices.js';
import { getDeviceId, isDeviceRegistered, clearDeviceRegistration } from './device.js';
import { deviceTimeZone } from './timeZone.js';
const PUSH_TOKEN_KEY = 'spotit_push_token';
const PROMPT_SEEN_KEY = 'spotit_push_prompt_seen';
export const REMINDER_CHANNEL = 'reminders';
const supported = Platform.OS === 'ios' || Platform.OS === 'android';
const SCREEN_TABS = { home: 'home', calendar: 'cal', insights: 'insights' };
export function configureNotifications() {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}
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
export { deviceTimeZone };
async function fetchPushToken() {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  await ensureChannel();
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}
async function dropLegacyRegistration(accessToken) {
  if (!(await isDeviceRegistered())) return;
  await devicesApi.unregisterDevice(await getDeviceId(), accessToken);
  await clearDeviceRegistration();
}
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
export function tabForResponse(response) {
  const screen = response?.notification?.request?.content?.data?.screen;
  return SCREEN_TABS[screen] ?? null;
}
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
export function listenForReminders(onReceived) {
  if (!supported) return () => {};
  const subscription = Notifications.addNotificationReceivedListener(() => onReceived());
  return () => subscription.remove();
}
