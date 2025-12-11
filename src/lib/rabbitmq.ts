import amqp from "amqplib";

const RABBITMQ_URL =
  process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

export interface TaskPayload {
  id: string;
  action: string;
  data: string;
}

// Singleton untuk connection dan channel
// Menggunakan tipe yang dikembalikan dari amqp.connect() dan createChannel()
type AmqpConnection = Awaited<ReturnType<typeof amqp.connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection["createChannel"]>>;

let connection: AmqpConnection | null = null;
let channel: AmqpChannel | null = null;
let isConnecting = false;

/**
 * Mendapatkan atau membuat koneksi RabbitMQ (singleton)
 * Dengan auto-reconnect jika koneksi terputus
 */
async function getConnection(): Promise<AmqpConnection> {
  // Jika sudah ada koneksi, return
  // Event handler akan reset connection jika terputus
  if (connection) {
    return connection;
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    // Wait for existing connection attempt
    while (isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (connection) {
      return connection;
    }
  }

  try {
    isConnecting = true;
    const newConnection = await amqp.connect(RABBITMQ_URL);
    connection = newConnection;

    // Handle connection errors (auto-reconnect)
    newConnection.on("error", (err) => {
      console.error("[RabbitMQ] Connection error:", err);
      connection = null;
      channel = null;
    });

    newConnection.on("close", () => {
      console.warn("[RabbitMQ] Connection closed");
      connection = null;
      channel = null;
    });

    console.log("[RabbitMQ] Koneksi berhasil dibuat");
    return newConnection;
  } catch (error) {
    connection = null;
    throw error;
  } finally {
    isConnecting = false;
  }
}

/**
 * Mendapatkan atau membuat channel RabbitMQ (singleton)
 */
async function getChannel(): Promise<AmqpChannel> {
  // Jika sudah ada channel, return
  // Event handler akan reset channel jika terputus
  if (channel) {
    return channel;
  }

  const conn = await getConnection();
  const newChannel = await conn.createChannel();
  channel = newChannel;

  // Handle channel errors
  newChannel.on("error", (err: Error) => {
    console.error("[RabbitMQ] Channel error:", err);
    channel = null;
  });

  newChannel.on("close", () => {
    console.warn("[RabbitMQ] Channel closed");
    channel = null;
  });

  return newChannel;
}

/**
 * Publish message ke queue (menggunakan koneksi persistent)
 */
export async function publishMessage(queueName: string, payload: TaskPayload) {
  let retries = 3;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      const ch = await getChannel();

      // Pastikan queue ada
      await ch.assertQueue(queueName, { durable: true });

      const messageBuffer = Buffer.from(JSON.stringify(payload));

      const sent = ch.sendToQueue(queueName, messageBuffer, {
        persistent: true,
      });

      if (!sent) {
        throw new Error("Failed to send message to queue");
      }

      console.log(`[Producer] Terkirim ke '${queueName}':`, payload);
      return; // Success, exit retry loop
    } catch (error) {
      lastError = error as Error;
      console.error(`[Producer] Error (${retries} retries left):`, error);

      // Reset connection/channel on error untuk force reconnect
      if (channel) {
        try {
          await channel.close();
        } catch {
          // Ignore close errors
        }
        channel = null;
      }

      retries--;
      if (retries > 0) {
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error("Failed to publish message after retries");
}

/**
 * Publish message ke queue (menggunakan koneksi persistent)
 */
export async function publishMessageDirect(
  queueName: string,
  payload: TaskPayload
) {
  let retries = 3;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      const ch = await getChannel();
      const exchangeName = "direct_logs";
      const routingKey = "error";
      const exchangeType = "direct";

      // Exhange type direct
      await ch.assertExchange(exchangeName, exchangeType, { durable: true });

      // Pastikan queue ada
      await ch.assertQueue(exchangeName, { durable: true });

      const messageBuffer = Buffer.from(JSON.stringify(payload));

      const sent = ch.publish(exchangeName, routingKey, messageBuffer, {
        persistent: true,
      });

      if (!sent) {
        throw new Error("Failed to send message to queue");
      }

      console.log(`[Producer] Terkirim ke '${queueName}':`, payload);
      return; // Success, exit retry loop
    } catch (error) {
      lastError = error as Error;
      console.error(`[Producer] Error (${retries} retries left):`, error);

      // Reset connection/channel on error untuk force reconnect
      if (channel) {
        try {
          await channel.close();
        } catch {
          // Ignore close errors
        }
        channel = null;
      }

      retries--;
      if (retries > 0) {
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error("Failed to publish message after retries");
}

/**
 * Publish message ke queue (menggunakan koneksi persistent)
 */
export async function publishMessageFanout(
  queueName: string,
  payload: TaskPayload
) {
  let retries = 3;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      const ch = await getChannel();
      const exchangeName = "notifikasi_massal";

      // Exhange type direct
      await ch.assertExchange(exchangeName, "fanout", { durable: true });

      // BINDING: Hubungkan Queue ke Exchange HANYA jika kuncinya 'error'
      await ch.bindQueue(queueName, exchangeName, "error");

      // Pastikan queue ada
      await ch.assertQueue(exchangeName, { durable: true });

      const messageBuffer = Buffer.from(JSON.stringify(payload));

      const sent = ch.publish(exchangeName, "", messageBuffer, {
        persistent: true,
      });

      if (!sent) {
        throw new Error("Failed to send message to queue");
      }

      console.log(`[Producer] Terkirim ke '${queueName}':`, payload);
      return; // Success, exit retry loop
    } catch (error) {
      lastError = error as Error;
      console.error(`[Producer] Error (${retries} retries left):`, error);

      // Reset connection/channel on error untuk force reconnect
      if (channel) {
        try {
          await channel.close();
        } catch {
          // Ignore close errors
        }
        channel = null;
      }

      retries--;
      if (retries > 0) {
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error("Failed to publish message after retries");
}

/**
 * Publish message ke queue (menggunakan koneksi persistent)
 */
export async function publishMessageTopic(
  queueName: string,
  payload: TaskPayload
) {
  let retries = 3;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      const ch = await getChannel();
      const exchangeName = "berita_topic";
      const routingKey = "asia.indonesia.jakarta"; // Spesifik

      // Exhange type direct
      await ch.assertExchange(exchangeName, "topic", { durable: true });

      // Pastikan queue ada
      await ch.assertQueue(exchangeName, { durable: true });

      const messageBuffer = Buffer.from(JSON.stringify(payload));

      const sent = ch.publish(exchangeName, routingKey, messageBuffer, {
        persistent: true,
      });

      if (!sent) {
        throw new Error("Failed to send message to queue");
      }

      console.log(`[Producer] Terkirim ke '${queueName}':`, payload);
      return; // Success, exit retry loop
    } catch (error) {
      lastError = error as Error;
      console.error(`[Producer] Error (${retries} retries left):`, error);

      // Reset connection/channel on error untuk force reconnect
      if (channel) {
        try {
          await channel.close();
        } catch {
          // Ignore close errors
        }
        channel = null;
      }

      retries--;
      if (retries > 0) {
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error("Failed to publish message after retries");
}

/**
 * Publish message ke queue (menggunakan koneksi persistent)
 */
export async function publishMessageHeaders(
  queueName: string,
  payload: TaskPayload
) {
  let retries = 3;
  let lastError: Error | null = null;

  while (retries > 0) {
    try {
      const ch = await getChannel();
      const exchangeName = "dokumen_headers";

      // Exchange type headers
      await ch.assertExchange(exchangeName, "headers", { durable: true });

      // Pastikan queue ada
      await ch.assertQueue(queueName, { durable: true });

      const messageBuffer = Buffer.from(JSON.stringify(payload));
      const headers = {
        format: "pdf",
        "x-secret": "true",
      };

      const sent = ch.publish(exchangeName, "", messageBuffer, {
        persistent: true,
        headers: headers,
      });

      if (!sent) {
        throw new Error("Failed to send message to queue");
      }

      console.log(`[Producer] Terkirim ke '${queueName}':`, payload);
      return; // Success, exit retry loop
    } catch (error) {
      lastError = error as Error;
      console.error(`[Producer] Error (${retries} retries left):`, error);

      // Reset connection/channel on error untuk force reconnect
      if (channel) {
        try {
          await channel.close();
        } catch {
          // Ignore close errors
        }
        channel = null;
      }

      retries--;
      if (retries > 0) {
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error("Failed to publish message after retries");
}

/**
 * Cleanup koneksi (optional, untuk graceful shutdown)
 * Biasanya tidak perlu dipanggil manual karena Next.js akan cleanup sendiri
 */
export async function closeConnection() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log("[RabbitMQ] Koneksi ditutup");
  } catch (error) {
    console.error("[RabbitMQ] Error saat menutup koneksi:", error);
  }
}
