import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { QuickAddToCart } from "@/components/catalog/quick-add-to-cart";
import { formatPaise } from "@/lib/money";

type ProductCardVariant = {
  id: number;
  label: string;
  pricePaise: number;
};

export type ProductCardData = {
  slug: string;
  name: string;
  teluguName: string | null;
  shortDescription: string | null;
  images: string[];
  isVeg: boolean;
  isFeatured?: boolean;
  variants: ProductCardVariant[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const cheapest = [...product.variants].sort((a, b) => a.pricePaise - b.pricePaise)[0];

  return (
    <Card className="overflow-hidden py-0 gap-0 transition-shadow hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-square w-full bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
              Photo coming soon
            </div>
          )}
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            <Badge variant={product.isVeg ? "secondary" : "destructive"}>
              {product.isVeg ? "Veg" : "Non-veg"}
            </Badge>
            {product.isFeatured && (
              <Badge className="bg-accent text-accent-foreground">Bestseller</Badge>
            )}
          </div>
        </div>
        <CardContent className="p-4 pb-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
            Home-made
          </p>
          <h3 className="font-heading text-base leading-tight">{product.name}</h3>
          {product.teluguName && (
            <p className="text-sm text-muted-foreground">{product.teluguName}</p>
          )}
          {product.shortDescription && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {product.shortDescription}
            </p>
          )}
          {cheapest && (
            <p className="mt-2 font-heading text-lg font-semibold text-primary">
              From {formatPaise(cheapest.pricePaise)}
            </p>
          )}
        </CardContent>
      </Link>

      {cheapest && (
        <CardContent className="p-4 pt-3">
          <QuickAddToCart
            productSlug={product.slug}
            productName={product.name}
            imageUrl={product.images[0]}
            variant={cheapest}
          />
        </CardContent>
      )}
    </Card>
  );
}
