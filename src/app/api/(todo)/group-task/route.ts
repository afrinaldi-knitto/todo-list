import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/utils/api-handler";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { getGroupTasks, createGroupTask } from "@/lib/services/group-task";
import { createUpdateGroupTaskSchema } from "@/lib/validations/group-task";
import type { ApiContext } from "@/lib/utils/api-handler";
import type { CreateUpdateGroupTaskInput } from "@/lib/validations/group-task";

export const GET = createApiHandler(async (request, context: ApiContext) => {
  const groupTasks = await getGroupTasks(context.userId);
  return NextResponse.json(
    successResponse(groupTasks, "Berhasil mengambil daftar group task"),
    { status: 200 }
  );
});

export const POST = createApiHandler(
  async (request, context: ApiContext) => {
    const validatedData = context.validatedData as CreateUpdateGroupTaskInput;

    if (validatedData.type === "schedule") {
      if (
        !validatedData.start_date ||
        !validatedData.end_date ||
        validatedData.start_date === null ||
        validatedData.end_date === null
      ) {
        return NextResponse.json(
          errorResponse(
            "Jika type adalah schedule, start_date dan end_date wajib diisi"
          ),
          { status: 400 }
        );
      }
    } else if (
      validatedData.type === "no_schedule" ||
      validatedData.type === "routine"
    ) {
      validatedData.start_date = null;
      validatedData.end_date = null;
    }

    await createGroupTask(context.userId, validatedData);

    return NextResponse.json(
      successResponse(null, "Group task berhasil dibuat"),
      { status: 201 }
    );
  },
  {
    schema: createUpdateGroupTaskSchema,
  }
);
