import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "customer" | "admin";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: number;
    role?: "customer" | "admin";
    tokenVersion?: number;
  }
}
