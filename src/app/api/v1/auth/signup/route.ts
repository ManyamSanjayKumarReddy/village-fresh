import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { signupSchema } from "@/lib/validations/auth";
import { apiError, zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  const { name, email, password } = parsed.data;

  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return apiError("EMAIL_TAKEN", "An account with this email already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        authProvider: "credentials",
      })
      .returning({ id: users.id, name: users.name, email: users.email });

    // TODO(phase 4): send verification email via Resend before checkout is allowed.

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
