import { successResponse } from "@/lib/utils/response";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/group-task/[groupId]/task/[taskId]">
) {
  const { groupId, taskId } = await ctx.params;

  return NextResponse.json(
    successResponse(`Task ID : ${taskId}`, `GROUP ID : ${groupId}`)
  );
}
