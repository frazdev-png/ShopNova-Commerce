import { api } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  created_at: string;
  wishlist_count?: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

const TOKEN_KEY = "shopnova_token";
const USER_KEY = "shopnova_user";

export const authService = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async login(email: string, password: string): Promise<User> {
    const res = await api.post<TokenResponse>("/auth/login", { email, password });
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    return res.user;
  },

  async register(name: string, email: string, password: string): Promise<User> {
    const res = await api.post<TokenResponse>("/auth/register", { name, email, password });
    localStorage.setItem(TOKEN_KEY, res.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    return res.user;
  },

  async getMe(): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error("Not authenticated");
    const user = await api.get<User>("/auth/me", token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
