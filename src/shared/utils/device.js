import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'spotit_device_id';
const REGISTERED_KEY = 'spotit_device_registered';

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

// A stable per-install identifier. No push-notification infra (expo-notifications, EAS
// project) is wired up yet, so this stands in for a real push token — just enough for
// POST /devices/register to know this installation exists. Swap for a real Expo push
// token once that's set up; the backend contract (pushToken + platform) won't change.
export async function getDeviceId() {
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = generateId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export async function isDeviceRegistered() {
  return (await AsyncStorage.getItem(REGISTERED_KEY)) === '1';
}

export async function markDeviceRegistered() {
  await AsyncStorage.setItem(REGISTERED_KEY, '1');
}
