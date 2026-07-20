import { useSyncExternalStore } from "react";
import { useCartStore } from "@/store/cart-store";

export function useHydrated() {
  return useSyncExternalStore(
    (callback) => useCartStore.persist.onFinishHydration(callback),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
}
