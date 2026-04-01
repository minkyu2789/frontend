import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "semo_auth_token";

let memoryToken = null;

function canUseSecureStore() {
  return typeof SecureStore?.isAvailableAsync === "function";
}

export async function loadStoredToken() {
  if (canUseSecureStore()) {
    try {
      const available = await SecureStore.isAvailableAsync();
      if (available) {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        memoryToken = token ?? null;
        return memoryToken;
      }
    } catch {
      return memoryToken;
    }
  }

  return memoryToken;
}

export async function persistToken(token) {
  memoryToken = token ?? null;

  if (canUseSecureStore()) {
    try {
      const available = await SecureStore.isAvailableAsync();
      if (available) {
        if (memoryToken) {
          await SecureStore.setItemAsync(TOKEN_KEY, memoryToken);
        } else {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }
      }
    } catch {
      // Keep memory fallback only.
    }
  }
}

export async function clearStoredToken() {
  memoryToken = null;

  if (canUseSecureStore()) {
    try {
      const available = await SecureStore.isAvailableAsync();
      if (available) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch {
      // Keep memory fallback only.
    }
  }
}
