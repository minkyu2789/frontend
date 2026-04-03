import { post } from '../api/httpClient';

export async function login(username, password) {
  const response = await post('/auth/login', { username, password });
  const token = response?.accessToken;

  if (!token) {
    throw new Error('Login succeeded but accessToken was missing in response');
  }

  return token;
}

export async function signup({
  username,
  password,
  name,
  email,
  phone,
  sex,
  introduction,
  profileImageUrl,
  nationalityId,
  keywordIds = [],
}) {
  const response = await post('/users', {
    username,
    password,
    name,
    email,
    phone,
    sex,
    introduction,
    profileImageUrl,
    nationalityId,
    keywordIds,
  });

  return response?.user ?? null;
}
