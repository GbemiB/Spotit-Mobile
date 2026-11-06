import { SvgXml } from 'react-native-svg';
import { useApp } from '../../../../shared/store/AppContext.jsx';
import { CHARACTERS, lookFor } from './characters.js';

export default function Character({ name, size, style, asViewer }) {
  const { state } = useApp();
  const look = asViewer ? lookFor(name, state.accountType) : name;
  const xml = CHARACTERS[look] || CHARACTERS.you;
  return <SvgXml xml={xml} width={size} height={size} style={style} />;
}
