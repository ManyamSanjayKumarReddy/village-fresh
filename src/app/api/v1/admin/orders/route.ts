import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { addresses, orders, users } from "@/db/schema";
import { listOrdersQuerySchema } from "@/lib/validations/orders";
import { zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = listOrdersQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  const { cursor, limit } = parsed.data;

  try {
    const filters = cursor ? [gt(orders.id, cursor)] : [];

    const rows = await db
      .select({
        order: orders,
        customerName: users.name,
        customerEmail: users.email,
        city: addresses.city,
        pincode: addresses.pincode,
      })
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .innerJoin(addresses, eq(orders.addressId, addresses.id))
      .where(and(...filters))
      .orderBy(desc(orders.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return NextResponse.json({
      items,
      nextCursor: hasMore ? items[items.length - 1].order.id : null,
    });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
