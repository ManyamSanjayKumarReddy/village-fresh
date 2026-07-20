import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.coerce.number().int().positive(),
  idempotencyKey: z.string().trim().min(8).max(128),
  couponCode: z.string().trim().toUpperCase().min(1).max(30).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const listOrdersQuerySchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
