import { TextInput as RNTextInput, StyleSheet } from 'react-native';
import { FONT } from './typography.js';

const WEIGHT_FONT = {
  '400': FONT.regular, normal: FONT.regular,
  '500': FONT.medium,
  '600': FONT.semiBold,
  '700': FONT.bold, bold: FONT.bold,
  '800': FONT.extraBold,
};

export default function TextInput({ style, ...props }) {
  const flat = StyleSheet.flatten(style) || {};
  const fontFamily = WEIGHT_FONT[String(flat.fontWeight)] || FONT.regular;
  return <RNTextInput {...props} style={[{ fontFamily }, style]} />;
}
