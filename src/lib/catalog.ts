import { unstable_cache } from "next/cache";
import { and, asc, eq, ilike, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { categories, productVariants, products } from "@/db/schema";

const CACHE_REVALIDATE_SECONDS = 60;

export const getCategories = unstable_cache(
  async () => {
    return db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name));
  },
  ["categories:list"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["categories"] },
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    return category ?? null;
  },
  ["categories:by-slug"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["categories"] },
);

export const getFeaturedProducts = unstable_cache(
  async (limit = 8) => {
    const rows = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        teluguName: products.teluguName,
        shortDescription: products.shortDescription,
        images: products.images,
        isVeg: products.isVeg,
        categorySlug: categories.slug,
        categoryName: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
      .limit(limit);

    return attachVariants(rows);
  },
  ["products:featured"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["products"] },
);

export const getProductsByCategory = unstable_cache(
  async (categoryId: number) => {
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
      .where(and(eq(products.isActive, true), eq(products.categoryId, categoryId)))
      .orderBy(asc(products.name));

    return attachVariants(rows);
  },
  ["products:by-category"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["products"] },
);

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
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
        categorySlug: categories.slug,
        categoryName: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.isActive, true), eq(products.slug, slug)))
      .limit(1);

    if (!product) return null;

    const variants = await db
      .select()
      .from(productVariants)
      .where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true)));

    return { ...product, variants };
  },
  ["products:by-slug"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["products"] },
);

export const searchProducts = unstable_cache(
  async (query: string) => {
    const term = `%${query}%`;
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
      .where(
        and(
          eq(products.isActive, true),
          or(
            ilike(products.name, term),
            ilike(products.teluguName, term),
            ilike(products.shortDescription, term),
          ),
        ),
      )
      .orderBy(asc(products.name));

    return attachVariants(rows);
  },
  ["products:search"],
  { revalidate: CACHE_REVALIDATE_SECONDS, tags: ["products"] },
);

type ProductRow = {
  id: number;
  name: string;
  slug: string;
  teluguName: string | null;
  shortDescription: string | null;
  images: string[];
  isVeg: boolean;
  isFeatured?: boolean;
  categorySlug: string;
  categoryName: string;
};

async function attachVariants(rows: ProductRow[]) {
  if (!rows.length) return [];

  const productIds = rows.map((r) => r.id);
  const variants = await db
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.isActive, true), inArray(productVariants.productId, productIds)));

  const variantsByProduct = new Map<number, typeof variants>();
  for (const v of variants) {
    const list = variantsByProduct.get(v.productId) ?? [];
    list.push(v);
    variantsByProduct.set(v.productId, list);
  }

  return rows.map((r) => ({ ...r, variants: variantsByProduct.get(r.id) ?? [] }));
}
