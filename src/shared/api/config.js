import { Platform } from 'react-native';
const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8080/api/v1' : 'http://localhost:8080/api/v1';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;
