CREATE TYPE "public"."auth_provider" AS ENUM('google', 'credentials', 'both');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'cod');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'admin');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"label" varchar(50),
	"line1" text NOT NULL,
	"line2" text,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(160) NOT NULL,
	"telugu_name" text,
	"description" text,
	"image_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"product_name_snapshot" text NOT NULL,
	"variant_label_snapshot" varchar(50) NOT NULL,
	"unit_price_paise_snapshot" integer NOT NULL,
	"quantity" integer NOT NULL,
	"line_total_paise" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"status" "order_status" NOT NULL,
	"note" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"address_id" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"subtotal_paise" integer NOT NULL,
	"delivery_fee_paise" integer DEFAULT 0 NOT NULL,
	"total_paise" integer NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_provider" varchar(50),
	"idempotency_key" varchar(128),
	"placed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"label" varchar(50) NOT NULL,
	"price_paise" integer NOT NULL,
	"stock_qty" integer DEFAULT 0 NOT NULL,
	"sku" varchar(64),
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(160) NOT NULL,
	"telugu_name" text,
	"short_description" text,
	"long_description" text,
	"shelf_life" varchar(100),
	"spice_level" varchar(20),
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_veg" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "serviceable_pincodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"city" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text,
	"auth_provider" "auth_provider" DEFAULT 'credentials' NOT NULL,
	"google_id" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"phone" varchar(20),
	"token_version" integer DEFAULT 0 NOT NULL,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_address_id_addresses_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cart_items_cart_variant_idx" ON "cart_items" USING btree ("cart_id","variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "carts_user_id_idx" ON "carts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_idempotency_key_idx" ON "orders" USING btree ("idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_sku_idx" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "serviceable_pincodes_pincode_idx" ON "serviceable_pincodes" USING btree ("pincode");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");