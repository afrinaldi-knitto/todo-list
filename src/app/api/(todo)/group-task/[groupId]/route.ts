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

    const currentType = existingGroupTask.type;
    const newType = validatedData.type;
    const isUpdatingType = newType !== undefined;
    const isUpdatingStartDate = "start_date" in body;
    const isUpdatingEndDate = "end_date" in body;

    if (isUpdatingStartDate || isUpdatingEndDate) {
      const typeToCheck = newType !== undefined ? newType : currentType;

      if (typeToCheck !== "schedule") {
        throw createApiError(
          "Jika type bukan schedule, tidak bisa mengubah start_date atau end_date",
          400,
          ErrorType.VALIDATION
        );
      }

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

    if (isUpdatingType) {
      if (newType === "no_schedule" || newType === "routine") {
        validatedData.start_date = null;
        validatedData.end_date = null;
      } else if (newType === "schedule") {
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

        if (validatedData.start_date === undefined) {
          validatedData.start_date = finalStartDate;
        }
        if (validatedData.end_date === undefined) {
          validatedData.end_date = finalEndDate;
        }
      }
    }

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
