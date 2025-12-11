import { NextResponse } from "next/server";
import {
  publishMessageDirect,
  publishMessageFanout,
  TaskPayload,
} from "@/lib/rabbitmq";

export async function POST(request: Request) {
  try {
    // Ambil data dari Body Request
    const body = await request.json();

    // Validasi sederhana
    if (!body.action) {
      return NextResponse.json(
        { error: 'Field "action" wajib diisi' },
        { status: 400 }
      );
    }

    // Siapkan Payload
    const payload: TaskPayload = {
      id: crypto.randomUUID(),
      action: body.action,
      data: body.data || {},
    };

    // Kirim ke RabbitMQ (Queue: "queue.log.info")
    await publishMessageFanout("queue.log.info", payload);

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
