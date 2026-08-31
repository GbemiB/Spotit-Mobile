import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ENABLED_KEY = 'spotit_biometric_enabled';
const ASKED_KEY = 'spotit_biometric_asked';
const DATA_KEY = 'spotit_biometric_data';

export async function isBiometricAvailable() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;
  return LocalAuthentication.isEnrolledAsync();
}

export async function isBiometricEnabled() {
  const val = await AsyncStorage.getItem(ENABLED_KEY);
  return val === 'true';
}

export async function hasBeenAskedAboutBiometric() {
  const val = await AsyncStorage.getItem(ASKED_KEY);
  return val === 'true';
}

export async function markAskedAboutBiometric() {
  await AsyncStorage.setItem(ASKED_KEY, 'true');
}

export async function enableBiometric({ refreshToken, userId, onboarded }) {
  await SecureStore.setItemAsync(DATA_KEY, JSON.stringify({ refreshToken, userId, onboarded }));
  await AsyncStorage.setItem(ENABLED_KEY, 'true');
  await AsyncStorage.setItem(ASKED_KEY, 'true');
}

export async function disableBiometric() {
  try {
    await SecureStore.deleteItemAsync(DATA_KEY);
  } catch {}
  await AsyncStorage.removeItem(ENABLED_KEY);
}

export async function updateStoredRefreshToken(refreshToken) {
  const enabled = await isBiometricEnabled();
  if (!enabled) return;
  try {
    const raw = await SecureStore.getItemAsync(DATA_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    await SecureStore.setItemAsync(DATA_KEY, JSON.stringify({ ...data, refreshToken }));
  } catch {}
}

// Returns { refreshToken, userId, onboarded } on success, or null if cancelled/failed.
export async function authenticateWithBiometric() {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Log in to Spotit',
    cancelLabel: 'Use password',
    fallbackLabel: 'Use password',
  });
  if (!result.success) return null;
  try {
    const raw = await SecureStore.getItemAsync(DATA_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function getBiometricLabel() {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID';
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'Fingerprint';
  return 'Biometric';
}
