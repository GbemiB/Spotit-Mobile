import { Platform } from 'react-native';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
export function currentBuild() {
  if (__DEV__ || Constants.executionEnvironment === 'storeClient') return null;
  const build = parseInt(Application.nativeBuildVersion, 10);
  return Number.isFinite(build) ? build : null;
}
export function requiredUpdate(policy, build, os = Platform.OS) {
  const rule = policy?.[os];
  if (!rule || build == null || !(rule.minBuild > 0) || build >= rule.minBuild) return null;
  return { storeUrl: rule.storeUrl || null };
}
