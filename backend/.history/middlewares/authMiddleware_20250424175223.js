import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "Người dùng không tồn tại" });
      }

      next();
    } catch (error) {
      console.error("Lỗi xác thực token:", error);  // 👈 In lỗi ra console
      res.status(401).json({ message: "Token không hợp lệ" });
    }
  } else {
    console.log("Không nhận được token từ headers"); // 👈 Log để kiểm tra headers
    res.status(401).json({ message: "Không có quyền truy cập" });
  }
});
