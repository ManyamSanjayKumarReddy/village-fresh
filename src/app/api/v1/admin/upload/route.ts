import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { apiError, unexpectedApiError } from "@/lib/api-error";
import { IS_LOCAL } from "@/lib/env";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return apiError("NO_FILE", "No file uploaded.", 400);
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return apiError("INVALID_FILE_TYPE", "Only JPEG, PNG, WEBP or AVIF images are allowed.", 400);
  }

  if (file.size > MAX_SIZE_BYTES) {
    return apiError("FILE_TOO_LARGE", "Image must be under 5MB.", 400);
  }

  try {
    const extension = file.name.split(".").pop() ?? "jpg";
    const filename = `${crypto.randomUUID()}.${extension}`;

    const url = IS_LOCAL
      ? await saveLocal(file, filename)
      : await saveToBlob(file, filename);

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    return unexpectedApiError(error);
  }
}

async function saveLocal(file: File, filename: string): Promise<string> {
  const dir = path.join(process.cwd(), "public", "storage", "products");
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/storage/products/${filename}`;
}

async function saveToBlob(file: File, filename: string): Promise<string> {
  const { put } = await import("@vercel/blob");
  const blob = await put(`products/${filename}`, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}
