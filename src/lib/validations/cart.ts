import { z } from "zod";

export const mergeCartSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().min(1).max(99),
        extraSpicy: z.boolean().optional(),
      }),
    )
    .max(100),
});

export type MergeCartInput = z.infer<typeof mergeCartSchema>;
