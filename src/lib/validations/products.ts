import { z } from "zod";

export const listProductsQuerySchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.string().trim().min(1).max(160).optional(),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  search: z.string().trim().min(1).max(200).optional(),
});

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
