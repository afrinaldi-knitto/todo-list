import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JWTPayload } from "./jwt";
import { errorResponse } from "./response";

/**
 * Result dari authentication
 */
export interface AuthResult {
  userId: string;
  payload: JWTPayload;
}

/**
 * Extract dan verify token dari request
 * @param request NextRequest object
 * @returns AuthResult jika berhasil, atau NextResponse error jika gagal
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult | NextResponse> {
  // Ambil token dari Authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      errorResponse("Token autentikasi tidak ditemukan"),
      { status: 401 }
    );
  }

  // Ekstrak token dari header
  const token = authHeader.substring(7);

  // Verifikasi token dan ambil user ID
  try {
    const decoded = verifyToken(token);
    
    // Validasi user ID
    if (!decoded.id || decoded.id.trim() === "") {
      return NextResponse.json(errorResponse("User ID tidak valid"), {
        status: 400,
      });
    }

    return {
      userId: decoded.id,
      payload: decoded,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Token tidak valid atau sudah kadaluarsa" ||
        error.message ===
          "JWT_SECRET tidak ditemukan di environment variables")
    ) {
      return NextResponse.json(
        errorResponse("Token tidak valid atau sudah kadaluarsa"),
        { status: 401 }
      );
    }
    throw error;
  }
}

