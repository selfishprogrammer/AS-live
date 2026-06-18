import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'access_token';

// Tokens are kept in the device keychain / keystore via expo-secure-store,
// not in plain AsyncStorage.
export async function saveToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
