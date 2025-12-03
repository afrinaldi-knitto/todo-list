import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "./response";

/**
 * Parse JSON dari request body dengan error handling
 */
export async function parseJsonBody<T = unknown>(
  request: NextRequest
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    return { success: true, data: body as T };
  } catch {
    return {
      success: false,
      response: NextResponse.json(errorResponse("Format JSON tidak valid"), {
        status: 400,
      }),
    };
  }
}

/**
 * Validate bahwa body tidak kosong
 */
export function validateNonEmptyBody(
  body: unknown
): { success: true } | { success: false; response: NextResponse } {
  if (!body || (typeof body === "object" && Object.keys(body).length === 0)) {
    return {
      success: false,
      response: NextResponse.json(
        errorResponse("Payload tidak boleh kosong"),
        { status: 400 }
      ),
    };
  }

  return { success: true };
}

/**
 * Validate bahwa hanya key yang valid yang ada di body
 */
export function validateAllowedKeys(
  body: unknown,
  allowedKeys: string[]
): { success: true } | { success: false; response: NextResponse } {
  if (!body || typeof body !== "object") {
    return { success: true };
  }

  const invalidKeys = Object.keys(body).filter(
    (key) => !allowedKeys.includes(key)
  );

  if (invalidKeys.length > 0) {
    return {
      success: false,
      response: NextResponse.json(
        errorResponse(
          `Key yang tidak valid: ${invalidKeys.join(
            ", "
          )}. Key yang dapat diterima: ${allowedKeys.join(", ")}`
        ),
        { status: 400 }
      ),
    };
  }

  return { success: true };
}

