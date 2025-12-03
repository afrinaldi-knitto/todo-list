import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { generateToken } from "@/lib/utils/jwt";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { loginUser } from "@/lib/services/user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      // Mapping error berdasarkan path untuk pesan yang lebih jelas
      const errorMessages: string[] = [];
      const processedFields = new Set<string>();

      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;

        // Cek jika field tidak dikirimkan (undefined atau null)
        if (issue.code === "invalid_type") {
          const receivedValue =
            typeof issue === "object" && issue !== null && "received" in issue
              ? String((issue as { received?: unknown }).received)
              : null;

          if (receivedValue === "undefined" || receivedValue === "null") {
            // Field tidak dikirimkan
            if (!processedFields.has(field)) {
              if (field === "username") {
                errorMessages.push("Username tidak boleh kosong");
              } else if (field === "password") {
                errorMessages.push("Password tidak boleh kosong");
              } else if (field) {
                errorMessages.push(`${field} tidak boleh kosong`);
              }
              processedFields.add(field);
            }
            return;
          }
        }

        // Error lainnya (validation error)
        if (!processedFields.has(field)) {
          errorMessages.push(issue.message);
          processedFields.add(field);
        }
      });

      return NextResponse.json(
        errorMessages.length > 0
          ? errorResponse(errorMessages.join(", "))
          : errorResponse("Data tidak valid"),
        { status: 400 }
      );
    }

    const { username, password } = validationResult.data;

    // Login user dan verifikasi password
    const user = await loginUser({ username, password });

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
    });

    return NextResponse.json(successResponse({ token }, "Berhasil login"), {
      status: 200,
    });
  } catch (error: unknown) {
    // Handle error dari service (username/password salah)
    if (
      error instanceof Error &&
      error.message === "Username atau password salah"
    ) {
      return NextResponse.json(errorResponse("Username atau password salah"), {
        status: 401,
      });
    }

    console.error("Error saat login:", error);
    return NextResponse.json(errorResponse("Terjadi kesalahan saat login"), {
      status: 500,
    });
  }
}
