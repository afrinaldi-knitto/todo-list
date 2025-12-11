import amqp, { ConsumeMessage } from "amqplib";

const RABBITMQ_URL = "amqp://guest:guest@localhost:5672";
const EXCHANGE_NAME = "direct_logs";
const QUEUE_NAME = "queue_log_error";
const ROUTING_KEY = "error";

async function startWorker() {
  try {
    console.log("👷 Worker Backend sedang bersiap...");

    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // BINDING: Hubungkan Queue ke Exchange HANYA jika kuncinya 'error'
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY, {
      durable: true,
    });

    // Prefetch(1) = Fair Dispatch (Satu per satu)
    channel.prefetch(1);

    console.log(`[*] Menunggu pesan di queue: "${QUEUE_NAME}"`);

    channel.consume(
      QUEUE_NAME,
      (msg: ConsumeMessage | null) => {
        if (msg) {
          // Parsing pesan
          const content = JSON.parse(msg.content.toString());

          console.log(`\n[📥] Menerima Task: ${content.action}`);
          console.log(`     ID: ${content.id}`);
          console.log(`     Data:`, content.data);

          // Simulasi proses berat (2 detik)
          console.log("     ...sedang memproses...");
          setTimeout(() => {
            // Kirim ACK (Konfirmasi sukses ke RabbitMQ)
            channel.ack(msg);
            console.log("     [✅] Selesai!");
          }, 10000);
        }
      },
      {
        noAck: false, // Wajib manual ACK
      }
    );
  } catch (error) {
    console.error("Worker Error:", error);
  }
}

startWorker();
