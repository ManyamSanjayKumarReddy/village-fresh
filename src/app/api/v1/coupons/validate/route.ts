import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { validateCouponSchema } from "@/lib/validations/coupons";
import { validateCoupon } from "@/lib/coupons";
import { apiError, zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = validateCouponSchema.safeParse(body);
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  try {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, parsed.data.code))
      .limit(1);

    if (!coupon) {
      return apiError("COUPON_NOT_FOUND", "That coupon code doesn't exist.", 404);
    }

    const result = validateCoupon(coupon, parsed.data.subtotalPaise);
    if (!result.ok) {
      return apiError("COUPON_INVALID", result.reason, 422);
    }

    return NextResponse.json({
      code: coupon.code,
      title: coupon.title,
      discountPaise: result.discountPaise,
    });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
