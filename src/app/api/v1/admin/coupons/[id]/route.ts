import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { updateCouponSchema } from "@/lib/validations/admin";
import { apiError, zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const couponId = Number(id);
  if (!Number.isInteger(couponId) || couponId <= 0) {
    return apiError("INVALID_COUPON_ID", "Invalid coupon id.", 400);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateCouponSchema.safeParse(body);
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  try {
    const [coupon] = await db
      .update(coupons)
      .set(parsed.data)
      .where(eq(coupons.id, couponId))
      .returning();

    if (!coupon) {
      return apiError("COUPON_NOT_FOUND", "Coupon not found.", 404);
    }

    return NextResponse.json({ coupon });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
