import { NewProductForm } from "@/components/admin/new-product-form";
import { getCategories } from "@/lib/catalog";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Add product</h1>
      <NewProductForm categories={categories} />
    </div>
  );
}
