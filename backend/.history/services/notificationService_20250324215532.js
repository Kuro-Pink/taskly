import { io } from "../config/websocket.js";

export const sendNotification = (userId, message) => {
  io.to(userId).emit("notification", { message });
};
