import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { createUser, isUsernameExists } from "@/lib/services/user";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessages: string[] = [];
      const processedFields = new Set<string>();

      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;

        if (issue.code === "invalid_type") {
          const receivedValue =
            typeof issue === "object" && issue !== null && "received" in issue
              ? String((issue as { received?: unknown }).received)
              : null;

          if (receivedValue === "undefined" || receivedValue === "null") {
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

    const isUsernameExistsResult = await isUsernameExists(username);

    if (isUsernameExistsResult) {
      return NextResponse.json(errorResponse("Username sudah digunakan"), {
        status: 409,
      });
    }

    const user = await createUser({ username, password });

    return NextResponse.json(
      successResponse(user, "User berhasil didaftarkan"),
      {
        status: 201,
      }
    );
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json(errorResponse("Username sudah digunakan"), {
        status: 409,
      });
    }

    console.error("Error saat register:", error);
    return NextResponse.json(
      errorResponse("Terjadi kesalahan saat mendaftarkan user"),
      { status: 500 }
    );
  }
}
