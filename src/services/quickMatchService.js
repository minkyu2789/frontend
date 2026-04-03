import { get, post } from '../api/httpClient';

export function fetchQuickMatches({ cityId } = {}) {
  return get('/quick-matches', {
    cityId,
  });
}

export function fetchQuickMatch(quickMatchId) {
  return get(`/quick-matches/${quickMatchId}`);
}

export function createQuickMatch({ cityId, message }) {
  return post('/quick-matches', {
    cityId,
    message,
  });
}

export function acceptQuickMatch(quickMatchId) {
  return post(`/quick-matches/${quickMatchId}/accept`);
}

export function declineQuickMatch(quickMatchId) {
  return post(`/quick-matches/${quickMatchId}/decline`);
}
