import { authService } from "./auth";
import { api } from "./api";

export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
}

export interface WishlistResponse {
  items: WishlistItem[];
  count: number;
}

function getToken(): string {
  const t = authService.getToken();
  if (!t) throw new Error("Not authenticated");
  return t;
}

export const wishlistService = {
  async getAll(): Promise<WishlistResponse> {
    return api.get<WishlistResponse>("/wishlist", getToken());
  },

  async check(productId: string): Promise<boolean> {
    const res = await api.get<{ in_wishlist: boolean }>(`/wishlist/check/${productId}`, getToken());
    return res.in_wishlist;
  },

  async toggle(productId: string): Promise<boolean> {
    const res = await api.post<WishlistItem | null>("/wishlist/toggle", { product_id: productId }, getToken());
    return res !== null;
  },

  async add(productId: string): Promise<WishlistItem> {
    return api.post<WishlistItem>("/wishlist/add", { product_id: productId }, getToken());
  },

  async remove(productId: string): Promise<void> {
    await api._delete(`/wishlist/remove/${productId}`, getToken());
  },

  // Local fallback for non-logged-in users
  localGetAll(): string[] {
    try {
      const raw = localStorage.getItem("shopnova_wishlist");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  localToggle(productId: string): boolean {
    const items = this.localGetAll();
    const idx = items.indexOf(productId);
    if (idx >= 0) {
      items.splice(idx, 1);
      localStorage.setItem("shopnova_wishlist", JSON.stringify(items));
      return false;
    }
    items.push(productId);
    localStorage.setItem("shopnova_wishlist", JSON.stringify(items));
    return true;
  },

  localCount(): number {
    return this.localGetAll().length;
  },
};
