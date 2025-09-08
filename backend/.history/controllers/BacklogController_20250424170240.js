import Task from '../models/Task.js';
import Sprint from '../models/Sprint.js';
import Status from '../models/Status.js';
import { sendWebSocketUpdate, sendWebSocketUpdateToIssue } from '../utils/webSocket.js';

// 🟢 Lấy tất cả Issue (Backlog)
export const getAllIssues = async (req, res) => {
    try {
        const issues = await Task.find();
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách issue', error });
    }
};

// 🟢 Lấy Issue theo ID
export const getIssueById = async (req, res) => {
    try {
      const { issueId } = req.params;
      const issue = await Task.findById(issueId);
  
      if (!issue) {
        return res.status(404).json({ message: 'Không tìm thấy issue' });
      }
  
      res.status(200).json(issue);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy issue', error });
    }
};

// 🟢 Tạo Issue mới
export const createIssue = async (req, res) => {
    try {
        const { title, type, sprint, project, status, epic } = req.body;
        
        // Lấy issue có số lớn nhất
        const lastIssue = await Task.findOne({ project }).sort({ number: -1 });
        const nextNumber = lastIssue ? lastIssue.number + 1 : 1;

        const newIssue = new Task({ title, number: nextNumber, type, sprint, project, status, epic });

        // Gửi thông báo qua WebSocket
        sendWebSocketUpdate("CREATE_ISSUE", {
            title, type, sprint, project, status, epic, issueId: newIssue._id
        });

        await newIssue.save();
        res.status(201).json(newIssue);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo issue', error });
    }
};

// 🟢 Sửa Issue
export const updateIssue = async (req, res) => {
    try {
        const { issueId } = req.params;

        const updatedIssue = await Task.findByIdAndUpdate(issueId, req.body, { new: true });

        // Gửi thông báo qua WebSocket
        sendWebSocketUpdate("UPDATE_ISSUE", {
            issueId,
            ...req.body
        });

        if (!updatedIssue) {
            return res.status(404).json({ message: 'Không tìm thấy issue' });
        }

        res.json(updatedIssue);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật issue', error });
    }
};

// 🟢 Xóa Issue
export const deleteIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const deletedIssue = await Task.findByIdAndDelete(issueId);

        // Gửi thông báo qua WebSocket
        sendWebSocketUpdate("DELETE_ISSUE", { issueId });

        if (!deletedIssue) {
            return res.status(404).json({ message: 'Không tìm thấy issue' });
        }

        res.json({ message: 'Xóa issue thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa issue', error });
    }
};

// 🟢 Tạo Sprint mới
export const createSprint = async (req, res) => {
    try {
        const { name, project } = req.body;
        const newSprint = new Sprint({ name, project });

        // Gửi thông báo qua WebSocket
        sendWebSocketUpdate("CREATE_SPRINT", { name, project });

        await newSprint.save();
        res.status(201).json(newSprint);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo sprint', error });
    }
};

// 🟢 Sửa Sprint
export const updateSprint = async (req, res) => {
    try {
        const { sprintId } = req.params;
        
        const updatedSprint = await Sprint.findByIdAndUpdate(sprintId, req.body, { new: true });

        // Gửi thông báo qua WebSocket
        sendWebSocketUpdate("UPDATE_SPRINT", { sprintId, ...req.body });

        if (!updatedSprint) {
            return res.status(404).json({ message: 'Không tìm thấy sprint' });
        }

        res.json(updatedSprint);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật sprint', error });
    }
};

// 🟢 Xóa Sprint
export const deleteSprint = async (req, res) => {
    try {
        const { sprintId } = req.params;
        // Xóa sprint
        const deletedSprint = await Sprint.findByIdAndDelete(sprintId);

        // Gửi thông báo qua WebSocket
        sendWebSocketUpdate("DELETE_SPRINT", { sprintId });

        if (!deletedSprint) {
            return res.status(404).json({ message: 'Không tìm thấy sprint' });
        }

        // 🟠 Cập nhật các issue trong sprint này về backlog (sprint: null)
        await Task.updateMany({ sprint: sprintId }, { $set: { sprint: null } });

        res.json({ message: 'Xóa sprint thành công và cập nhật các issue về backlog' });
    } catch (error) {
        console.error('❌ Lỗi khi xóa sprint:', error);
        res.status(500).json({ message: 'Lỗi khi xóa sprint', error });
    }
};

// 🔵 Bắt đầu sprint + chuyển issue sang status "Phải làm"
export const startSprint = async (req, res) => {
    const { sprintId } = req.params;    
    try {
        // 1. Cập nhật trạng thái sprint là "started"
        const sprint = await Sprint.findByIdAndUpdate(
            sprintId,
            { started: true },
            { new: true }
        );

        // Gửi thông báo qua WebSocket
        sendWebSocketUpdate("START_SPRINT", { sprintId });

        if (!sprint) {
            return res.status(404).json({ message: 'Sprint không tồn tại' });
        }        

        // 2. Tìm status "Phải làm" trong project của sprint
        const todoStatus = await Status.findOne({
            name: 'Phải làm',
            project: sprint.project,
        });

        if (!todoStatus) {
            return res.status(404).json({ message: 'Không tìm thấy status "Phải làm"' });
        }

        // 3. Cập nhật tất cả issue trong sprint sang status "Phải làm"
        await Task.updateMany(
            { sprint: sprintId },
            { status: todoStatus._id } // ✅ Bạn cần có dòng này
        );

        res.status(200).json({
            message: 'Sprint đã được bắt đầu và các issue đã được cập nhật',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi bắt đầu sprint' });
    }
};

// 🟢 Di chuyển Issue vào Sprint
export const moveIssueToSprint = async (req, res) => {
    try {
        const { issueId, sprintId } = req.params;

        const issue = await Task.findByIdAndUpdate(
            issueId,
            { sprint: sprintId },
            { new: true }
        );

        if (!issue) {
            return res.status(404).json({ message: 'Không tìm thấy issue' });
        }

        // Gửi thông báo qua WebSocket
        sendWebSocketUpdateToIssue(sprintId, "MOVE_ISSUE_TO_SPRINT", { issueId, sprintId });

        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi di chuyển issue vào sprint', error });
    }
};

// 🔵 Di chuyển Issue về Backlog
export const moveIssueToBacklog = async (req, res) => {
    try {
        const { issueId } = req.params;

        const issue = await Task.findByIdAndUpdate(
            issueId,
            { sprint: null },
            { new: true }
        );

        if (!issue) {
            return res.status(404).json({ message: 'Không tìm thấy issue' });
        }

        // Gửi thông báo qua WebSocket
        sendWebSocketUpdateToIssue(issue.sprint, "MOVE_ISSUE_TO_BACKLOG", { issueId });

        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi di chuyển issue về backlog', error });
    }
};
