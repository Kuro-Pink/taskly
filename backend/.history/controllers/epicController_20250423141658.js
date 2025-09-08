import Epic from '../models/Epic.js';

export const createEpic = async (req, res) => {
  try {
    const { name, projectId } = req.body;
    const newEpic = new Epic({ name, projectId });
    sendWebSocketUpdate("createEpic", {
      name, projectId
    });
    await newEpic.save();
    res.status(201).json(newEpic);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo Epic', error: err.message });
  }
};

// controllers/epicController.js

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


export const updateEpic = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updatedEpic = await Epic.findByIdAndUpdate(projectId, req.body, { new: true });
    res.status(200).json(updatedEpic);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi cập nhật Epic', error: err.message });
  }
};

export const deleteEpic = async (req, res) => {
  try {
    const { projectId } = req.params;
    await Epic.findByIdAndDelete(projectId);
    res.status(200).json({ message: 'Xoá Epic thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xoá Epic', error: err.message });
  }
};
