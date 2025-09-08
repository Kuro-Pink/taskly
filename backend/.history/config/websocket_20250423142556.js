import { Server } from "socket.io";

let io;

export const initWebSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("🔵 New user connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("join-issue", (issueId) => {
      socket.join(issueId);
      console.log(`🟡 User ${socket.id} joined issue room ${issueId}`);
    });

    socket.on('new-comment', (data) => {
      const { issueId, comment, receivers } = data;
      receivers.forEach(userId => {
        io.to(userId).emit('receive-message', {
          type: 'COMMENT',
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

// Gửi đến tất cả mọi người
export const sendWebSocketUpdate = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

// Gửi đến người trong một issue cụ thể
export const sendWebSocketUpdateToIssue = (issueId, event, data) => {
  if (io) {
    io.to(issueId).emit(event, data);
  }
};

export { io };
