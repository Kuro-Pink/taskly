import { getIO } from "../config/websocket.js";

// Gửi đến tất cả user đã kết nối
export const sendWebSocketUpdate = (event, data) => {
  const io = getIO();
  if (io) {
    io.emit(event, data);
  }
};

// Gửi đến một người dùng cụ thể qua userId (đã join vào room = userId)
export const sendNotificationToUser = (userId, event, data) => {
  const io = getIO();
  if (io && userId) {
    io.to(userId.toString()).emit(event, data);
  }
};

// Gửi thông báo đến toàn bộ người dùng trong cùng project (đã join vào room = projectId)
export const sendNotificationToProject = (projectId, event, data) => {
  const io = getIO();
  if (io && projectId) {
    io.to(projectId.toString()).emit(event, data);
  }
};

// Gửi update tới các client theo issueId nếu bạn cho phép join vào room theo issueId (hiếm gặp)
export const sendWebSocketUpdateToIssue = (issueId, event, data) => {
  const io = getIO();
  if (io && issueId) {
    io.to(issueId.toString()).emit(event, data);
  }
};
