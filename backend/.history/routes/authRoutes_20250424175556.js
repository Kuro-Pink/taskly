import express from "express";
import { registerUser, loginUser, getUserInfo } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route để lấy thông tin người dùng
router.get('/user', protect, getUserInfo);

// 📌 Route đăng ký user mới
router.post("/register", registerUser);

// 📌 Route đăng nhập user
router.post("/login", loginUser);

export default router;
