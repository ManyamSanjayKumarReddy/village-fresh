import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, productVariants, products } from "@/db/schema";
import { createProductSchema } from "@/lib/validations/admin";
import { apiError, zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        categoryName: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(asc(products.name));

    const variants = await db.select().from(productVariants);
    const variantsByProduct = new Map<number, typeof variants>();
    for (const v of variants) {
      const list = variantsByProduct.get(v.productId) ?? [];
      list.push(v);
      variantsByProduct.set(v.productId, list);
    }

    const items = rows.map((p) => ({ ...p, variants: variantsByProduct.get(p.id) ?? [] }));

    return NextResponse.json({ items });
  } catch (error) {
    return unexpectedApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  try {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, parsed.data.slug))
      .limit(1);

    if (existing) {
      return apiError("SLUG_TAKEN", "A product with this slug already exists.", 409);
    }

    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, parsed.data.categoryId))
      .limit(1);

    if (!category) {
      return apiError("CATEGORY_NOT_FOUND", "Category not found.", 404);
    }

    const [product] = await db
      .insert(products)
      .values({
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        slug: parsed.data.slug,
        teluguName: parsed.data.teluguName,
        shortDescription: parsed.data.shortDescription,
        longDescription: parsed.data.longDescription,
        shelfLife: parsed.data.shelfLife,
        spiceLevel: parsed.data.spiceLevel,
        isVeg: parsed.data.isVeg,
        isFeatured: parsed.data.isFeatured,
        images: [],
      })
      .returning();

    const [variant] = await db
      .insert(productVariants)
      .values({
        productId: product.id,
        label: parsed.data.variantLabel,
        pricePaise: parsed.data.variantPricePaise,
        stockQty: parsed.data.variantStockQty,
      })
      .returning();

    revalidateTag("products");

    return NextResponse.json({ product: { ...product, variants: [variant] } }, { status: 201 });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
