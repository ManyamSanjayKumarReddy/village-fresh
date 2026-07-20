import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const authProviderEnum = pgEnum("auth_provider", [
  "google",
  "credentials",
  "both",
]);

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "cod",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: text("password_hash"),
  authProvider: authProviderEnum("auth_provider").notNull().default("credentials"),
  googleId: text("google_id"),
  emailVerified: boolean("email_verified").notNull().default(false),
  phone: varchar("phone", { length: 20 }),
  tokenVersion: integer("token_version").notNull().default(0),
  role: userRoleEnum("role").notNull().default("customer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
}));

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 50 }),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 160 }).notNull(),
  teluguName: text("telugu_name"),
  description: text("description"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => ({
  slugIdx: uniqueIndex("categories_slug_idx").on(table.slug),
}));

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 160 }).notNull(),
  teluguName: text("telugu_name"),
  shortDescription: text("short_description"),
  longDescription: text("long_description"),
  shelfLife: varchar("shelf_life", { length: 100 }),
  spiceLevel: varchar("spice_level", { length: 20 }),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  isVeg: boolean("is_veg").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex("products_slug_idx").on(table.slug),
}));

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 50 }).notNull(),
  pricePaise: integer("price_paise").notNull(),
  stockQty: integer("stock_qty").notNull().default(0),
  sku: varchar("sku", { length: 64 }),
  isActive: boolean("is_active").notNull().default(true),
}, (table) => ({
  skuIdx: uniqueIndex("product_variants_sku_idx").on(table.sku),
}));

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdx: uniqueIndex("carts_user_id_idx").on(table.userId),
}));

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  variantId: integer("variant_id").notNull().references(() => productVariants.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull().default(1),
  extraSpicy: boolean("extra_spicy").notNull().default(false),
}, (table) => ({
  cartVariantIdx: uniqueIndex("cart_items_cart_variant_idx").on(table.cartId, table.variantId),
}));

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  addressId: integer("address_id").notNull().references(() => addresses.id, { onDelete: "restrict" }),
  status: orderStatusEnum("status").notNull().default("pending"),
  subtotalPaise: integer("subtotal_paise").notNull(),
  deliveryFeePaise: integer("delivery_fee_paise").notNull().default(0),
  totalPaise: integer("total_paise").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  paymentProvider: varchar("payment_provider", { length: 50 }),
  idempotencyKey: varchar("idempotency_key", { length: 128 }),
  placedAt: timestamp("placed_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  idempotencyIdx: uniqueIndex("orders_idempotency_key_idx").on(table.idempotencyKey),
}));

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  variantId: integer("variant_id").notNull().references(() => productVariants.id, { onDelete: "restrict" }),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  variantLabelSnapshot: varchar("variant_label_snapshot", { length: 50 }).notNull(),
  unitPricePaiseSnapshot: integer("unit_price_paise_snapshot").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotalPaise: integer("line_total_paise").notNull(),
  extraSpicy: boolean("extra_spicy").notNull().default(false),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  note: text("note"),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const serviceablePincodes = pgTable("serviceable_pincodes", {
  id: serial("id").primaryKey(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
}, (table) => ({
  pincodeIdx: uniqueIndex("serviceable_pincodes_pincode_idx").on(table.pincode),
}));

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  variant: one(productVariants, { fields: [cartItems.variantId], references: [productVariants.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  address: one(addresses, { fields: [orders.addressId], references: [addresses.id] }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  variant: one(productVariants, { fields: [orderItems.variantId], references: [productVariants.id] }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, { fields: [orderStatusHistory.orderId], references: [orders.id] }),
}));
