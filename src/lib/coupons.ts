type CouponLike = {
  discountType: "percentage" | "flat";
  discountValue: number;
  maxDiscountPaise: number | null;
  minOrderSubtotalPaise: number;
  isActive: boolean;
  startsAt: Date | string | null;
  endsAt: Date | string | null;
  maxRedemptions: number | null;
  timesRedeemed: number;
};

export function calculateDiscountPaise(coupon: CouponLike, subtotalPaise: number): number {
  if (coupon.discountType === "flat") {
    return Math.min(coupon.discountValue, subtotalPaise);
  }
  const raw = Math.round((subtotalPaise * coupon.discountValue) / 100);
  return coupon.maxDiscountPaise ? Math.min(raw, coupon.maxDiscountPaise) : Math.min(raw, subtotalPaise);
}

export function validateCoupon(
  coupon: CouponLike,
  subtotalPaise: number,
): { ok: true; discountPaise: number } | { ok: false; reason: string } {
  if (!coupon.isActive) {
    return { ok: false, reason: "This coupon is no longer active." };
  }

  const now = new Date();
  if (coupon.startsAt && now < new Date(coupon.startsAt)) {
    return { ok: false, reason: "This coupon isn't active yet." };
  }
  if (coupon.endsAt && now > new Date(coupon.endsAt)) {
    return { ok: false, reason: "This coupon has expired." };
  }
  if (coupon.maxRedemptions !== null && coupon.timesRedeemed >= coupon.maxRedemptions) {
    return { ok: false, reason: "This coupon has reached its usage limit." };
  }
  if (subtotalPaise < coupon.minOrderSubtotalPaise) {
    return {
      ok: false,
      reason: `Add more items to use this coupon (minimum order ₹${(coupon.minOrderSubtotalPaise / 100).toFixed(0)}).`,
    };
  }

  return { ok: true, discountPaise: calculateDiscountPaise(coupon, subtotalPaise) };
}
