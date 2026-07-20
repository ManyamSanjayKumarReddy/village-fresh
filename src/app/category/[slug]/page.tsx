import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { ProductCard } from "@/components/catalog/product-card";
import { getCategories, getCategoryBySlug, getProductsByCategory } from "@/lib/catalog";

export const revalidate = 60;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const products = await getProductsByCategory(category.id);

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <h1 className="font-heading text-2xl font-semibold">{category.name}</h1>
        {category.teluguName && (
          <p className="text-muted-foreground">{category.teluguName}</p>
        )}
        {category.description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>
        )}

        {products.length === 0 ? (
          <p className="mt-8 text-muted-foreground">
            Nothing listed here yet — we&apos;re always adding more, check back soon.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
