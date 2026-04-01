import { NativeModules, Platform } from 'react-native';

const DEFAULT_PORT = '8080';
const DEFAULT_API_BASE_URL = `http://localhost:${DEFAULT_PORT}`;

function extractDevServerHost() {
  const scriptUrl =
    NativeModules?.SourceCode?.scriptURL ||
    NativeModules?.SourceCode?.scriptURL?.url ||
    null;

  if (typeof scriptUrl !== 'string' || scriptUrl.length === 0) {
    return null;
  }

  try {
    return new URL(scriptUrl).hostname;
  } catch {
    return null;
  }
}

function getDefaultApiBaseUrl() {
  const devServerHost = extractDevServerHost();

  if (devServerHost) {
    const resolvedHost =
      Platform.OS === 'android' && (devServerHost === 'localhost' || devServerHost === '127.0.0.1')
        ? '10.0.2.2'
        : devServerHost;

    return `http://${resolvedHost}:${DEFAULT_PORT}`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_PORT}`;
  }

  return DEFAULT_API_BASE_URL;
}

export function getApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.replace(/\/$/, '');
  }

  return getDefaultApiBaseUrl();
}

export function getChatWebSocketUrl() {
  const base = getApiBaseUrl();
  if (base.startsWith('https://')) {
    return `${base.replace('https://', 'wss://')}/ws-chat`;
  }

  return `${base.replace('http://', 'ws://')}/ws-chat`;
}

export const API_TIMEOUT_MS = 15000;
