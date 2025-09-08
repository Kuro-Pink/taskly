import express from "express";
import {
 
  createProject,
  getAllProjects,
  getProjectById,
  deleteProject,
  requestJoinProject,
  respondJoinRequest,
  getProjectMembers,
  updateMemberRole,
  removeMember
} from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js"; // Đảm bảo import đúng

const router = express.Router();

// Quản lý thành viên dự án
router.get("/join/:inviteCode", protect, requestJoinProject); // Gửi yêu cầu tham gia
router.post("/join/respond", protect, respondJoinRequest); // Chủ dự án duyệt

// Quản lý dự án
router.get("/", protect, getAllProjects); // API lấy toàn bộ dự án
router.post("/create", protect, createProject); // ✅ Giữ `/create` để dễ hiểu hơn
router.get("/:projectId", protect, getProjectById); // API lấy dự án theo ID
router.delete("/:projectId", protect, deleteProject); // ✅ Thêm route xóa dự án

router.get("/:projectId/members", protect, getProjectMembers);
router.put("/:projectId/members", protect, updateMemberRole);
router.delete("/:projectId/members", protect, removeMember);
export default router;
