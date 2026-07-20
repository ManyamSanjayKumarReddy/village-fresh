import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { addressSchema } from "@/lib/validations/address";
import { apiError, zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHENTICATED", "Sign in required.", 401);
  }

  try {
    const items = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, Number(session.user.id)))
      .orderBy(asc(addresses.id));

    return NextResponse.json({ items });
  } catch (error) {
    return unexpectedApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHENTICATED", "Sign in required.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  try {
    const userId = Number(session.user.id);

    if (parsed.data.isDefault) {
      await db
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));
    }

    const [address] = await db
      .insert(addresses)
      .values({ ...parsed.data, userId })
      .returning();

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
