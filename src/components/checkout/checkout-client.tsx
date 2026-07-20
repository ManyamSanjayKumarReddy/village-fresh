"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tag, X } from "lucide-react";
import { AddressForm } from "@/components/checkout/address-form";
import { formatPaise } from "@/lib/money";
import { calculateDeliveryFeePaise } from "@/lib/orders";
import { useCartStore } from "@/store/cart-store";
import { useHydrated } from "@/store/use-hydrated";

type CartItem = {
  variantId: number;
  variantLabel: string;
  pricePaise: number;
  stockQty: number;
  quantity: number;
  extraSpicy: boolean;
  productName: string;
  productSlug: string;
};

type Address = {
  id: number;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
};

export function CheckoutClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const hydrated = useHydrated();
  const guestItems = useCartStore((s) => s.items);
  const clearGuestCart = useCartStore((s) => s.clear);

  const mergeAttempted = useRef(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    title: string;
    discountPaise: number;
  } | null>(null);

  const mergeMutation = useMutation({
    mutationFn: async (
      items: { variantId: number; quantity: number; extraSpicy: boolean }[],
    ) => {
      const res = await fetch("/api/v1/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("Could not sync your cart.");
      return res.json();
    },
    onSuccess: () => {
      clearGuestCart();
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  useEffect(() => {
    if (!hydrated || mergeAttempted.current) return;
    mergeAttempted.current = true;

    if (guestItems.length > 0) {
      mergeMutation.mutate(
        guestItems.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          extraSpicy: i.extraSpicy,
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/v1/cart");
      if (!res.ok) throw new Error("Could not load your cart.");
      return res.json() as Promise<{ items: CartItem[]; subtotalPaise: number }>;
    },
  });

  const addressesQuery = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await fetch("/api/v1/account/addresses");
      if (!res.ok) throw new Error("Could not load addresses.");
      const body = await res.json();
      return body.items as Address[];
    },
  });

  const defaultAddressId = addressesQuery.data?.length
    ? (addressesQuery.data.find((a) => a.isDefault) ?? addressesQuery.data[0]).id
    : null;
  const effectiveAddressId = selectedAddressId ?? defaultAddressId;

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: effectiveAddressId,
          idempotencyKey,
          couponCode: appliedCoupon?.code,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Could not place your order.");
      return body.order as { id: number };
    },
    onSuccess: (order) => {
      router.push(`/account/orders/${order.id}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const applyCouponMutation = useMutation({
    mutationFn: async (subtotal: number) => {
      const res = await fetch("/api/v1/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput, subtotalPaise: subtotal }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Could not apply coupon.");
      return body as { code: string; title: string; discountPaise: number };
    },
    onSuccess: (data) => {
      setAppliedCoupon(data);
      toast.success(`${data.code} applied — ${data.title}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!hydrated || cartQuery.isLoading || mergeMutation.isPending) {
    return (
      <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
        <Spinner className="size-6" />
        <p className="text-sm">Loading your cart...</p>
      </div>
    );
  }

  const items = cartQuery.data?.items ?? [];

  if (items.length === 0) {
    return <p className="mt-8 text-muted-foreground">Your cart is empty.</p>;
  }

  const subtotalPaise = cartQuery.data?.subtotalPaise ?? 0;
  const deliveryFeePaise = calculateDeliveryFeePaise(subtotalPaise);
  const discountPaise = appliedCoupon?.discountPaise ?? 0;
  const totalPaise = subtotalPaise + deliveryFeePaise - discountPaise;

  return (
    <div className="mt-6 grid gap-8 sm:grid-cols-2">
      <div>
        <h2 className="font-heading text-lg font-semibold">Delivery address</h2>

        {addressesQuery.data && addressesQuery.data.length > 0 && !showAddressForm && (
          <RadioGroup
            className="mt-3 flex flex-col gap-2"
            value={effectiveAddressId ? String(effectiveAddressId) : undefined}
            onValueChange={(value) => setSelectedAddressId(Number(value))}
          >
            {addressesQuery.data.map((address) => (
              <Label
                key={address.id}
                htmlFor={`address-${address.id}`}
                className="flex items-start gap-3 rounded-xl border bg-card p-4 has-[[data-state=checked]]:border-primary"
              >
                <RadioGroupItem value={String(address.id)} id={`address-${address.id}`} />
                <span className="text-sm">
                  {address.label && <span className="font-medium">{address.label} — </span>}
                  {address.line1}, {address.line2 ? `${address.line2}, ` : ""}
                  {address.city}, {address.state} - {address.pincode}
                  <br />
                  Phone: {address.phone}
                </span>
              </Label>
            ))}
          </RadioGroup>
        )}

        {!showAddressForm ? (
          <Button variant="outline" className="mt-3" onClick={() => setShowAddressForm(true)}>
            Add a new address
          </Button>
        ) : (
          <div className="mt-3">
            <AddressForm
              onSaved={(id) => {
                setSelectedAddressId(id);
                setShowAddressForm(false);
              }}
              onCancel={() => setShowAddressForm(false)}
            />
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold">Payment method</h2>
        <div className="mt-3 flex flex-col gap-2">
          <label className="flex items-center gap-3 rounded-xl border border-primary bg-card p-4 text-sm">
            <input type="radio" checked readOnly className="accent-primary" />
            <span className="font-medium">Cash on Delivery</span>
          </label>
          <label className="flex items-center gap-3 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
            <input type="radio" disabled className="accent-muted-foreground" />
            <span>UPI</span>
            <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              Coming soon
            </span>
          </label>
        </div>

        <h2 className="mt-6 font-heading text-lg font-semibold">Have a coupon?</h2>
        {appliedCoupon ? (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-primary bg-primary/5 p-3 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Tag className="size-4 text-primary" />
              {appliedCoupon.code} applied — {appliedCoupon.title}
            </span>
            <button
              type="button"
              onClick={() => {
                setAppliedCoupon(null);
                setCouponInput("");
              }}
              aria-label="Remove coupon"
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Enter coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
            />
            <Button
              variant="outline"
              disabled={!couponInput || applyCouponMutation.isPending}
              onClick={() => applyCouponMutation.mutate(subtotalPaise)}
            >
              {applyCouponMutation.isPending && <Spinner />}
              Apply
            </Button>
          </div>
        )}

        <h2 className="mt-6 font-heading text-lg font-semibold">Order summary</h2>
        <div className="mt-3 flex flex-col gap-3 rounded-xl border bg-card p-4">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-sm">
              <span>
                {item.productName} ({item.variantLabel}) &times; {item.quantity}
                {item.extraSpicy && (
                  <span className="ml-1 text-xs text-muted-foreground">🌶️ extra spicy</span>
                )}
              </span>
              <span>{formatPaise(item.pricePaise * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-3 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPaise(subtotalPaise)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{deliveryFeePaise === 0 ? "Free" : formatPaise(deliveryFeePaise)}</span>
            </div>
            {discountPaise > 0 && (
              <div className="flex justify-between text-primary">
                <span>Coupon ({appliedCoupon?.code})</span>
                <span>-{formatPaise(discountPaise)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between border-t pt-3 font-heading text-lg font-semibold">
            <span>Total</span>
            <span>{formatPaise(totalPaise)}</span>
          </div>
        </div>

        <Button
          size="lg"
          className="mt-4 w-full"
          disabled={!effectiveAddressId || placeOrderMutation.isPending}
          onClick={() => placeOrderMutation.mutate()}
        >
          {placeOrderMutation.isPending && <Spinner />}
          {placeOrderMutation.isPending ? "Placing order..." : "Place order (Cash on Delivery)"}
        </Button>
      </div>
    </div>
  );
}
