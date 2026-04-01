import { post } from '../api/httpClient';
import { clearAccessToken, setAccessToken } from '../api/authTokenStore';

export async function login(username, password) {
  const response = await post('/auth/login', { username, password });
  const token = response?.accessToken;

  if (!token) {
    throw new Error('Login succeeded but accessToken was missing in response');
  }

  setAccessToken(token);
  return token;
}

export function logout() {
  clearAccessToken();
}
