const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5160/api';

export function getToken() { return localStorage.getItem('teampulse-token'); }
export function setToken(token: string | null) { token ? localStorage.setItem('teampulse-token', token) : localStorage.removeItem('teampulse-token'); }

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  if (response.status === 401) { setToken(null); throw new Error('Your session has expired. Please sign in again.'); }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed (${response.status})`);
  }
  return response.status === 204 ? undefined as T : response.json();
}

