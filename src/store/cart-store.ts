import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: number;
  productSlug: string;
  productName: string;
  variantLabel: string;
  pricePaise: number;
  imageUrl?: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: number) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  clear: () => void;
  totalPaise: () => number;
  totalQuantity: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) =>
                  i.variantId === variantId ? { ...i, quantity } : i,
                ),
        })),
      clear: () => set({ items: [] }),
      totalPaise: () =>
        get().items.reduce((sum, i) => sum + i.pricePaise * i.quantity, 0),
      totalQuantity: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "village-fresh-cart" },
  ),
);
