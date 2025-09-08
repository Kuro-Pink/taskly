import Status from '../models/Status.js';

// Tạo status mới
export const createStatus = async (req, res) => {
  try {
    const { name, project } = req.body;
    const existingStatus = await Status.findOne({ name, project });
    if (existingStatus) {
      return res.status(400).json({ message: 'Status đã tồn tại' });
    }
    const newStatus = new Status({ name, project });
    sendWebSocketUpdate("createStatus", {
      name, project
    });
    await newStatus.save();
    res.status(201).json(newStatus);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo status', error });
  }
};

// Cập nhật status
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedStatus = await Status.findByIdAndUpdate(id, { name }, { new: true });
    sendWebSocketUpdate("createStatus", {
      name
    });

    if (!updatedStatus) return res.status(404).json({ message: 'Status không tồn tại!' });

    res.status(200).json(updatedStatus);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật Status', error: error.message });
  }
};

// Lấy tất cả status
export const getAllStatuses = async (req, res) => {
  try {
    const statuses = await Status.find();
    res.status(200).json(statuses);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách status', error });
  }
};

// Lấy status theo ID
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

// Xóa status
export const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    await Status.findByIdAndDelete(id);
    res.status(200).json({ message: 'Xóa status thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa status', error });
  }
};
