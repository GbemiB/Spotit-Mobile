import { useContext } from 'react';
import { TextInput as RNTextInput, StyleSheet } from 'react-native';
import { FontSetContext, weightFont, scaledFontSize } from './Text.jsx';

export default function TextInput({ style, ...props }) {
  const set = useContext(FontSetContext);
  const flat = StyleSheet.flatten(style) || {};
  const fontFamily = weightFont(set, flat.fontWeight);
  const fontSize = scaledFontSize(flat.fontSize);
  return <RNTextInput {...props} style={[{ fontFamily }, style, fontSize != null && { fontSize }]} />;
}
