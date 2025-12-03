import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, AuthResult } from "./auth";
import { handleApiError } from "./error-handler";
import { parseJsonBody, validateNonEmptyBody, validateAllowedKeys } from "./request";
import { validateRequest } from "./validation";
import { ZodSchema } from "zod";
import { successResponse } from "./response";

/**
 * Context yang tersedia untuk route handler
 */
export interface ApiContext {
  userId: string;
  auth: AuthResult;
  params?: Record<string, string>;
  validatedData?: unknown;
  body?: unknown;
}

/**
 * Route handler function type
 */
export type RouteHandler<T = unknown> = (
  request: NextRequest,
  context: ApiContext
) => Promise<NextResponse | T>;

/**
 * Options untuk API handler
 */
export interface ApiHandlerOptions {
  /** Apakah route memerlukan authentication (default: true) */
  requireAuth?: boolean;
  /** Zod schema untuk validasi request body */
  schema?: ZodSchema;
  /** Apakah body harus tidak kosong (default: false) */
  requireBody?: boolean;
  /** Key yang diizinkan di body (untuk partial update) */
  allowedKeys?: string[];
}

/**
 * Wrapper untuk route handler dengan middleware pattern
 * Menangani authentication, validation, dan error handling secara otomatis
 */
export function createApiHandler<T = unknown>(
  handler: RouteHandler<T>,
  options: ApiHandlerOptions = {}
) {
  const {
    requireAuth = true,
    schema,
    requireBody = false,
    allowedKeys,
  } = options;

  return async (
    request: NextRequest,
    context?: { params?: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    try {
      // 1. Authentication
      let auth: AuthResult | undefined;
      if (requireAuth) {
        const authResult = await authenticateRequest(request);
        if (authResult instanceof NextResponse) {
          return authResult; // Error response
        }
        auth = authResult;
      }

      // 2. Parse params jika ada
      const params = context?.params ? await context.params : {};

      // 3. Parse JSON body jika diperlukan
      let body: unknown = undefined;
      if (schema || requireBody || allowedKeys) {
        const parseResult = await parseJsonBody(request);
        if (!parseResult.success) {
          return parseResult.response;
        }
        body = parseResult.data;
      }

      // 4. Validate body tidak kosong jika diperlukan
      if (requireBody && body !== undefined) {
        const validateResult = validateNonEmptyBody(body);
        if (!validateResult.success) {
          return validateResult.response;
        }
      }

      // 5. Validate allowed keys jika diperlukan
      if (allowedKeys && body !== undefined) {
        const validateResult = validateAllowedKeys(body, allowedKeys);
        if (!validateResult.success) {
          return validateResult.response;
        }
      }

      // 6. Validate dengan schema jika ada
      let validatedData: unknown = body;
      if (schema && body !== undefined) {
        const validateResult = validateRequest(schema, body);
        if (!validateResult.success) {
          return validateResult.response;
        }
        validatedData = validateResult.data;
      }

      // 7. Create context untuk handler
      const apiContext: ApiContext = {
        userId: auth?.userId || "",
        auth: auth!,
        params,
        validatedData,
        body,
      };

      // 8. Execute handler
      const result = await handler(request, apiContext);

      // 9. Handle result
      if (result instanceof NextResponse) {
        return result;
      }

      // Jika handler return data langsung, wrap dengan success response
      return NextResponse.json(successResponse(result));
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Helper untuk membuat route handler tanpa authentication
 */
export function createPublicApiHandler<T = unknown>(
  handler: RouteHandler<T>,
  options: Omit<ApiHandlerOptions, "requireAuth"> = {}
) {
  return createApiHandler(handler, { ...options, requireAuth: false });
}

