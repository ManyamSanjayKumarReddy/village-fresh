import { Navbar } from "@/components/layout/navbar";
import { ProductCard } from "@/components/catalog/product-card";
import { searchProducts } from "@/lib/catalog";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? await searchProducts(query) : [];

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <h1 className="font-heading text-2xl font-semibold">
          {query ? `Results for "${query}"` : "Search"}
        </h1>

        {query && results.length === 0 && (
          <p className="mt-8 text-muted-foreground">
            No products matched — try a different word, like a category name
            or ingredient.
          </p>
        )}

        {results.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
