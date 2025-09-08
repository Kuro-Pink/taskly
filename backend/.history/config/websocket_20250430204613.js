import { Server } from "socket.io";
import { SOCKET_EVENTS } from '../constants/socketEvents.js';

let io;

export const initWebSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("🔵 New user connected:", socket.id);

    socket.on('joinProject', (projectId) => {
      socket.join(projectId); // <- Người dùng tham gia vào "room" theo projectId
      console.log(`📥 User ${socket.id} joined project ${projectId}`);
  });

  socket.on('leaveProject', (projectId) => {
      socket.leave(projectId); // <- Rời khỏi "room" nếu cần
      console.log(`📤 User ${socket.id} left project ${projectId}`);
  });

   // Khi người dùng tham gia vào một dự án
    socket.on("join", (userId) => {
        // Thêm người dùng vào phòng của chính họ (userId)
        socket.join(userId);
        console.log(`🔵 User ${userId} joined project room`);

        // Hoặc nếu bạn muốn gắn họ vào phòng của dự án cụ thể:
        socket.join(`project-${userId}`);
        console.log(`🔵 User ${userId} joined project-${userId}`);
    });


    socket.on('new-comment', (data) => {
      const { issueId, comment, receivers } = data;
      receivers.forEach(userId => {
        io.to(userId).emit(SOCKET_EVENTS.CREATE_COMMENT, {
          issueId,
          comment,
        });
      });
    });
    
    
    socket.on("disconnect", () => {
      console.log("⚪ User disconnected:", socket.id);
    });
  });
};



export { io };
