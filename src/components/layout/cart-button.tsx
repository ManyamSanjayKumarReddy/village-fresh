"use client";

import Link from "next/link";
import { ShoppingBasket } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useHydrated } from "@/store/use-hydrated";

export function CartButton() {
  const totalQuantity = useCartStore((s) => s.totalQuantity());
  const mounted = useHydrated();

  return (
    <Link
      href="/cart"
      aria-label="View cart"
      className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}
    >
      <ShoppingBasket className="size-5" />
      {mounted && totalQuantity > 0 && (
        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {totalQuantity}
        </span>
      )}
    </Link>
  );
}
