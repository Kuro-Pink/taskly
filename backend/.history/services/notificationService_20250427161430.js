import { io } from "../config/websocket.js";

// Gửi đến tất cả mọi người
export const sendWebSocketUpdate = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

// Gửi đến người trong một issue cụ thể
export const sendNotificationToUser  = (userId, event, data) => {
  if (io) {
    io.to(userId).emit(event, data);
  }
};

// Gửi đến người trong một issue cụ thể
export const sendWebSocketUpdateToIssue = (issueId, event, data) => {
  if (io) {
    io.to(issueId).emit(event, data);
  }
};
