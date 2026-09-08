import Svg, { Path, Rect } from 'react-native-svg';
export function CalendarIcon({ size = 16, color = '#C04E68' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.5" y="5" width="17" height="15" rx="3" stroke={color} strokeWidth="1.8" />
      <Path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
export function HomeIcon({ size = 24, color = '#C04E68' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </Svg>
  );
}
export function InsightsIcon({ size = 24, color = '#C04E68' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 19V10M12 19V5M19 19v-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
export function RewardsIcon({ size = 24, color = '#C04E68' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7 4h10v3a5 5 0 0 1-10 0z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <Path
        d="M7 5H4.5v1.5A2.5 2.5 0 0 0 7 9M17 5h2.5v1.5A2.5 2.5 0 0 1 17 9M9.5 13h5M12 12v4M9 20h6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
export function BellIcon({ size = 18, color = '#2E2429' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <Path d="M9.5 19a2.5 2.5 0 0 0 5 0" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}
export function CheckIcon({ size = 11, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12l5 5 9-10" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
export function ChevronRightIcon({ size = 15, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
export function ChevronLeftIcon({ size = 15, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M11 6l-6 6 6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
export function LockIcon({ size = 20, color = '#C04E68' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="10" width="14" height="10" rx="2" stroke={color} strokeWidth="1.8" />
      <Path d="M8 10V7a4 4 0 0 1 8 0v3" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
export function EnvelopeIcon({ size = 20, color = '#C04E68' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="5" width="16" height="14" rx="2" stroke={color} strokeWidth="1.8" />
      <Path d="M4.5 6.5 12 12.5l7.5-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
export function DocumentIcon({ size = 18, color = '#2E2429' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5H8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9l-3-4z" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      <Path d="M15 5v4h3" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </Svg>
  );
}
export function WarningIcon({ size = 26 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3.5l9.5 16.5H2.5L12 3.5z" fill="#D33B3B" />
      <Rect x="11" y="9" width="2" height="6" rx="1" fill="#fff" />
      <Rect x="11" y="16.5" width="2" height="2" rx="1" fill="#fff" />
    </Svg>
  );
}
