import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1);

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          tokenVersion: user.tokenVersion,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const [existing] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email.toLowerCase()))
          .limit(1);

        if (!existing) {
          await db.insert(users).values({
            name: user.name ?? user.email.split("@")[0],
            email: user.email.toLowerCase(),
            authProvider: "google",
            googleId: account.providerAccountId,
            emailVerified: true,
          });
        } else if (existing.authProvider === "credentials") {
          await db
            .update(users)
            .set({ authProvider: "both", googleId: account.providerAccountId })
            .where(eq(users.id, existing.id));
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user?.email) {
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, user.email.toLowerCase()))
          .limit(1);

        if (dbUser) {
          token.userId = dbUser.id;
          token.role = dbUser.role;
          token.tokenVersion = dbUser.tokenVersion;
        }
      }

      if (trigger === "update" && token.userId) {
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, token.userId as number))
          .limit(1);
        if (dbUser) {
          token.role = dbUser.role;
          token.tokenVersion = dbUser.tokenVersion;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId ?? "");
        session.user.role = token.role as "customer" | "admin";
      }
      return session;
    },
  },
});
