import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/utils/api-handler";
import { successResponse } from "@/lib/utils/response";
import {
  deleteGroupTask,
  getGroupTaskById,
  updateGroupTask,
} from "@/lib/services/group-task";
import { updateGroupTaskSchema } from "@/lib/validations/group-task";
import type { ApiContext } from "@/lib/utils/api-handler";
import type { UpdateGroupTaskInput } from "@/lib/validations/group-task";
import { createApiError, ErrorType } from "@/lib/utils/error-handler";

export const PATCH = createApiHandler(
  async (request, context: ApiContext) => {
    const groupTaskId = context.params?.groupId;
    if (!groupTaskId || groupTaskId.trim() === "") {
      throw createApiError(
        "Group task ID tidak valid",
        400,
        ErrorType.VALIDATION
      );
    }

    const validatedData = context.validatedData as UpdateGroupTaskInput;
    const body = context.body as Record<string, unknown>;

    // Ambil group task yang akan diupdate untuk mendapatkan type saat ini
    const existingGroupTask = await getGroupTaskById(
      groupTaskId,
      context.userId
    );

    if (!existingGroupTask) {
      throw createApiError(
        "Group task tidak ditemukan atau tidak memiliki akses",
        404,
        ErrorType.NOT_FOUND
      );
    }

    // Validasi kompleks berdasarkan aturan
    const currentType = existingGroupTask.type;
    const newType = validatedData.type;
    const isUpdatingType = newType !== undefined;
    const isUpdatingStartDate = "start_date" in body;
    const isUpdatingEndDate = "end_date" in body;

    // Aturan 4: Jika start_date atau end_date diubah, cek apakah type adalah schedule
    if (isUpdatingStartDate || isUpdatingEndDate) {
      // Gunakan type baru jika ada, jika tidak gunakan type saat ini
      const typeToCheck = newType !== undefined ? newType : currentType;

      if (typeToCheck !== "schedule") {
        throw createApiError(
          "Jika type bukan schedule, tidak bisa mengubah start_date atau end_date",
          400,
          ErrorType.VALIDATION
        );
      }

      // Jika type adalah schedule, pastikan keduanya diisi setelah update
      const finalStartDate =
        validatedData.start_date !== undefined
          ? validatedData.start_date
          : existingGroupTask.start_date;
      const finalEndDate =
        validatedData.end_date !== undefined
          ? validatedData.end_date
          : existingGroupTask.end_date;

      if (!finalStartDate || !finalEndDate) {
        throw createApiError(
          "Jika type adalah schedule, start_date dan end_date wajib diisi",
          400,
          ErrorType.VALIDATION
        );
      }
    }

    // Aturan 3: Jika type diubah ke no_schedule atau routine, set start_date dan end_date menjadi null
    if (isUpdatingType) {
      if (newType === "no_schedule" || newType === "routine") {
        // Set start_date dan end_date menjadi null (akan di-update di database)
        validatedData.start_date = null;
        validatedData.end_date = null;
      } else if (newType === "schedule") {
        // Jika type diubah ke schedule, start_date dan end_date wajib diisi
        // Cek apakah start_date dan end_date ada di payload atau sudah ada di database
        const finalStartDate =
          validatedData.start_date !== undefined
            ? validatedData.start_date
            : existingGroupTask.start_date;
        const finalEndDate =
          validatedData.end_date !== undefined
            ? validatedData.end_date
            : existingGroupTask.end_date;

        if (!finalStartDate || !finalEndDate) {
          throw createApiError(
            "Jika type adalah schedule, start_date dan end_date wajib diisi",
            400,
            ErrorType.VALIDATION
          );
        }

        // Pastikan start_date dan end_date ada di validatedData untuk di-update
        if (validatedData.start_date === undefined) {
          validatedData.start_date = finalStartDate;
        }
        if (validatedData.end_date === undefined) {
          validatedData.end_date = finalEndDate;
        }
      }
    }

    // Update group task
    await updateGroupTask(groupTaskId, context.userId, validatedData);

    return NextResponse.json(
      successResponse(null, "Group task berhasil diupdate"),
      { status: 200 }
    );
  },
  {
    schema: updateGroupTaskSchema,
    requireBody: true,
    allowedKeys: ["title", "type", "start_date", "end_date"],
  }
);

export const DELETE = createApiHandler(async (request, context: ApiContext) => {
  const groupTaskId = context.params?.groupId;
  if (!groupTaskId || groupTaskId.trim() === "") {
    throw createApiError(
      "Group task ID tidak valid",
      400,
      ErrorType.VALIDATION
    );
  }

  await deleteGroupTask(groupTaskId, context.userId);

  return NextResponse.json(
    successResponse(null, "Group task berhasil dihapus"),
    { status: 200 }
  );
});
