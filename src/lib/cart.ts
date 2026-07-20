import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { carts, cartItems, productVariants, products } from "@/db/schema";

export async function getOrCreateCartId(userId: number): Promise<number> {
  const [existing] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  if (existing) return existing.id;

  const [created] = await db.insert(carts).values({ userId }).returning({ id: carts.id });
  return created.id;
}

export async function mergeCartItems(
  userId: number,
  items: { variantId: number; quantity: number }[],
) {
  if (items.length === 0) return;

  const cartId = await getOrCreateCartId(userId);

  for (const item of items) {
    await db
      .insert(cartItems)
      .values({ cartId, variantId: item.variantId, quantity: item.quantity })
      .onConflictDoUpdate({
        target: [cartItems.cartId, cartItems.variantId],
        set: { quantity: sql`${cartItems.quantity} + ${item.quantity}` },
      });
  }
}

export async function getCartDetails(userId: number) {
  const [cart] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);

  if (!cart) {
    return { cartId: null, items: [], subtotalPaise: 0 };
  }

  const rows = await db
    .select({
      variantId: productVariants.id,
      variantLabel: productVariants.label,
      pricePaise: productVariants.pricePaise,
      stockQty: productVariants.stockQty,
      quantity: cartItems.quantity,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      images: products.images,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(cartItems.cartId, cart.id));

  const subtotalPaise = rows.reduce((sum, r) => sum + r.pricePaise * r.quantity, 0);

  return { cartId: cart.id, items: rows, subtotalPaise };
}

export async function clearCart(cartId: number) {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
}
