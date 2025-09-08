import Notification from "../models/Notification.js";
import Activity from "../models/Activity.js"; // Import Activity model

// Lấy tất cả hoạt động (Activity)
export const getActivitiess = async (req, res) => {
    try {
        // Lấy tất cả hoạt động, sắp xếp theo updatedAt (mới nhất trước)
        const activities = await Activity.find().sort({ updatedAt: -1 });

        res.status(200).json(activities);  // Trả lại danh sách hoạt động
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy hoạt động', error: error.message });
    }
};

// Lấy tất cả thông báo (Notification)
export const getNotifications = async (req, res) => {
    try {
        // Lấy thông báo đã được sắp xếp theo updatedAt (mới nhất trước)
         const userId = req.user._id;
         const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json(notifications);  // Trả lại danh sách thông báo
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi lấy thông báo', error: error.message });
    }
};

// Tạo hoặc cập nhật notification
export const createNotification = async (req, res) => {
    try {
        const userId = req.user._id;
        const { username, action, target, type, projectId } = req.body;
        
        // Kiểm tra nếu notification đã tồn tại
        const existingNotification = await Notification.findOne({ username, action, target });

        if (existingNotification) {
            existingNotification.updatedAt = new Date();
            await existingNotification.save();
            return res.status(200).json(existingNotification);
        }

        // Tạo mới notification
        const newNotification = new Notification({
            userId,
            projectId,
            username,
            action,
            target,
            type,
            isRead: false // Default là chưa đọc
        });

        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tạo notification', error: error.message });
    }
};
    export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
        );

        if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
    };


// Tạo hoặc cập nhật activity
export const createActivities = async (req, res) => {
    try {
        const userId = req.user._id;
        const { username, action, target, projectId } = req.body;

        // Kiểm tra nếu activity đã tồn tại
        const existingActivity = await Activity.findOne({ username, action, target });

        if (existingActivity) {
            existingActivity.updatedAt = new Date();
            await existingActivity.save();
            return res.status(200).json(existingActivity);
        }

        // Tạo mới activity
        const newActivity = new Activity({
            userId,
            projectId,
            username,
            action,
            target,
            type: target?.split(' ')[0]?.toLowerCase(),
            isRead: true // Hoạt động đã đọc
        });

        await newActivity.save();
        res.status(201).json(newActivity);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi tạo activity', error: error.message });
    }
};
