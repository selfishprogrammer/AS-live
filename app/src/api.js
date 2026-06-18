import { API_URL } from './config';
import { getToken } from './storage';

async function request(path, { method = 'GET', body, auth = false } = {}) {
  if (!API_URL) {
    throw new Error('API URL is not configured (see app/src/config.js).');
  }

  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    // Every protected request carries the bearer token.
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export function register(email, password) {
  return request('/auth/register', {
    method: 'POST',
    body: { email, password },
  });
}

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export function fetchPosts() {
  return request('/posts', { auth: true });
}

export function createPost(title) {
  return request('/posts', { method: 'POST', body: { title }, auth: true });
}
