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

// Prompts the user to scan their face/fingerprint. Only stores credentials on
// a successful scan. Returns true if enrolled, false if cancelled or failed.
export async function enrollBiometric({ refreshToken, userId, onboarded }) {
  const label = await getBiometricLabel();
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: `Confirm your ${label} to enable biometric login`,
    cancelLabel: 'Cancel',
    disableDeviceFallback: true,
  });
  if (!result.success) {
    await AsyncStorage.setItem(ASKED_KEY, 'true');
    return false;
  }
  await enableBiometric({ refreshToken, userId, onboarded });
  return true;
}

// Full disable — used when biometric is permanently turned off (invalid token, account delete).
export async function disableBiometric() {
  try {
    await SecureStore.deleteItemAsync(DATA_KEY);
  } catch {}
  await AsyncStorage.removeItem(ENABLED_KEY);
  await AsyncStorage.removeItem(ASKED_KEY);
}

// Lightweight session clear — used on explicit logout so the button stays visible on
// the next login screen without re-prompting enrollment.
export async function clearBiometricSession() {
  try {
    await SecureStore.deleteItemAsync(DATA_KEY);
  } catch {}
  // ENABLED_KEY kept: button stays visible on the login screen.
  // ASKED_KEY kept: enrollment prompt does NOT fire again on next login.
}

// Updates the stored refresh token after each successful login. If biometric is enabled
// but credentials were cleared by clearBiometricSession, stores fresh credentials.
export async function updateStoredRefreshToken(refreshToken, userId, onboarded) {
  const enabled = await isBiometricEnabled();
  if (!enabled) return;
  try {
    const raw = await SecureStore.getItemAsync(DATA_KEY);
    if (!raw) {
      // Credentials were cleared (e.g. after logout) — store fresh ones if we have them.
      if (userId !== undefined) {
        await SecureStore.setItemAsync(DATA_KEY, JSON.stringify({ refreshToken, userId, onboarded }));
      }
      return;
    }
    const data = JSON.parse(raw);
    await SecureStore.setItemAsync(DATA_KEY, JSON.stringify({ ...data, refreshToken }));
  } catch {}
}

// Returns { refreshToken, userId, onboarded } on success, null if user cancelled, or
// throws with err.noCredentials = true if the scan succeeded but no credentials are stored.
export async function authenticateWithBiometric() {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Log in to Spotit',
    cancelLabel: 'Use password',
    disableDeviceFallback: true,
  });
  if (!result.success) return null; // user cancelled
  try {
    const raw = await SecureStore.getItemAsync(DATA_KEY);
    if (!raw) {
      const err = new Error('Please log in with your password to re-activate Face ID.');
      err.noCredentials = true;
      throw err;
    }
    return JSON.parse(raw);
  } catch (e) {
    if (e.noCredentials) throw e;
    return null;
  }
}

export async function getBiometricLabel() {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID';
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'Fingerprint';
  return 'Biometric';
}
