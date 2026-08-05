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

export function GoogleIcon({ size = 16 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.5 13.2l7.9 6.1C12.3 13 17.6 9.5 24 9.5z"
      />
      <Path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.2 5.5-4.7 7.2l7.3 5.7C43.6 37.6 46.5 31.6 46.5 24.5z" />
      <Path fill="#FBBC05" d="M10.4 19.3a14.4 14.4 0 0 0 0 9.4l-7.9 6.1a24 24 0 0 1 0-21.6l7.9 6.1z" />
      <Path
        fill="#34A853"
        d="M24 48c6.4 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2.1 1.4-4.9 2.3-8.6 2.3-6.4 0-11.7-3.5-13.6-9l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </Svg>
  );
}

export function AppleIcon({ size = 14, color = '#2E2429' }) {
  const height = size * (512 / 384);
  return (
    <Svg width={size} height={height} viewBox="0 0 384 512" fill={color}>
      <Path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 0 184.3 0 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-57.7-90-57.7-91.9zM261.7 91.7c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </Svg>
  );
}
