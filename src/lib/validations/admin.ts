import { z } from "zod";

export const orderStatusEnum = z.enum([
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
  note: z.string().trim().max(500).optional(),
});

export const createProductSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(200),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  teluguName: z.string().trim().max(200).optional(),
  shortDescription: z.string().trim().max(300).optional(),
  longDescription: z.string().trim().max(4000).optional(),
  shelfLife: z.string().trim().max(100).optional(),
  spiceLevel: z.string().trim().max(20).optional(),
  isVeg: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  variantLabel: z.string().trim().min(1).max(50),
  variantPricePaise: z.coerce.number().int().positive(),
  variantStockQty: z.coerce.number().int().min(0),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  shortDescription: z.string().trim().max(300).optional(),
  longDescription: z.string().trim().max(4000).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const updateVariantSchema = z.object({
  pricePaise: z.coerce.number().int().positive().optional(),
  stockQty: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
