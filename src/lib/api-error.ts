import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
};

export function apiError(
  code: string,
  message: string,
  status: number,
  fields?: Record<string, string[]>,
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ error: { code, message, fields } }, { status });
}

export function zodApiError(error: ZodError): NextResponse<ApiErrorBody> {
  const fields = error.flatten().fieldErrors as Record<string, string[]>;
  return apiError("VALIDATION_ERROR", "Invalid request.", 400, fields);
}

export function unexpectedApiError(error: unknown): NextResponse<ApiErrorBody> {
  console.error(error);
  return apiError("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
}
