import { NextResponse } from "next/server";
import { errorResponse } from "./response";

/**
 * Error types untuk error handling
 */
export enum ErrorType {
  DATABASE_CONNECTION = "DATABASE_CONNECTION",
  DATABASE_QUERY = "DATABASE_QUERY",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION = "VALIDATION",
  CONSTRAINT_VIOLATION = "CONSTRAINT_VIOLATION",
  UNAUTHORIZED = "UNAUTHORIZED",
  UNKNOWN = "UNKNOWN",
}

/**
 * Custom error class untuk API errors
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public type: ErrorType = ErrorType.UNKNOWN
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Handle error dan return NextResponse yang sesuai
 */
export function handleApiError(error: unknown): NextResponse {
  // Handle ApiError custom
  if (error instanceof ApiError) {
    return NextResponse.json(errorResponse(error.message), {
      status: error.statusCode,
    });
  }

  // Handle Error instance
  if (error instanceof Error) {
    // Error dari database connection
    if (
      error.message.includes("connection") ||
      error.message.includes("ECONNREFUSED")
    ) {
      console.error("Error koneksi database:", error);
      return NextResponse.json(
        errorResponse("Terjadi kesalahan saat terhubung ke database"),
        { status: 500 }
      );
    }

    // Error dari query database
    if (error.message.includes("query") || error.message.includes("syntax")) {
      console.error("Error query database:", error);
      return NextResponse.json(
        errorResponse("Terjadi kesalahan saat mengakses database"),
        { status: 500 }
      );
    }

    // Error tidak ditemukan
    if (
      error.message.includes("tidak ditemukan") ||
      error.message.includes("not found")
    ) {
      return NextResponse.json(errorResponse(error.message), { status: 404 });
    }

    // Error constraint violation (PostgreSQL error codes)
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error.code === "23503" || error.code === "23505")
    ) {
      return NextResponse.json(
        errorResponse("Data tidak valid atau constraint violation"),
        { status: 400 }
      );
    }

    // Error lainnya dari service
    console.error("Error dari service:", error);
    return NextResponse.json(
      errorResponse(
        error.message || "Terjadi kesalahan saat memproses request"
      ),
      { status: 500 }
    );
  }

  // Error yang tidak diketahui
  console.error("Error tidak diketahui:", error);
  return NextResponse.json(
    errorResponse("Terjadi kesalahan internal server"),
    { status: 500 }
  );
}

/**
 * Helper untuk membuat ApiError
 */
export function createApiError(
  message: string,
  statusCode: number,
  type: ErrorType = ErrorType.UNKNOWN
): ApiError {
  return new ApiError(message, statusCode, type);
}

