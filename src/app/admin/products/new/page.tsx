import Link from "next/link";
import { NewProductForm } from "@/components/admin/new-product-form";
import { getCategories } from "@/lib/catalog";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Add product</h1>
      {categories.length === 0 ? (
        <p className="mt-4 text-muted-foreground">
          You need at least one category first —{" "}
          <Link href="/admin/categories" className="text-primary hover:underline">
            create one here
          </Link>
          .
        </p>
      ) : (
        <NewProductForm categories={categories} />
      )}
    </div>
  );
}
