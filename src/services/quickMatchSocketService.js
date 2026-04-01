import { Client } from "@stomp/stompjs";
import { getAccessToken } from "../api/authTokenStore";
import { getChatWebSocketUrl } from "../api/config";

function parsePayload(rawBody) {
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
}

export function createQuickMatchSocketClient({ onConnect, onError } = {}) {
  const token = getAccessToken();
  const client = new Client({
    connectHeaders: {
      accessToken: token || "",
    },
    reconnectDelay: 200,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    webSocketFactory: () => new WebSocket(getChatWebSocketUrl()),
  });

  client.onConnect = () => {
    if (typeof onConnect === "function") {
      onConnect();
    }
  };

  client.onStompError = (frame) => {
    if (typeof onError === "function") {
      onError(frame?.headers?.message || "STOMP error");
    }
  };

  client.onWebSocketError = () => {
    if (typeof onError === "function") {
      onError("WebSocket connection error");
    }
  };

  client.onWebSocketClose = () => {
    if (typeof onError === "function") {
      onError("WebSocket disconnected, reconnecting...");
    }
  };

  return client;
}

export function subscribeCityQuickMatches(client, cityId, onEvent) {
  if (!client || !cityId) {
    return null;
  }

  return client.subscribe(`/topic/cities/${cityId}/quick-matches`, (frame) => {
    const payload = parsePayload(frame.body);
    if (payload && typeof onEvent === "function") {
      onEvent(payload);
    }
  });
}

export function subscribeUserQuickMatches(client, userId, onEvent) {
  if (!client || !userId) {
    return null;
  }

  return client.subscribe(`/topic/users/${userId}/quick-matches`, (frame) => {
    const payload = parsePayload(frame.body);
    if (payload && typeof onEvent === "function") {
      onEvent(payload);
    }
  });
}
