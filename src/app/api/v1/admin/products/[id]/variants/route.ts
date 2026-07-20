import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { createVariantSchema } from "@/lib/validations/admin";
import { apiError, zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    return apiError("INVALID_PRODUCT_ID", "Invalid product id.", 400);
  }

  const body = await request.json().catch(() => null);
  const parsed = createVariantSchema.safeParse(body);
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  try {
    const [product] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return apiError("PRODUCT_NOT_FOUND", "Product not found.", 404);
    }

    const [variant] = await db
      .insert(productVariants)
      .values({ productId, ...parsed.data })
      .returning();

    revalidateTag("products", {});

    return NextResponse.json({ variant }, { status: 201 });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
