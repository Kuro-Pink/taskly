import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 📌 Tạo JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// 📌 Đăng ký user mới
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    // Tạo user mới (KHÔNG cần tự hash mật khẩu, vì Schema đã hash tự động)
    const newUser = await User.create({ name, email, password });

    res.status(201).json({ message: "Đăng ký thành công!", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// 📌 Đăng nhập user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
   
    
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};
