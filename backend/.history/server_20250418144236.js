import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { initWebSocket } from "./config/websocket.js";
import connectDB from "./config/db.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import BacklogRoutes from "./routes/BacklogRoutes.js";
import statusRoutes from "./routes/statusRoutes.js";
import epicRoutes from './routes/epicRoutes.js';
import e from "express";

// const errorHandler from "./middlewares/errorHandler");s

// Load biến môi trường
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());



app.use('/api/backlog', BacklogRoutes);
app.use('/api/backlog/status', statusRoutes);

app.use('/api/timeline/epics', epicRoutes);


// 📌 Sử dụng route auth
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

// Middleware xử lý lỗi (luôn đặt cuối)
// app.use(errorHandler);

// Khởi động server và WebSocket
const server = http.createServer(app);
initWebSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
