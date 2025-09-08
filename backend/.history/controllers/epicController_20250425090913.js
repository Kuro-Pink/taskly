import Epic from '../models/Epic.js';
import { sendWebSocketUpdate } from '../config/websocket.js'; // Đảm bảo bạn có file này để xử lý WebSocket.

// 🟢 Tạo Epic mới
export const createEpic = async (req, res) => {
  try {
    const { name, projectId } = req.body;
    const userId = req.user.id;
    const newEpic = new Epic({ name, projectId, creator: userId });

    // Gửi thông báo qua WebSocket
    sendWebSocketUpdate("CREATE_EPIC", {
      name, projectId
    });

    await newEpic.save();
    res.status(201).json(newEpic);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo Epic', error: err.message });
  }
};

// 🟢 Lấy tất cả Epic
export const getAllEpic = async (req, res) => {
  try {
    const epics = await Epic.find(); // Lấy tất cả epic, không lọc theo project
    res.status(200).json(epics);
  } catch (err) {
    res.status(500).json({
      message: 'Lỗi khi lấy danh sách Epic',
      error: err.message,
    });
  }
};

// 🟢 Sửa Epic
export const updateEpic = async (req, res) => {
  try {
    const { epicId } = req.params; // Đảm bảo bạn sử dụng epicId thay vì projectId

    const updatedEpic = await Epic.findByIdAndUpdate(epicId, req.body, { new: true });

    // Gửi thông báo qua WebSocket
    sendWebSocketUpdate("UPDATE_EPIC", {
      epicId,
      ...req.body // Truyền thông tin Epic đã được cập nhật
    });

    if (!updatedEpic) {
      return res.status(404).json({ message: 'Không tìm thấy Epic' });
    }

    res.status(200).json(updatedEpic);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật Epic', error: err.message });
  }
};

// 🟢 Xóa Epic
export const deleteEpic = async (req, res) => {
  try {
    const { epicId } = req.params; // Đảm bảo bạn sử dụng epicId thay vì projectId

    const deletedEpic = await Epic.findByIdAndDelete(epicId);

    if (!deletedEpic) {
      return res.status(404).json({ message: 'Không tìm thấy Epic' });
    }

    // Gửi thông báo qua WebSocket
    sendWebSocketUpdate("DELETE_EPIC", { epicId });

    res.status(200).json({ message: 'Xoá Epic thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xoá Epic', error: err.message });
  }
};
