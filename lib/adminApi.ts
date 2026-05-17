const BASE = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '') ?? '';

function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return BASE ? `${BASE}${normalizedPath}` : normalizedPath;
}

export async function adminApiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  }
  return res;
}

export function saveAdminToken(token: string): void {
  localStorage.setItem('adminToken', token);
}
