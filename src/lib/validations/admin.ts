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
  images: z.array(z.string().url()).max(5).optional(),
});

export const createVariantSchema = z.object({
  label: z.string().trim().min(1).max(50),
  pricePaise: z.coerce.number().int().positive(),
  stockQty: z.coerce.number().int().min(0),
});

export const updateVariantSchema = z.object({
  pricePaise: z.coerce.number().int().positive().optional(),
  stockQty: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(160)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only"),
  teluguName: z.string().trim().max(200).optional(),
  description: z.string().trim().max(500).optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export const createPincodeSchema = z.object({
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"),
  city: z.string().trim().min(2).max(100),
});

export const updatePincodeSchema = z.object({
  isActive: z.boolean(),
});

export const createCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(3)
      .max(30)
      .regex(/^[A-Z0-9]+$/, "Use letters and numbers only"),
    title: z.string().trim().min(2).max(200),
    discountType: z.enum(["percentage", "flat"]),
    discountValue: z.coerce.number().int().positive(),
    minOrderSubtotalPaise: z.coerce.number().int().min(0).default(0),
    maxDiscountPaise: z.coerce.number().int().positive().optional(),
    startsAt: z.string().datetime().optional().or(z.literal("")),
    endsAt: z.string().datetime().optional().or(z.literal("")),
    maxRedemptions: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => data.discountType !== "percentage" || data.discountValue <= 100, {
    message: "Percentage discount can't exceed 100.",
    path: ["discountValue"],
  });

export const updateCouponSchema = z.object({
  isActive: z.boolean(),
});
