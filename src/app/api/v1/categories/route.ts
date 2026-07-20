import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { unexpectedApiError } from "@/lib/api-error";

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
