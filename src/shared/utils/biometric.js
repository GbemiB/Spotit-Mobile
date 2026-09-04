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

// With no userId: "is biometric linked to some account on this device" (used pre-login,
// before we know which account is signing in, to decide whether to show the button at all).
// With userId: "is biometric linked to THIS account" — checked against the userId embedded
// in the stored credential so a different/newer account never inherits a stale link.
export async function isBiometricEnabled(userId) {
  const val = await AsyncStorage.getItem(ENABLED_KEY);
  if (val !== 'true') return false;
  if (userId === undefined) return true;
  try {
    const raw = await SecureStore.getItemAsync(DATA_KEY);
    if (!raw) return false;
    return JSON.parse(raw).userId === userId;
  } catch {
    return false;
  }
}

// Scoped per account (stores the last-asked userId) so a different account — e.g. a fresh
// signup after a previous account was asked/enrolled on this same device — gets prompted too.
export async function hasBeenAskedAboutBiometric(userId) {
  const val = await AsyncStorage.getItem(ASKED_KEY);
  return val === userId;
}

export async function markAskedAboutBiometric(userId) {
  await AsyncStorage.setItem(ASKED_KEY, userId);
}

export async function enableBiometric({ refreshToken, userId, onboarded }) {
  await SecureStore.setItemAsync(DATA_KEY, JSON.stringify({ refreshToken, userId, onboarded }));
  await AsyncStorage.setItem(ENABLED_KEY, 'true');
  await markAskedAboutBiometric(userId);
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
    await markAskedAboutBiometric(userId);
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
  const val = await AsyncStorage.getItem(ENABLED_KEY);
  if (val !== 'true') return;
  try {
    const raw = await SecureStore.getItemAsync(DATA_KEY);
    if (!raw) {
      // Credentials were cleared (e.g. after logout) — store fresh ones for this account.
      await SecureStore.setItemAsync(DATA_KEY, JSON.stringify({ refreshToken, userId, onboarded }));
      return;
    }
    const data = JSON.parse(raw);
    if (data.userId !== userId) return; // linked to a different account — don't overwrite it
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
