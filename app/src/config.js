import Constants from 'expo-constants';

// The deployed API base URL. Set this in app.json under expo.extra.apiUrl,
// or override with the EXPO_PUBLIC_API_URL env var at build/start time.
const fromExtra = Constants.expoConfig?.extra?.apiUrl;
const fromEnv = process.env.EXPO_PUBLIC_API_URL;

export const API_URL = (fromEnv || fromExtra || '').replace(/\/$/, '');
