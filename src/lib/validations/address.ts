import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().max(50).optional(),
  line1: z.string().trim().min(3).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9][0-9]{9}$/, "Enter a valid 10-digit mobile number"),
  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
