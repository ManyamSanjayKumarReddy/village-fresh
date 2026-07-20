import Image from "next/image";
import Link from "next/link";
import { Leaf, CookingPot, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { ProductCard } from "@/components/catalog/product-card";
import { buttonVariants } from "@/components/ui/button";
import { getCategories, getFeaturedProducts, getProductsByCategory } from "@/lib/catalog";
import { STOCK_IMAGES } from "@/lib/stock-images";
import { cn } from "@/lib/utils";

export const revalidate = 60;

const VALUE_PROPS = [
  {
    icon: CookingPot,
    title: "Cooked the old way",
    description: "Small batches, slow methods, recipes passed down in the family — not a factory line.",
  },
  {
    icon: Leaf,
    title: "From our fields to your kitchen",
    description: "Groundnuts, mangoes and greens picked from the village, not sourced from a wholesaler.",
  },
  {
    icon: ShieldCheck,
    title: "Nothing hidden in the jar",
    description: "Just spice, oil, salt and patience. No preservatives, no shortcuts.",
  },
];

const ROW_SIZE = 4;

export default async function Home() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
  ]);

  const categoryRows = await Promise.all(
    categories.map(async (category) => ({
      category,
      products: (await getProductsByCategory(category.id)).slice(0, ROW_SIZE),
    })),
  );

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />

      <section className="relative flex min-h-[420px] items-center justify-center overflow-hidden text-center sm:min-h-[480px]">
        <Image
          src="/images/hero-village.jpg"
          alt="A farmer with a bullock cart on a village road at sunset, palm trees and a farmhouse in the background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="relative z-10 mx-auto max-w-2xl px-4">
          <h1 className="font-heading text-3xl font-semibold text-white sm:text-5xl">
            Amma&apos;s kitchen, delivered to your door.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/90 sm:text-lg">
            Podis, pickles, farm produce and snacks — made by hand in a
            village kitchen, not a factory. Currently delivering across
            Chennai.
          </p>
          <Link href="#bestsellers" className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
            See what&apos;s fresh today
          </Link>
        </div>
      </section>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {VALUE_PROPS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col items-center gap-2 rounded-xl border bg-card px-6 py-6 text-center"
              >
                <Icon className="size-7 text-primary" />
                <h3 className="font-heading text-base font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {featuredProducts.length > 0 && (
          <section
            id="bestsellers"
            className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-12 sm:pb-16"
          >
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-heading text-xl font-semibold">What everyone reorders</h2>
                <p className="text-sm text-muted-foreground">
                  The jars that sell out first, every batch.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {categoryRows.map(
          ({ category, products }) =>
            products.length > 0 && (
              <section key={category.id} className="mx-auto max-w-6xl px-4 pb-12 sm:pb-16">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-semibold">{category.name}</h2>
                    {category.teluguName && (
                      <p className="text-sm text-muted-foreground">{category.teluguName}</p>
                    )}
                  </div>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ),
        )}

        <section className="relative flex min-h-[260px] items-center justify-center overflow-hidden text-center">
          <Image
            src={STOCK_IMAGES.cropRows}
            alt="Rows of crops on a village farm"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50" />
          <p className="relative z-10 mx-auto max-w-lg px-4 font-heading text-xl font-medium text-white sm:text-2xl">
            No warehouses, no middlemen — just our family, our farm, and our
            kitchen.
          </p>
        </section>
      </main>
    </div>
  );
}
