import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  honeypot: z.string().max(0).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
