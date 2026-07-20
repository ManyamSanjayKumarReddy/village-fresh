import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, productVariants, products } from "@/db/schema";
import { apiError, unexpectedApiError } from "@/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        teluguName: products.teluguName,
        shortDescription: products.shortDescription,
        longDescription: products.longDescription,
        shelfLife: products.shelfLife,
        spiceLevel: products.spiceLevel,
        images: products.images,
        isVeg: products.isVeg,
        isFeatured: products.isFeatured,
        categorySlug: categories.slug,
        categoryName: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.slug, slug))
      .limit(1);

    if (!product) {
      return apiError("PRODUCT_NOT_FOUND", "Product not found.", 404);
    }

    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, product.id));

    return NextResponse.json({ item: { ...product, variants } });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
