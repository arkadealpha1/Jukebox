import { API_URL } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

interface ApiError {
  message: string;
  statusCode: number;
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function transformKeys<T>(obj: unknown): T {
  if (obj === null || obj === undefined) return obj as T;
  if (Array.isArray(obj)) return obj.map(transformKeys) as T;
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[snakeToCamel(key)] = transformKeys(value);
    }
    return result as T;
  }
  return obj as T;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return useAuthStore.getState().token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const json: ApiResponse<T> & ApiError = await response.json();

      if (!response.ok) {
        const errorMessage = json.message || `Request failed with status ${response.status}`;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      return transformKeys<T>(json.data);
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const networkMsg = 'Network error. Please check your connection.';
        toast.error(networkMsg);
        throw new Error(networkMsg);
      }
      throw error;
    }
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}

export const api = new ApiClient(API_URL);
