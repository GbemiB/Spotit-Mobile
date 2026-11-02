import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme, Text } from '../../../shared/styles/index.js';
import { Bob, PressScale } from './SpotlightFx.jsx';
import { quizColors } from './theme.js';

export default function SpChip({ balance, onPress, reduceMotion }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  return (
    <PressScale onPress={onPress} accessibilityLabel={`Your SpotPoints: ${balance}`}>
      <View style={[styles.chip, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Bob distance={1.5} duration={4000} reduceMotion={reduceMotion}>
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Circle cx={12} cy={12} r={9} fill={q.goldSoft} stroke={q.gold} strokeWidth={1.8} />
            <Path d="M12 7.6l1.3 2.8 3 .3-2.3 2 .7 2.9-2.7-1.6-2.7 1.6.7-2.9-2.3-2 3-.3z" fill={q.gold} />
          </Svg>
        </Bob>
        <Text style={{ fontSize: 12, fontWeight: '700', color: c.textPrimary }}>{balance.toLocaleString()} SP</Text>
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 13, borderRadius: 99, borderWidth: 1 },
});
