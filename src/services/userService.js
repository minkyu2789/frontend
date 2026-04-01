import { get, put } from '../api/httpClient';

export function fetchUsers() {
  return get('/users');
}

export function fetchUser(userId) {
  return get(`/users/${userId}`);
}

export function updateUser(userId, patch) {
  return put(`/users/${userId}`, patch);
}
