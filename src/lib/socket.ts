import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export interface TodoChangeEvent {
  action: "created" | "updated" | "deleted";
  todo: {
    id_todo: number;
    title: string;
    is_done: number;
    start_date: string | null;
    end_date: string | null;
  };
  id_task: number;
}

export const socketService = {
  connect(token: string): Socket {
    if (socket?.connected) {
      return socket;
    }

    socket = io("http://localhost:8000", {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return socket;
  },

  disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket(): Socket | null {
    return socket;
  },

  isConnected(): boolean {
    return socket?.connected || false;
  },
};
