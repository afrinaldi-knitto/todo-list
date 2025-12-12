import { ZodError, ZodSchema } from "zod";
import { NextResponse } from "next/server";
import { errorResponse } from "./response";

/**
 * Format validation error dari Zod menjadi pesan yang user-friendly
 */
export function formatValidationError(error: ZodError): string[] {
  const errorMessages: string[] = [];
  const processedFields = new Set<string>();

  error.issues.forEach((issue) => {
    const field = issue.path[0] as string;

    if (issue.code === "invalid_type") {
      const receivedValue =
        typeof issue === "object" && issue !== null && "received" in issue
          ? String((issue as { received?: unknown }).received)
          : null;

      if (receivedValue === "undefined" || receivedValue === "null") {
        if (!processedFields.has(field)) {
          const fieldMessages: Record<string, string> = {
            username: "Username tidak boleh kosong",
            password: "Password tidak boleh kosong",
            type: "Type tidak boleh kosong",
          };

          const message = fieldMessages[field] || `${field} tidak boleh kosong`;
          errorMessages.push(message);
          processedFields.add(field);
        }
        return;
      }
    }

    if (!processedFields.has(field)) {
      errorMessages.push(issue.message);
      processedFields.add(field);
    }
  });

  return errorMessages;
}

/**
 * Validate request body dengan Zod schema
 * @param schema Zod schema untuk validasi
 * @param body Request body yang akan divalidasi
 * @returns Validated data jika berhasil, atau NextResponse error jika gagal
 */
export function validateRequest<T>(
  schema: ZodSchema<T>,
  body: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(body);

  if (!result.success) {
    const errorMessages = formatValidationError(result.error);
    return {
      success: false,
      response: NextResponse.json(
        errorMessages.length > 0
          ? errorResponse(errorMessages.join(", "))
          : errorResponse("Data tidak valid"),
        { status: 400 }
      ),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
