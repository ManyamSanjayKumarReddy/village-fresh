"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductImageUploader({
  productId,
  imageUrl,
}: {
  productId: number;
  imageUrl?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(imageUrl);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/v1/admin/upload", {
      method: "POST",
      body: formData,
    });
    const uploadBody = await uploadRes.json().catch(() => null);

    if (!uploadRes.ok) {
      toast.error(uploadBody?.error?.message ?? "Could not upload image.");
      setUploading(false);
      return;
    }

    const url = uploadBody.url as string;

    const patchRes = await fetch(`/api/v1/admin/products/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: [url] }),
    });

    setUploading(false);

    if (!patchRes.ok) {
      const body = await patchRes.json().catch(() => null);
      toast.error(body?.error?.message ?? "Could not save image to product.");
      return;
    }

    setPreview(url);
    toast.success("Photo updated.");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
        {preview ? (
          <Image src={preview} alt="" fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImagePlus className="size-5" />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading..." : preview ? "Change photo" : "Add photo"}
      </Button>
    </div>
  );
}
