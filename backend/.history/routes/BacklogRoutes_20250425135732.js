import express from "express";
import {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  getAllSprints,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint,
  startSprint,
  moveIssueToEpic,
  moveIssueToSprint,
  moveIssueToBacklog,
} from "../controllers/BacklogController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Quản lý backlog và issue
router.get("/issues", protect, getAllIssues); // Lấy toàn bộ issue
router.get("/issues/:issueId", protect, getIssueById); // Lấy toàn bộ issue
router.post("/issues", protect, createIssue); // Tạo issue mới
router.put("/issues/:issueId", protect, updateIssue); // Cập nhật issue
router.delete("/issues/:issueId", protect, deleteIssue); // Xóa issue

// Quản lý sprint
router.get("/sprints", protect, getAllSprints); // Lấy toàn bộ sprint
router.get("/sprints/:sprintId", protect, getSprintById); // Lấy toàn bộ sprint
router.post("/sprints", protect, createSprint); // Tạo sprint mới
router.put("/sprints/:sprintId", protect, updateSprint); // Cập nhật sprint
router.delete("/sprints/:sprintId", protect, deleteSprint); // Xóa sprint
router.put('/sprints/:sprintId/start', protect, startSprint);

// Di chuyển issue giữa backlog và sprint
router.put("/moveIssue/:issueId/toEpic/:epicId", protect, moveIssueToEpic);
router.put("/moveIssue/:issueId/toSprint/:sprintId", protect, moveIssueToSprint);
router.put("/moveIssue/:issueId/toBacklog", protect, moveIssueToBacklog);

export default router;
