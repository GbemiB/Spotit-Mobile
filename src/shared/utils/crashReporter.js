import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import { reportCrash } from '../api/app.js';
const KEY = 'spotit_pending_crashes';
const MAX_PENDING = 10;
const context = { screen: null, token: null };
let installed = false;
export function setCrashContext(patch) {
  Object.assign(context, patch);
}
function versionLabel() {
  const version = Application.nativeApplicationVersion;
  const build = Application.nativeBuildVersion;
  if (!version) return null;
  return build ? `${version} (${build})` : version;
}
export function crashFrom(error) {
  const message = error && error.message ? error.message : String(error || 'Unknown error');
  return {
    message: message.slice(0, 2000),
    stack: error && error.stack ? String(error.stack).slice(0, 20000) : null,
    screen: context.screen,
    appVersion: versionLabel(),
    platform: Platform.OS,
    deviceModel: Platform.constants?.Model || Platform.constants?.model || null,
    osVersion: Platform.Version == null ? null : String(Platform.Version),
    happenedAt: new Date().toISOString(),
  };
}
async function readPending() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
async function writePending(list) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(list.slice(-MAX_PENDING)));
  } catch {
    return;
  }
}
export async function queueCrash(crash) {
  const list = await readPending();
  list.push(crash);
  await writePending(list);
}
export async function flushCrashes() {
  const list = await readPending();
  if (!list.length) return 0;
  const left = [];
  for (const crash of list) {
    try {
      await reportCrash(crash, context.token);
    } catch {
      left.push(crash);
    }
  }
  await writePending(left);
  return list.length - left.length;
}
export function installCrashReporter() {
  const errorUtils = global.ErrorUtils;
  if (installed || !errorUtils) return;
  installed = true;
  const previous = errorUtils.getGlobalHandler();
  errorUtils.setGlobalHandler((error, isFatal) => {
    queueCrash(crashFrom(error))
      .then(flushCrashes)
      .catch(() => {});
    if (previous) previous(error, isFatal);
  });
}
