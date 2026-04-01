import { del, get, post, put } from '../api/httpClient';

export function fetchTrips() {
  return get('/trips');
}

export function fetchTrip(tripId) {
  return get(`/trips/${tripId}`);
}

export function createTrip({ title, startDate, endDate, cityId }) {
  return post('/trips', {
    title,
    startDate,
    endDate,
    cityId,
  });
}

export function updateTrip(tripId, patch) {
  return put(`/trips/${tripId}`, patch);
}

export function deleteTrip(tripId) {
  return del(`/trips/${tripId}`);
}
