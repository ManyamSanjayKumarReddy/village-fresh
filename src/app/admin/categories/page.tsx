import { asc } from "drizzle-orm";
import { NewCategoryForm } from "@/components/admin/new-category-form";
import { db } from "@/db";
import { categories } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const items = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Categories</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            {items.length === 0 ? "No categories yet." : "Existing categories"}
          </p>
          <div className="flex flex-col gap-2">
            {items.map((category) => (
              <div key={category.id} className="rounded-xl border bg-card p-4">
                <p className="font-medium">{category.name}</p>
                {category.teluguName && (
                  <p className="text-sm text-muted-foreground">{category.teluguName}</p>
                )}
                <p className="text-xs text-muted-foreground">/category/{category.slug}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">Add a category</p>
          <NewCategoryForm />
        </div>
      </div>
    </div>
  );
}
