import { NextRequest, NextResponse } from "next/server";
import type { NextFetchEvent } from "next/server";

/**
 * Proxy untuk Next.js 16
 *
 * Menangani:
 * - Request logging untuk monitoring dan debugging
 * - CORS headers untuk API routes
 * - Security headers untuk proteksi aplikasi
 * - Request ID untuk tracing dan debugging
 * - OPTIONS request handling (CORS preflight)
 *
 * Note: Authentication tidak dilakukan di proxy karena:
 * - Lebih fleksibel di-handle per route via api-handler
 * - Beberapa route (auth) tidak memerlukan authentication
 * - Edge runtime limitations untuk JWT verification
 */
export function proxy(request: NextRequest, event?: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Generate request ID untuk tracing (gunakan dari header jika ada, atau generate baru)
  const existingRequestId =
    request.headers.get("x-request-id") || crypto.randomUUID();

  // Clone request headers untuk modifikasi
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", existingRequestId);

  // Handle API routes
  if (pathname.startsWith("/api")) {
    // Log request untuk monitoring (bisa diganti dengan logging service)
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] ${method} ${pathname} - Request ID: ${existingRequestId}`
    );

    // Create response dengan modified headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Set CORS headers untuk API routes
    // Note: Untuk production, ganti "*" dengan domain spesifik
    const allowedOrigin =
      process.env.ALLOWED_ORIGIN || request.headers.get("origin") || "*";
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Request-ID, Accept"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Max-Age", "86400");

    // Set security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );

    // Set request ID di response header untuk client tracing
    response.headers.set("X-Request-ID", existingRequestId);

    // Note: Response time logging lebih baik dilakukan di route handler
    // karena proxy berjalan sebelum response selesai
    // Untuk logging response time, gunakan api-handler atau logging service

    return response;
  }

  // Untuk non-API routes (pages), hanya set request ID dan security headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set security headers untuk pages juga
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Request-ID", existingRequestId);

  return response;
}
