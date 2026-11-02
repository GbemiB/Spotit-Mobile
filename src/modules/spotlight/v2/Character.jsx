import { SvgXml } from 'react-native-svg';
import { CHARACTERS } from './characters.js';

export default function Character({ name, size, style }) {
  const xml = CHARACTERS[name] || CHARACTERS.you;
  return <SvgXml xml={xml} width={size} height={size} style={style} />;
}
