// In Docker:  nginx proxies /api/* → backend:5000
// In dev:     vite.config.ts proxy forwards /api/* → localhost:5000
// Never hardcode localhost — always use relative /api path
const BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('collegefest_token');
}

async function request(method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  get:    (path: string)                => request('GET',    path),
  post:   (path: string, body?: unknown) => request('POST',   path, body),
  put:    (path: string, body?: unknown) => request('PUT',    path, body),
  patch:  (path: string, body?: unknown) => request('PATCH',  path, body),
  delete: (path: string)                => request('DELETE', path),
};

export function setToken(token: string) {
  localStorage.setItem('collegefest_token', token);
}

export function clearToken() {
  localStorage.removeItem('collegefest_token');
}
