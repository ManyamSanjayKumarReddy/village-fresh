import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariants } from "@/db/schema";
import { updateVariantSchema } from "@/lib/validations/admin";
import { apiError, zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const variantId = Number(id);
  if (!Number.isInteger(variantId) || variantId <= 0) {
    return apiError("INVALID_VARIANT_ID", "Invalid variant id.", 400);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateVariantSchema.safeParse(body);
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  try {
    const [variant] = await db
      .update(productVariants)
      .set(parsed.data)
      .where(eq(productVariants.id, variantId))
      .returning();

    if (!variant) {
      return apiError("VARIANT_NOT_FOUND", "Variant not found.", 404);
    }

    revalidateTag("products", {});

    return NextResponse.json({ variant });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
