import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, gt, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { categories, productVariants, products } from "@/db/schema";
import { listProductsQuerySchema } from "@/lib/validations/products";
import { zodApiError, unexpectedApiError, apiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = listProductsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  );

  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  const { cursor, limit, category, featured, search } = parsed.data;

  try {
    const filters = [eq(products.isActive, true)];

    if (cursor) {
      filters.push(gt(products.id, cursor));
    }

    if (featured !== undefined) {
      filters.push(eq(products.isFeatured, featured));
    }

    if (search) {
      const term = `%${search}%`;
      const searchFilter = or(
        ilike(products.name, term),
        ilike(products.teluguName, term),
        ilike(products.shortDescription, term),
      );
      if (searchFilter) filters.push(searchFilter);
    }

    let categoryId: number | undefined;
    if (category) {
      const [cat] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, category))
        .limit(1);

      if (!cat) {
        return apiError("CATEGORY_NOT_FOUND", "Category not found.", 404);
      }
      categoryId = cat.id;
      filters.push(eq(products.categoryId, categoryId));
    }

    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        teluguName: products.teluguName,
        shortDescription: products.shortDescription,
        images: products.images,
        isVeg: products.isVeg,
        isFeatured: products.isFeatured,
        categorySlug: categories.slug,
        categoryName: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...filters))
      .orderBy(asc(products.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    const productIds = pageRows.map((p) => p.id);
    const variants = productIds.length
      ? await db
          .select()
          .from(productVariants)
          .where(
            and(
              eq(productVariants.isActive, true),
              or(...productIds.map((id) => eq(productVariants.productId, id))),
            ),
          )
      : [];

    const items = pageRows.map((p) => ({
      ...p,
      variants: variants.filter((v) => v.productId === p.id),
    }));

    return NextResponse.json({
      items,
      nextCursor: hasMore ? pageRows[pageRows.length - 1].id : null,
    });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
