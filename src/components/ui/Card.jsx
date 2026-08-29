import { View } from 'react-native';
import { useTheme } from '../../shared/styles/index.js';
export default function Card({ children, style, padding = 18 }) {
  const { colors } = useTheme();
  return (
    <View style={[{ backgroundColor: colors.surface, borderRadius: 20, padding, borderWidth: 1.5, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}
