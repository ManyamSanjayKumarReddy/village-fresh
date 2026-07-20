import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCartDetails } from "@/lib/cart";
import { apiError, unexpectedApiError } from "@/lib/api-error";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHENTICATED", "Sign in required.", 401);
  }

  try {
    const cart = await getCartDetails(Number(session.user.id));
    return NextResponse.json(cart);
  } catch (error) {
    return unexpectedApiError(error);
  }
}
