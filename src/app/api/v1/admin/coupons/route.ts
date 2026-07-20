import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { createCouponSchema } from "@/lib/validations/admin";
import { apiError, zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const items = await db.select().from(coupons).orderBy(desc(coupons.id));
    return NextResponse.json({ items });
  } catch (error) {
    return unexpectedApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createCouponSchema.safeParse(body);
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  try {
    const [existing] = await db
      .select({ id: coupons.id })
      .from(coupons)
      .where(eq(coupons.code, parsed.data.code))
      .limit(1);

    if (existing) {
      return apiError("CODE_TAKEN", "A coupon with this code already exists.", 409);
    }

    const { startsAt, endsAt, ...rest } = parsed.data;

    const [coupon] = await db
      .insert(coupons)
      .values({
        ...rest,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        endsAt: endsAt ? new Date(endsAt) : undefined,
      })
      .returning();

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
