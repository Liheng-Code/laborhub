const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

async function request<T>(
  method: string,
  path: string,
  body?: any,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  try {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const tenantSlug = typeof window !== 'undefined' ? localStorage.getItem('tenantSlug') : null;
    if (tenantSlug) {
      defaultHeaders['X-Tenant-Slug'] = tenantSlug;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { ...defaultHeaders, ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        error: data.error || `Request failed with status ${res.status}`,
        status: res.status,
      };
    }

    return { data, status: res.status };
  } catch (error: any) {
    return {
      error: error.message || 'Network error',
      status: 0,
    };
  }
}

export const api = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>('GET', path, undefined, headers),

  post: <T>(path: string, body: any, headers?: Record<string, string>) =>
    request<T>('POST', path, body, headers),

  put: <T>(path: string, body: any, headers?: Record<string, string>) =>
    request<T>('PUT', path, body, headers),

  delete: <T>(path: string, headers?: Record<string, string>) =>
    request<T>('DELETE', path, undefined, headers),

  health: () => request('GET', '/health'),
};

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    fullName: string;
    tenantId: string;
    tenantSlug: string;
  };
}

export interface TenantResponse {
  id: string;
  company_name: string;
  slug: string;
  plan: string;
  status: string;
  region: string;
  created_at: string;
  worker_limit: number;
  project_limit: number;
  subscription_status: string;
}

export interface ScanResponse {
  accepted: boolean;
  localScore: number;
  queuedForVerify: boolean;
  scanId: string;
}

export interface ScanRecord {
  id: string;
  worker_id: string;
  project_id: string;
  scan_type: string;
  scanned_at: string;
  lat: number | null;
  lng: number | null;
  face_photo_url: string | null;
  face_match_score_local: number | null;
  face_match_score_server: number | null;
  face_verified: boolean;
  sync_status: string;
  created_at: string;
}
