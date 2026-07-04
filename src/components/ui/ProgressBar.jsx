import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../shared/styles/index.js';

export default function ProgressBar({ value, pct, color, colors, trackColor, track, height = 7, style }) {
  const { colors: c } = useTheme();
  const progress = value ?? pct ?? 0;
  const fillColors = colors || (color ? [color, color] : [c.primaryLight, c.primary]);
  const trackBg = trackColor || track || c.border;
  const width = `${Math.min(100, Math.round(progress * 100))}%`;

  return (
    <View style={[{ height, borderRadius: 999, backgroundColor: trackBg, overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={fillColors}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ height: '100%', width, borderRadius: 999 }}
      />
    </View>
  );
}
