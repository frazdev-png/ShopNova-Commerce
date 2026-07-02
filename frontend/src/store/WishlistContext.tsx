import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { wishlistService } from "../services/wishlist";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  ids: string[];
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
  toggle: (productId: string) => Promise<boolean>;
  has: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setIds(wishlistService.localGetAll());
      return;
    }
    setLoading(true);
    try {
      const res = await wishlistService.getAll();
      setIds(res.items.map((i) => i.product_id));
    } catch {
      setIds([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = useCallback(async (productId: string): Promise<boolean> => {
    if (!user) {
      const state = wishlistService.localToggle(productId);
      setIds(wishlistService.localGetAll());
      return state;
    }
    const inWishlist = await wishlistService.toggle(productId);
    await refresh();
    return inWishlist;
  }, [user, refresh]);

  const has = useCallback((productId: string): boolean => {
    return ids.includes(productId);
  }, [ids]);

  return (
    <WishlistContext.Provider value={{ ids, count: ids.length, loading, refresh, toggle, has }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be inside WishlistProvider");
  return ctx;
}
