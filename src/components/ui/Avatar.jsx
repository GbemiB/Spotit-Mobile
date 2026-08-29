import { Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, Text } from '../../shared/styles/index.js';
export default function Avatar({ name = '', size = 38, onPress, style }) {
  const { colors } = useTheme();
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const circle = (
    <LinearGradient
      colors={colors.gradient.primaryAccent}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <Text style={{ color: colors.white, fontWeight: '700', fontSize: size * 0.37 }}>{initial}</Text>
    </LinearGradient>
  );
  return onPress ? <Pressable onPress={onPress}>{circle}</Pressable> : circle;
}
