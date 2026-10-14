import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
const KEYS = { accessToken: 'spotit_access_token', refreshToken: 'spotit_refresh_token' };
const OPTIONS = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK };
const secure = Platform.OS === 'ios' || Platform.OS === 'android';
async function read(key) {
  try {
    return secure ? await SecureStore.getItemAsync(key, OPTIONS) : await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}
async function write(key, value) {
  try {
    if (value) {
      await (secure ? SecureStore.setItemAsync(key, value, OPTIONS) : AsyncStorage.setItem(key, value));
    } else {
      await (secure ? SecureStore.deleteItemAsync(key, OPTIONS) : AsyncStorage.removeItem(key));
    }
  } catch {}
}
export async function loadTokens() {
  const [accessToken, refreshToken] = await Promise.all([read(KEYS.accessToken), read(KEYS.refreshToken)]);
  return { accessToken, refreshToken };
}
export async function saveTokens({ accessToken, refreshToken }) {
  await Promise.all([write(KEYS.accessToken, accessToken), write(KEYS.refreshToken, refreshToken)]);
}
export function clearTokens() {
  return saveTokens({ accessToken: null, refreshToken: null });
}
