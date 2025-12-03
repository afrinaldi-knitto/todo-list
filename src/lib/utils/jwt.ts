import jwt from "jsonwebtoken";

/**
 * Interface untuk payload JWT
 */
export interface JWTPayload {
  id: string;
  username: string;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET tidak ditemukan di environment variables");
  }

  return jwt.sign(payload, secret, {
    expiresIn: 1000 * 60 * 60 * 24 * 7,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET tidak ditemukan di environment variables");
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch {
    throw new Error("Token tidak valid atau sudah kadaluarsa");
  }
}
