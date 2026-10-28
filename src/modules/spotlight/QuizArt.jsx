import { View, Animated } from 'react-native';
import Svg, { Circle, Ellipse } from 'react-native-svg';
import { useTheme, Text } from '../../shared/styles/index.js';
import { Bob, Twinkle, useLoopValue } from './SpotlightFx.jsx';
import { quizColors } from './quizTheme.js';

function SpinningRing({ color, reduceMotion }) {
  const v = useLoopValue(14000, reduceMotion, { linear: true });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
      }}
    >
      <Svg width={46} height={46} viewBox="0 0 46 46">
        <Circle cx={23} cy={23} r={17} fill="none" stroke={color} strokeWidth={2} strokeDasharray="3 5" strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

export default function QuizArt({ reduceMotion }) {
  const { colors: c, isDark } = useTheme();
  const q = quizColors(c, isDark);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', right: 14, top: 24, width: 122, height: 132 }}>
      <Bob distance={3} duration={5500} rotate={3} reduceMotion={reduceMotion} style={{ position: 'absolute', left: 22, top: 6 }}>
        <View
          style={{
            width: 92,
            height: 112,
            borderRadius: 18,
            backgroundColor: q.goldSoft,
            borderWidth: 1.5,
            borderColor: isDark ? 'rgba(214,162,78,0.35)' : '#F1DDB8',
            transform: [{ rotate: '9deg' }],
          }}
        />
      </Bob>
      <Bob distance={6} duration={4500} rotate={3} reduceMotion={reduceMotion} style={{ position: 'absolute', left: 4, top: 12 }}>
        <View
          style={{
            width: 96,
            height: 116,
            borderRadius: 18,
            backgroundColor: c.surface,
            borderWidth: 1.5,
            borderColor: c.primarySoftBorder,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transform: [{ rotate: '-6deg' }],
            shadowColor: q.shadow,
            shadowOpacity: 1,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            elevation: 4,
          }}
        >
          <View style={{ width: 46, height: 46, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={46} height={46} viewBox="0 0 46 46" style={{ position: 'absolute' }}>
              <Circle cx={23} cy={23} r={21} fill={c.primarySoft} />
              <Ellipse cx={23} cy={24} rx={8.5} ry={10.5} fill={q.eggFill} stroke={q.gold} strokeWidth={1.6} />
              <Ellipse cx={20.5} cy={20.5} rx={2.4} ry={3.2} fill="#FFFFFF" opacity={0.8} />
            </Svg>
            <SpinningRing color={c.primary} reduceMotion={reduceMotion} />
          </View>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <Text
              style={{
                fontSize: 7.5,
                fontWeight: '800',
                letterSpacing: 0.4,
                color: q.goldDeep,
                backgroundColor: q.goldSoft,
                paddingHorizontal: 6,
                paddingVertical: 3,
                borderRadius: 99,
                overflow: 'hidden',
              }}
            >
              MYTH
            </Text>
            <Text
              style={{
                fontSize: 7.5,
                fontWeight: '800',
                letterSpacing: 0.4,
                color: c.primaryDark,
                backgroundColor: c.primarySoft,
                paddingHorizontal: 6,
                paddingVertical: 3,
                borderRadius: 99,
                overflow: 'hidden',
              }}
            >
              FACT
            </Text>
          </View>
        </View>
      </Bob>
      <Twinkle size={14} color={q.gold} reduceMotion={reduceMotion} style={{ right: 0, top: -2 }} />
      <Twinkle size={10} color={c.primary} delay={800} reduceMotion={reduceMotion} style={{ left: -6, bottom: 18 }} />
      <Twinkle size={8} color={c.primary} delay={1600} reduceMotion={reduceMotion} style={{ right: 8, bottom: 2 }} />
    </View>
  );
}
