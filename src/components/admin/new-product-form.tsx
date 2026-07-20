"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = { id: number; name: string };

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewProductForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ? String(categories[0].id) : "");
  const [teluguName, setTeluguName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [longDescription, setLongDescription] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [variantLabel, setVariantLabel] = useState("250g");
  const [variantPrice, setVariantPrice] = useState("");
  const [variantStock, setVariantStock] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/v1/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId: Number(categoryId),
        name,
        slug,
        teluguName: teluguName || undefined,
        shortDescription: shortDescription || undefined,
        longDescription: longDescription || undefined,
        isVeg,
        variantLabel,
        variantPricePaise: Math.round(Number(variantPrice) * 100),
        variantStockQty: Number(variantStock),
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error?.message ?? "Could not create product.");
      return;
    }

    toast.success(`${name} created.`);
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-xl flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="category">Category</Label>
        <Select value={categoryId} onValueChange={(value) => value && setCategoryId(value)}>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugEdited) setSlug(slugify(e.target.value));
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">URL slug</Label>
        <Input
          id="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlug(slugify(e.target.value));
            setSlugEdited(true);
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="teluguName">Regional-language name (optional)</Label>
        <Input id="teluguName" value={teluguName} onChange={(e) => setTeluguName(e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="shortDescription">Short description</Label>
        <Input
          id="shortDescription"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="longDescription">Long description</Label>
        <Textarea
          id="longDescription"
          rows={4}
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isVeg} onChange={(e) => setIsVeg(e.target.checked)} />
        Vegetarian
      </label>

      <div className="rounded-xl border p-4">
        <p className="mb-3 text-sm font-medium">First variant</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="variantLabel">Label</Label>
            <Input
              id="variantLabel"
              required
              value={variantLabel}
              onChange={(e) => setVariantLabel(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="variantPrice">Price (₹)</Label>
            <Input
              id="variantPrice"
              required
              inputMode="decimal"
              value={variantPrice}
              onChange={(e) => setVariantPrice(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="variantStock">Stock qty</Label>
            <Input
              id="variantStock"
              required
              inputMode="numeric"
              value={variantStock}
              onChange={(e) => setVariantStock(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={saving || !categoryId}>
        {saving ? "Creating..." : "Create product"}
      </Button>
    </form>
  );
}
