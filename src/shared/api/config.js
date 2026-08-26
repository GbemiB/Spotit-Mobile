import { Platform } from 'react-native';

// Android emulator can't reach the host machine via `localhost` (that resolves to the
// emulator itself) — 10.0.2.2 is the documented alias for the host. Physical devices need
// a real LAN IP, set EXPO_PUBLIC_API_URL in a local .env for that case.
// Staging backend: https://spotit-backend-fi2q.onrender.com/api/v1 (set via EXPO_PUBLIC_API_URL in .env).
const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/api/v1' : 'http://localhost:8080/api/v1';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;
