const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  errorCode?: string;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

export const api = {
  baseUrl: API_BASE_URL,

  async get<T>(endpoint: string, token?: string): Promise<T> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(
        body.detail || `GET ${endpoint} failed`,
        res.status,
        body.error_code,
      );
    }
    return res.json();
  },

  async post<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(
        body.detail || `POST ${endpoint} failed`,
        res.status,
        body.error_code,
      );
    }
    return res.json();
  },

  async patch<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(
        body.detail || `PATCH ${endpoint} failed`,
        res.status,
        body.error_code,
      );
    }
    return res.json();
  },

  async put<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(
        body.detail || `PUT ${endpoint} failed`,
        res.status,
        body.error_code,
      );
    }
    return res.json();
  },

  async _delete(endpoint: string, token?: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(
        body.detail || `DELETE ${endpoint} failed`,
        res.status,
        body.error_code,
      );
    }
  },
};
