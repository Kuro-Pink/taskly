import express from "express";
import { createNotification, createActivities, markNotificationAsRead, getNotifications, getActivitiess } from '../controllers/notificationController.js';
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Các route cho notification và activity
router.post('/notifications', protect, createNotification);
router.post('/activities', protect, createActivities);
router.put('/notifications/:id/read', markNotificationAsRead);

router.get('/notifications', protect, getNotifications);   // Lấy thông báo
router.get('/activities', protect, getActivitiess);       // Lấy hoạt động

export default router;
