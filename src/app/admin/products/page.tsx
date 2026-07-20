import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { buttonVariants } from "@/components/ui/button";
import { ProductToggle } from "@/components/admin/product-toggle";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import { VariantEditor } from "@/components/admin/variant-editor";
import { AddVariantForm } from "@/components/admin/add-variant-form";
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
      categoryId: categories.id,
      categoryName: categories.name,
      categorySortOrder: categories.sortOrder,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(categories.sortOrder), asc(categories.name), asc(products.name));

  const variants = await db.select().from(productVariants);
  const variantsByProduct = new Map<number, typeof variants>();
  for (const v of variants) {
    const list = variantsByProduct.get(v.productId) ?? [];
    list.push(v);
    variantsByProduct.set(v.productId, list);
  }

  const productsByCategory = new Map<number, { name: string; products: typeof rows }>();
  for (const product of rows) {
    const group = productsByCategory.get(product.categoryId);
    if (group) {
      group.products.push(product);
    } else {
      productsByCategory.set(product.categoryId, {
        name: product.categoryName,
        products: [product],
      });
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className={buttonVariants()}>
          Add product
        </Link>
      </div>

      {productsByCategory.size === 0 ? (
        <p className="mt-8 text-muted-foreground">No products yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {[...productsByCategory.values()].map((group) => (
            <section key={group.name}>
              <h2 className="font-heading text-lg font-semibold">{group.name}</h2>
              <div className="mt-3 flex flex-col gap-4">
                {group.products.map((product) => (
                  <div key={product.id} className="rounded-xl border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{product.name}</p>
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

                    <div className="mt-3 flex flex-wrap items-center gap-2">
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
                      <AddVariantForm productId={product.id} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
