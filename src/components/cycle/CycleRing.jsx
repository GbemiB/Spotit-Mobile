import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../shared/styles/index.js';

export default function CycleRing({ cycleDay, cycleLength, size = 220 }) {
  const { colors } = useTheme();
  const R    = size * 0.417;
  const cx   = size / 2;
  const cy   = size / 2;
  const circ = 2 * Math.PI * R;
  const prog = Math.min(cycleDay / cycleLength, 1);
  const ang  = (-90 + prog * 360) * (Math.PI / 180);
  const mx   = cx + R * Math.cos(ang);
  const my   = cy + R * Math.sin(ang);
  const sw   = size * 0.058;
  const [ringStart, ringMid, ringEnd] = colors.gradient.ring;

  return (
    <Svg width={size} height={size}>
      <Defs>
        <LinearGradient id="ringg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%"   stopColor={ringStart} />
          <Stop offset="55%"  stopColor={ringMid} />
          <Stop offset="100%" stopColor={ringEnd} />
        </LinearGradient>
      </Defs>
      <Circle cx={cx} cy={cy} r={R} fill="none" stroke={colors.border} strokeWidth={sw} />
      <Circle
        cx={cx} cy={cy} r={R} fill="none"
        stroke="url(#ringg)" strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - prog)}
        rotation="-90" originX={cx} originY={cy}
      />
      <Circle cx={mx} cy={my} r={size * 0.038} fill={colors.white} stroke={ringEnd} strokeWidth={size * 0.017} />
    </Svg>
  );
}
