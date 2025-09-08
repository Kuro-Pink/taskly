import { io } from "../config/websocket.js";

// Gửi đến tất cả mọi người, nghi vấn là gửi đến toàn bộ user trong db
export const sendWebSocketUpdate = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

// Gửi đến người trong một issue cụ thể
export const sendNotificationToUser  = (userId, event, data) => {
  if (io) {
    io.to(userId).emit(event, data); //logic chưa hiểu, ý là đây là thông báo chỉ gửi tới một userId nào đó chứ không phải ai cả
  }
};

// Gửi đến người trong một issue cụ thể
export const sendWebSocketUpdateToIssue = (issueId, event, data) => {
  if (io) {
    io.to(issueId).emit(event, data);
  }
  
};
