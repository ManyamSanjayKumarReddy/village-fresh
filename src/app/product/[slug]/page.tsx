import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { AddToCart } from "@/components/catalog/add-to-cart";
import { ProductImagePlaceholder } from "@/components/catalog/product-image-placeholder";
import { VegIndicator } from "@/components/catalog/veg-indicator";
import { getProductBySlug } from "@/lib/catalog";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-4 py-8 sm:grid-cols-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(min-width: 640px) 50vw, 100vw"
              priority
            />
          ) : (
            <ProductImagePlaceholder />
          )}
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
            {product.categoryName}
          </p>
          <h1 className="font-heading text-2xl font-semibold">{product.name}</h1>
          {product.teluguName && (
            <p className="text-muted-foreground">{product.teluguName}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <VegIndicator isVeg={product.isVeg} />
            {product.spiceLevel && <Badge variant="outline">{product.spiceLevel}</Badge>}
            {product.shelfLife && (
              <Badge variant="outline">Shelf life: {product.shelfLife}</Badge>
            )}
            <Badge variant="outline">No preservatives</Badge>
          </div>

          {product.shortDescription && (
            <p className="mt-4 text-muted-foreground">{product.shortDescription}</p>
          )}

          <div className="mt-6">
            <AddToCart
              productSlug={product.slug}
              productName={product.name}
              imageUrl={product.images[0]}
              variants={product.variants}
            />
          </div>

          {product.longDescription && (
            <div className="mt-8 border-t pt-6">
              <h2 className="font-heading text-lg font-semibold">The story behind it</h2>
              <p className="mt-2 whitespace-pre-line text-muted-foreground">
                {product.longDescription}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
