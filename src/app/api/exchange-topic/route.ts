import { NextResponse } from "next/server";
import { publishMessageTopic, TaskPayload } from "@/lib/rabbitmq";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.action) {
      return NextResponse.json(
        { error: 'Field "action" wajib diisi' },
        { status: 400 }
      );
    }

    const payload: TaskPayload = {
      id: crypto.randomUUID(),
      action: body.action,
      data: body.data || {},
    };

    await publishMessageTopic("queue_berita_indo", payload);

    return NextResponse.json({
      success: true,
      message: "Pesan berhasil masuk antrean RabbitMQ",
      task_id: payload.id,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `Gagal mengirim pesan ke RabbitMQ: ${error}` },
      { status: 500 }
    );
  }
}
