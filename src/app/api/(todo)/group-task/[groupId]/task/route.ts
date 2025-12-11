import { ApiContext, createApiHandler } from "@/lib/utils/api-handler";
import { createApiError, ErrorType } from "@/lib/utils/error-handler";

export const POST = createApiHandler(async (request, context: ApiContext) => {
  const groupId = context.params?.groupId;

  if (!groupId || groupId.trim() === "") {
    throw createApiError("Group ID tidak valid", 400, ErrorType.VALIDATION);
  }

  const validatedData = context.validatedData;
});
