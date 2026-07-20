import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { apiError, unexpectedApiError } from "@/lib/api-error";

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
    const key = `products/${crypto.randomUUID()}.${extension}`;

    const blob = await put(key, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
