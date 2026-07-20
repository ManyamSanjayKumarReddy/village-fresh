import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { serviceablePincodes } from "@/db/schema";
import { updatePincodeSchema } from "@/lib/validations/admin";
import { apiError, zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pincodeId = Number(id);
  if (!Number.isInteger(pincodeId) || pincodeId <= 0) {
    return apiError("INVALID_PINCODE_ID", "Invalid pincode id.", 400);
  }

  const body = await request.json().catch(() => null);
  const parsed = updatePincodeSchema.safeParse(body);
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  try {
    const [pincode] = await db
      .update(serviceablePincodes)
      .set(parsed.data)
      .where(eq(serviceablePincodes.id, pincodeId))
      .returning();

    if (!pincode) {
      return apiError("PINCODE_NOT_FOUND", "Pincode not found.", 404);
    }

    return NextResponse.json({ pincode });
  } catch (error) {
    return unexpectedApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pincodeId = Number(id);
  if (!Number.isInteger(pincodeId) || pincodeId <= 0) {
    return apiError("INVALID_PINCODE_ID", "Invalid pincode id.", 400);
  }

  try {
    const [pincode] = await db
      .delete(serviceablePincodes)
      .where(eq(serviceablePincodes.id, pincodeId))
      .returning({ id: serviceablePincodes.id });

    if (!pincode) {
      return apiError("PINCODE_NOT_FOUND", "Pincode not found.", 404);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
