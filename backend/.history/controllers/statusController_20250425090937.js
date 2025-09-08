import Status from '../models/Status.js';
import { sendWebSocketUpdate } from '../config/websocket.js'; // Đảm bảo bạn có file này để xử lý WebSocket.

// 🟢 Tạo status mới
export const createStatus = async (req, res) => {
  try {
    const { name, project } = req.body;
    const userId = req.user.id;

    // Kiểm tra nếu status đã tồn tại
    const existingStatus = await Status.findOne({ name, project, creator: userId });
    if (existingStatus) {
      return res.status(400).json({ message: 'Status đã tồn tại' });
    }

    // Tạo status mới
    const newStatus = new Status({ name, project });

    // Gửi thông báo qua WebSocket
    sendWebSocketUpdate("CREATE_STATUS", newStatus);

    await newStatus.save();
    res.status(201).json(newStatus);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo status', error });
  }
};

// 🟢 Cập nhật status
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Cập nhật status
    const updatedStatus = await Status.findByIdAndUpdate(id, { name }, { new: true });

    // Gửi thông báo qua WebSocket
    sendWebSocketUpdate("UPDATE_STATUS", updatedStatus);

    if (!updatedStatus) {
      return res.status(404).json({ message: 'Status không tồn tại!' });
    }

    res.status(200).json(updatedStatus);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật Status', error: error.message });
  }
};

// 🟢 Lấy tất cả status
export const getAllStatuses = async (req, res) => {
  try {
    const statuses = await Status.find();
    res.status(200).json(statuses);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách status', error });
  }
};

// 🟢 Lấy status theo ID
export const getStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await Status.findById(id);

    if (!status) {
      return res.status(404).json({ message: 'Status không tồn tại' });
    }

    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy status', error });
  }
};

// 🟢 Xóa status
export const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tìm và xóa status
    const deletedStatus = await Status.findByIdAndDelete(id);

    if (!deletedStatus) {
      return res.status(404).json({ message: 'Status không tồn tại' });
    }

    // Gửi thông báo qua WebSocket
    sendWebSocketUpdate("DELETE_STATUS", deletedStatus);

    res.status(200).json({ message: 'Xóa status thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa status', error });
  }
};
