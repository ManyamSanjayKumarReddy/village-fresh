import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, gt } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  addresses,
  coupons,
  orderItems,
  orderStatusHistory,
  orders,
  productVariants,
  serviceablePincodes,
} from "@/db/schema";
import { clearCart, getCartDetails } from "@/lib/cart";
import { calculateDeliveryFeePaise } from "@/lib/orders";
import { validateCoupon } from "@/lib/coupons";
import { createOrderSchema, listOrdersQuerySchema } from "@/lib/validations/orders";
import { apiError, zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHENTICATED", "Sign in required.", 401);
  }

  const { searchParams } = new URL(request.url);
  const parsed = listOrdersQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  const { cursor, limit } = parsed.data;
  const userId = Number(session.user.id);

  try {
    const filters = [eq(orders.userId, userId)];
    if (cursor) filters.push(gt(orders.id, cursor));

    const rows = await db
      .select()
      .from(orders)
      .where(and(...filters))
      .orderBy(desc(orders.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return NextResponse.json({
      items,
      nextCursor: hasMore ? items[items.length - 1].id : null,
    });
  } catch (error) {
    return unexpectedApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHENTICATED", "Sign in required.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  const userId = Number(session.user.id);
  const { addressId, idempotencyKey, couponCode } = parsed.data;

  try {
    const [existingOrder] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.idempotencyKey, idempotencyKey)))
      .limit(1);

    if (existingOrder) {
      return NextResponse.json({ order: existingOrder }, { status: 200 });
    }

    const [address] = await db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .limit(1);

    if (!address) {
      return apiError("ADDRESS_NOT_FOUND", "That address was not found.", 404);
    }

    const [pincode] = await db
      .select()
      .from(serviceablePincodes)
      .where(
        and(eq(serviceablePincodes.pincode, address.pincode), eq(serviceablePincodes.isActive, true)),
      )
      .limit(1);

    if (!pincode) {
      return apiError(
        "PINCODE_NOT_SERVICEABLE",
        "Sorry, we don't deliver to this pincode yet — currently Chennai only.",
        422,
      );
    }

    const cart = await getCartDetails(userId);
    if (!cart.cartId || cart.items.length === 0) {
      return apiError("CART_EMPTY", "Your cart is empty.", 422);
    }

    for (const item of cart.items) {
      if (item.quantity > item.stockQty) {
        return apiError(
          "OUT_OF_STOCK",
          `${item.productName} (${item.variantLabel}) only has ${item.stockQty} left in stock.`,
          422,
        );
      }
    }

    const subtotalPaise = cart.subtotalPaise;
    const deliveryFeePaise = calculateDeliveryFeePaise(subtotalPaise);

    let discountPaise = 0;
    let appliedCoupon: typeof coupons.$inferSelect | null = null;

    if (couponCode) {
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, couponCode))
        .limit(1);

      if (!coupon) {
        return apiError("COUPON_NOT_FOUND", "That coupon code doesn't exist.", 404);
      }

      const result = validateCoupon(coupon, subtotalPaise);
      if (!result.ok) {
        return apiError("COUPON_INVALID", result.reason, 422);
      }

      discountPaise = result.discountPaise;
      appliedCoupon = coupon;
    }

    const totalPaise = subtotalPaise + deliveryFeePaise - discountPaise;

    // Not wrapped in a DB transaction: the neon-http driver used here (chosen
    // for network reasons, see project notes) doesn't support db.transaction().
    // The idempotency key check above is the main guard against duplicate
    // orders from retries; a step failing mid-sequence is an accepted v1 risk.
    const [order] = await db
      .insert(orders)
      .values({
        userId,
        addressId,
        status: "confirmed",
        subtotalPaise,
        deliveryFeePaise,
        couponCode: appliedCoupon?.code,
        discountPaise,
        totalPaise,
        paymentStatus: "cod",
        paymentProvider: "cod",
        idempotencyKey,
      })
      .returning();

    if (appliedCoupon) {
      await db
        .update(coupons)
        .set({ timesRedeemed: appliedCoupon.timesRedeemed + 1 })
        .where(eq(coupons.id, appliedCoupon.id));
    }

    await db.insert(orderItems).values(
      cart.items.map((item) => ({
        orderId: order.id,
        variantId: item.variantId,
        productNameSnapshot: item.productName,
        variantLabelSnapshot: item.variantLabel,
        unitPricePaiseSnapshot: item.pricePaise,
        quantity: item.quantity,
        lineTotalPaise: item.pricePaise * item.quantity,
        extraSpicy: item.extraSpicy,
      })),
    );

    await db.insert(orderStatusHistory).values({
      orderId: order.id,
      status: "confirmed",
      note: "Order placed (Cash on Delivery).",
    });

    for (const item of cart.items) {
      await db
        .update(productVariants)
        .set({ stockQty: item.stockQty - item.quantity })
        .where(eq(productVariants.id, item.variantId));
    }

    await clearCart(cart.cartId);

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
