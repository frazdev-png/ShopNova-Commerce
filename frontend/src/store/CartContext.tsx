import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cartService, type CartItem } from "../services/cart";
import { useAuth } from "./AuthContext";

interface CartContextType {
  items: CartItem[];
  count: number;
  total: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); setTotal(0); return; }
    setLoading(true);
    try {
      const res = await cartService.get();
      setItems(res.items);
      setTotal(res.total);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    await cartService.add(productId, quantity);
    await refresh();
  }, [refresh]);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    await cartService.update(itemId, quantity);
    await refresh();
  }, [refresh]);

  const removeItem = useCallback(async (itemId: string) => {
    await cartService.remove(itemId);
    await refresh();
  }, [refresh]);

  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, total, loading, refresh, addItem, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
