// lib/utils/apiError.ts
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

/**
 * Standardizes API error responses and logs the error.
 * Also reports to Sentry.
 * @param error The error object or message
 * @param status HTTP status code (default: 500)
 * @param context Optional context for logging
 */
export function apiErrorResponse(
  error: unknown,
  status: number = 500,
  context?: string,
) {
  let message = "Internal server error";
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }
  if (context) {
    // eslint-disable-next-line no-console
    console.error(`[API ERROR] [${context}]`, error);
  } else {
    // eslint-disable-next-line no-console
    console.error("[API ERROR]", error);
  }
  // Report to Sentry
  Sentry.captureException(error, { extra: { context } });
  return NextResponse.json({ success: false, error: message }, { status });
}
