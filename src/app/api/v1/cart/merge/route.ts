import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mergeCartItems, getCartDetails } from "@/lib/cart";
import { mergeCartSchema } from "@/lib/validations/cart";
import { apiError, zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHENTICATED", "Sign in required.", 401);
  }

  const body = await request.json().catch(() => null);
  const parsed = mergeCartSchema.safeParse(body);
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  try {
    const userId = Number(session.user.id);
    await mergeCartItems(userId, parsed.data.items);
    const cart = await getCartDetails(userId);
    return NextResponse.json(cart);
  } catch (error) {
    return unexpectedApiError(error);
  }
}
