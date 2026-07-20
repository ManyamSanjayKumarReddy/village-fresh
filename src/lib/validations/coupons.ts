import { z } from "zod";

export const validateCouponSchema = z.object({
  code: z.string().trim().toUpperCase().min(1).max(30),
  subtotalPaise: z.coerce.number().int().min(0),
});
