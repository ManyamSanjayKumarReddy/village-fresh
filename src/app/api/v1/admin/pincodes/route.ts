import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { serviceablePincodes } from "@/db/schema";
import { createPincodeSchema } from "@/lib/validations/admin";
import { apiError, zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const items = await db
      .select()
      .from(serviceablePincodes)
      .orderBy(asc(serviceablePincodes.pincode));

    return NextResponse.json({ items });
  } catch (error) {
    return unexpectedApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createPincodeSchema.safeParse(body);
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  try {
    const [existing] = await db
      .select({ id: serviceablePincodes.id })
      .from(serviceablePincodes)
      .where(eq(serviceablePincodes.pincode, parsed.data.pincode))
      .limit(1);

    if (existing) {
      return apiError("PINCODE_EXISTS", "This pincode is already listed.", 409);
    }

    const [pincode] = await db.insert(serviceablePincodes).values(parsed.data).returning();

    return NextResponse.json({ pincode }, { status: 201 });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
