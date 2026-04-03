import { get, post } from '../api/httpClient';

export function fetchLocals() {
  return get('/locals');
}

export function createLocal({ cityId }) {
  return post('/locals', { cityId });
}
