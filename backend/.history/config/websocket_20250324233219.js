import { Server } from "socket.io";

let io;
export const initWebSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("🔵 New user connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      console.log("⚪ User disconnected:", socket.id);
    });
  });
};

// ✅ Thêm hàm này để cập nhật WebSocket khi có sự kiện
export const sendWebSocketUpdate = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

export { io };
