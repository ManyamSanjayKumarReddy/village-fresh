import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { createCategorySchema } from "@/lib/validations/admin";
import { apiError, zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const items = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name));

    return NextResponse.json({ items });
  } catch (error) {
    return unexpectedApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  try {
    const [existing] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, parsed.data.slug))
      .limit(1);

    if (existing) {
      return apiError("SLUG_TAKEN", "A category with this slug already exists.", 409);
    }

    const [category] = await db.insert(categories).values(parsed.data).returning();

    revalidateTag("categories");

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
