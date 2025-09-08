import { Server } from "socket.io";
import { SOCKET_EVENTS } from '../constants/socketEvents.js';

let io;

export const initWebSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("🔵 New user connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
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
