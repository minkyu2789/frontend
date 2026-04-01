import { get, post } from '../api/httpClient';

export function fetchChatRooms() {
  return get('/chatrooms');
}

export function fetchChatRoom(chatRoomId) {
  return get(`/chatrooms/${chatRoomId}`);
}

export function initializeDirectChatRoom(participantUserId) {
  return post('/chatrooms', {
    participantUserIds: [participantUserId],
  });
}

export function joinMingleChatRoom(mingleId) {
  return post(`/chatrooms/mingles/${mingleId}/join`);
}

export function fetchChatMessages(chatRoomId) {
  return get(`/chatrooms/${chatRoomId}/messages`);
}
