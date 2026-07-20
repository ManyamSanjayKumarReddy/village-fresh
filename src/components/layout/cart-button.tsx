"use client";

import { ShoppingBasket } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartView } from "@/components/cart/cart-view";
import { useCartStore } from "@/store/cart-store";
import { useHydrated } from "@/store/use-hydrated";
import { cn } from "@/lib/utils";

export function CartButton() {
  const totalQuantity = useCartStore((s) => s.totalQuantity());
  const mounted = useHydrated();

  return (
    <Sheet>
      <SheetTrigger
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
        aria-label="View cart"
      >
        <ShoppingBasket className="size-5" />
        {mounted && totalQuantity > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {totalQuantity}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-heading">Your cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <CartView />
        </div>
      </SheetContent>
    </Sheet>
  );
}
