import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { buttonVariants } from "@/components/ui/button";
import { ProductToggle } from "@/components/admin/product-toggle";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import { VariantEditor } from "@/components/admin/variant-editor";
import { db } from "@/db";
import { categories, productVariants, products } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      images: products.images,
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className={buttonVariants()}>
          Add product
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {rows.map((product) => (
          <div key={product.id} className="rounded-xl border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.categoryName}</p>
              </div>
              <div className="flex items-center gap-4">
                <ProductToggle
                  productId={product.id}
                  field="isActive"
                  value={product.isActive}
                  label="Active"
                />
                <ProductToggle
                  productId={product.id}
                  field="isFeatured"
                  value={product.isFeatured}
                  label="Featured"
                />
              </div>
            </div>

            <div className="mt-3">
              <ProductImageUploader productId={product.id} imageUrl={product.images[0]} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(variantsByProduct.get(product.id) ?? []).map((variant) => (
                <VariantEditor
                  key={variant.id}
                  variantId={variant.id}
                  label={variant.label}
                  pricePaise={variant.pricePaise}
                  stockQty={variant.stockQty}
                  isActive={variant.isActive}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
