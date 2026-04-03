import { get } from '../api/httpClient';

export function fetchLocals() {
  return get('/locals');
}

