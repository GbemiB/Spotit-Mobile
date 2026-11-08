import { Linking, Platform } from 'react-native';
import * as Application from 'expo-application';
import appConfig from '../../../app.json';
import { getSupport } from '../api/app.js';

let pending = null;

export function loadSupportEmail() {
  if (!pending) {
    pending = getSupport()
      .then(data => data?.email || null)
      .catch(() => {
        pending = null;
        return null;
      });
  }
  return pending;
}

export function contactUsUrl(email) {
  const version = Application.nativeApplicationVersion || appConfig.expo.version;
  const subject = encodeURIComponent('Spot it support');
  const body = encodeURIComponent(`\n\n—\nApp version: ${version}\nPhone: ${Platform.OS} ${Platform.Version}`);
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

export function openContactUs(email) {
  return Linking.openURL(contactUsUrl(email)).then(
    () => true,
    () => false,
  );
}
