import { Server } from "socket.io";

let io = null;

export const initWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("🔵 New user connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`🔵 User ${userId} joined personal room`);
    });

    socket.on("joinProject", (projectId) => {
      socket.join(projectId);
      console.log(`📥 User ${socket.id} vào dự án ${projectId}`);
    });

    socket.on("leaveProject", (projectId) => {
      socket.leave(projectId);
      console.log(`📤 User ${socket.id} rời dự án ${projectId}`);
    });

    socket.on("disconnect", () => {
      console.log("⚪ User disconnected:", socket.id);
    });
  });

  return io; // <- Quan trọng để bên ngoài lấy instance nếu cần
};

// Hàm lấy `io` ở mọi nơi khác
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io chưa được khởi tạo. Gọi initWebSocket(server) trước.");
  }
  return io;
};
