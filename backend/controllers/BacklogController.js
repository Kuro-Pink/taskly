import Task from '../models/Task.js';
import Sprint from '../models/Sprint.js';
import Status from '../models/Status.js';
import User from '../models/User.js';
import Project from '../models/Project.js';  // Giả sử bạn có model Project
import mongoose from 'mongoose';
import { sendNotificationToProject, sendNotificationToUser } from '../services/notificationService.js'; // Đảm bảo bạn có file này để xử lý WebSocket.
import { SOCKET_EVENTS } from '../constants/socketEvents.js';


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

// 🟢 Lấy tất cả Sprint
export const getAllSprints = async (req, res) => {
    try {
        const sprints = await Sprint.find().populate('issues');
        res.json(sprints);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sprint', error });
    }
};

// 🟢 Lấy Sprint theo ID
export const getSprintById = async (req, res) => {
    try {
      const { sprintId } = req.params;
      const sprint = await Sprint.findById(sprintId).populate('issues'); // Populate để lấy các task liên quan đến sprint
  
      if (!sprint) {
        return res.status(404).json({ message: 'Không tìm thấy sprint' });
      }
  
      res.status(200).json(sprint);
    } catch (error) {
      res.status(500).json({ message: 'Lỗi khi lấy sprint', error });
    }
  };


export const createIssue = async (req, res) => {
    try {
        // Lấy thông tin từ body request
        const { title, type, sprint, project, status, epic, parent } = req.body;
        const userId = req.user.id; // userId đã có trong req.user từ middleware xác thực
        const user = req.user; // userId đã có trong req.user từ middleware xác thực
        
        // Kiểm tra xem dự án có tồn tại không
        const existingProject = await Project.findById(project);
        if (!existingProject) {
            return res.status(404).json({ message: 'Dự án không tồn tại' });
        }        
        

        // Kiểm tra xem người dùng có phải là thành viên của dự án không
        const isMember = existingProject.members.some(member => member.user.toString() === userId.toString());
        if (!isMember) {
            return res.status(403).json({ message: 'Bạn không phải là thành viên của dự án này' });
        }

        // Lấy issue có số lớn nhất trong dự án, hoặc bắt đầu từ số 1 nếu chưa có issue nào
        const lastIssue = await Task.findOne({ project }).sort({ number: -1 });
        const nextNumber = lastIssue ? lastIssue.number + 1 : 1;

        // Tạo issue mới
        const newIssue = new Task({
            title,
            number: nextNumber,
            type,
            sprint,
            project,
            status,
            epic,
            assignees: userId,
            creator: userId, // Lưu creator là userId
            parent
        });

        // Lưu vào database
        await newIssue.save();
        // Trả lại kết quả
        res.status(201).json(newIssue);
        
        // Gửi thông báo qua WebSocket (có thể sử dụng socket để phát sự kiện cho các thành viên dự án)
       // Gửi thông báo qua WebSocket (có thể sử dụng socket để phát sự kiện cho các thành viên dự án)
        await sendNotificationToProject(existingProject._id,SOCKET_EVENTS.RECEIVE_ACTIVITY, {
            username: user.name,       // (tuỳ loại)
            action: "đã tạo",    // "updated", "commented", "assigned"
            target: `Issue ${existingProject.key} - ${newIssue.number}`,    // "issue #123", "task #789"
            timestamp: Date.now()
            }
        );

    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo issue', error });
    }
};


// 🟢 Sửa Issue
export const updateIssue = async (req, res) => {
    try {
      const { issueId } = req.params;
      const userId = req.user.id;
      const user = req.user;
  
      const issue = await Task.findById(issueId);
      if (!issue) {
        return res.status(404).json({ message: 'Không tìm thấy issue' });
      }
  
      const existingProject = await Project.findById(issue.project);
      if (!existingProject) {
        return res.status(404).json({ message: 'Dự án không tồn tại' });
      }      
  
      const isMember = existingProject.members.some(
        member => member.user.toString() === userId.toString()
      );
      if (!isMember) {
        return res.status(403).json({ message: 'Bạn không có quyền sửa issue trong dự án này' });
      }
        
      // Kiểm tra xem có phải hành động assign không
      // 🟢 Đặt trước khi dùng assignName
        const isAssigning = req.body.assignee && req.body.assignee !== issue.assignee?.toString();
        const statusDoc = await Status.findById(req.body?.status);
        const isDone = statusDoc?.name === 'Hoàn thành';
        
      
        let assignName = 'chính mình';
        if (isAssigning && mongoose.Types.ObjectId.isValid(req.body.assignee)) {
            const assignInfo = await User.findById(req.body.assignee);
            if (assignInfo && req.body.assignee !== user.id) {
                assignName = assignInfo.name;
            }
        }
      
      // Cập nhật issue
      const updatedIssue = await Task.findByIdAndUpdate(issueId, req.body, { new: true });      
  
      res.status(200).json(updatedIssue);
  
      // Xác định loại hành động để thông báo
      const action = isDone ? `đã hoàn thành` : 'đã cập nhật';
  
      await sendNotificationToProject(existingProject._id, SOCKET_EVENTS.RECEIVE_ACTIVITY, {
        username: user.name,
        action,
        target: `Issue ${existingProject.key} - ${updatedIssue.number}`,
        timestamp: Date.now(),
      });
  
      // Nếu có người được giao mới → gửi riêng noti cá nhân
      if (isAssigning && req.body.assignee !== userId) {
        await sendNotificationToUser(updatedIssue.assignee, SOCKET_EVENTS.RECEIVE_NOTIFICATION, { 
            type: 'assign',
            username: user.name,
            action:`đã giao`,
            target: `Issue ${existingProject.key} - ${updatedIssue.number} cho ${assignName}`,
            isRead: false,
          timestamp: Date.now(),
        });
      }
  
    } catch (error) {
        console.error("🔥 Lỗi khi cập nhật issue:", error);
        res.status(500).json({ message: 'Lỗi khi cập nhật issue', error: error.message });
    }
  };
  


// 🟢 Xóa Issue
export const deleteIssue = async (req, res) => {
    try {
        const { issueId } = req.params;
        const userId = req.user.id;
        const user = req.user;

        const issue = await Task.findById(issueId);
        if (!issue) {
            return res.status(404).json({ message: 'Không tìm thấy issue' });
        }

        const existingProject = await Project.findById(issue.project);
        if (!existingProject) {
            return res.status(404).json({ message: 'Dự án không tồn tại' });
        }

        const isMember = existingProject.members.some(member => member.user.toString() === userId.toString());
        if (!isMember) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa issue trong dự án này' });
        }

        const deletedIssue = await Task.findByIdAndDelete(issueId);

        // ✅ Trả về kết quả NGAY LẬP TỨC
        res.status(200).json({ message: 'Xóa issue thành công', deletedIssue });

        // ✅ Sau đó mới gọi thông báo (fire-and-forget, không ảnh hưởng response)
        sendNotificationToProject(existingProject._id, SOCKET_EVENTS.RECEIVE_ACTIVITY, {
            username: user.name,
            action: "đã xóa",
            target: `Issue ${existingProject.key} - ${issue.number}`,
            timestamp: Date.now()
        });

    } catch (error) {
        // Nếu lỗi xảy ra trước khi response gửi => xử lý tại đây
        if (!res.headersSent) {
            res.status(500).json({ message: 'Lỗi khi xóa issue', error });
        } else {
            console.error("Lỗi sau khi response gửi:", error);
        }
    }
};




// 🟢 Tạo Sprint mới
export const createSprint = async (req, res) => {
    try {
        const { name, project } = req.body;
        const userId = req.user.id; // userId đã có trong req.user từ middleware xác thực
        const user = req.user; // userId đã có trong req.user từ middleware xác thực
        // Kiểm tra xem dự án có tồn tại không
        const existingProject = await Project.findById(project);
        if (!existingProject) {
            return res.status(404).json({ message: 'Dự án không tồn tại' });
        }

        // Kiểm tra xem người dùng có phải là thành viên của dự án không
        const isMember = existingProject.members.some(member => member.user.toString() === userId.toString());
        if (!isMember) {
            return res.status(403).json({ message: 'Bạn không phải là thành viên của dự án này' });
        }
        
        const newSprint = new Sprint({ name, project, creator: userId });

        await newSprint.save();
        res.status(201).json(newSprint);

        // Gửi thông báo qua WebSocket
        await sendNotificationToProject(existingProject._id, SOCKET_EVENTS.RECEIVE_ACTIVITY, {
            username: user.name,       // (tuỳ loại)
            action: "đã tạo",    // "updated", "commented", "assigned"
            target: `Sprint`,    // "issue #123", "task #789"
            timestamp: Date.now()
            }
        );

    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo sprint', error });
    }
};

// 🟢 Sửa Sprint
export const updateSprint = async (req, res) => {
    try {
        const { sprintId } = req.params;
        const userId = req.user.id;
        const user = req.user; // userId đã có trong req.user từ middleware xác thực

        
        const sprint = await Sprint.findById(sprintId);
        if (!sprint) {
            return res.status(404).json({ message: 'Không tìm thấy sprint' });
        }
        // Kiểm tra xem dự án có tồn tại không
        const existingProject = await Project.findById(sprint.project);
        if (!existingProject) {
            return res.status(404).json({ message: 'Dự án không tồn tại' });
        }
        
        // Kiểm tra xem người dùng có phải là thành viên của dự án không
        const isMember = existingProject.members.some(member => member.user.toString() === userId.toString());
        if (!isMember) {
            return res.status(403).json({ message: 'Bạn không phải là thành viên của dự án này' });
        }
        
        const updatedSprint = await Sprint.findByIdAndUpdate(sprintId, req.body, { new: true });

        if (!updatedSprint) {
            return res.status(404).json({ message: 'Không tìm thấy sprint' });
        }

        res.status(200).json(updatedSprint);
         // Gửi thông báo qua WebSocket
         await sendNotificationToProject(existingProject._id, SOCKET_EVENTS.RECEIVE_ACTIVITY, {
            username: user.name,       // (tuỳ loại)
            action: "đã cập nhật",    // "updated", "commented", "assigned"
            target: `Sprint`,    // "issue #123", "task #789"
            timestamp: Date.now()
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật sprint', error });
    }
};

// 🟢 Xóa Sprint
export const deleteSprint = async (req, res) => {
    try {
        const { sprintId } = req.params;
        const userId = req.user.id;
        const user = req.user; // userId đã có trong req.user từ middleware xác thực

         
        const sprint = await Sprint.findById(sprintId);
        if (!sprint) {
            return res.status(404).json({ message: 'Không tìm thấy sprint' });
        }
        // Kiểm tra xem dự án có tồn tại không
        const existingProject = await Project.findById(sprint.project);
        if (!existingProject) {
            return res.status(404).json({ message: 'Dự án không tồn tại' });
        }

        // Kiểm tra xem người dùng có phải là thành viên của dự án không
        const isMember = existingProject.members.some(member => member.user.toString() === userId.toString());
        if (!isMember) {
            return res.status(403).json({ message: 'Bạn không phải là thành viên của dự án này' });
        }

        // Xóa sprint
        const deletedSprint = await Sprint.findByIdAndDelete(sprintId);

        if (!deletedSprint) {
            return res.status(404).json({ message: 'Không tìm thấy sprint' });
        }

        // 🟠 Cập nhật các issue trong sprint này về backlog (sprint: null)
        await Task.updateMany({ sprint: sprintId }, { $set: { sprint: null } });

        res.status(200).json({ message: 'Xóa sprint thành công và cập nhật các issue về backlog' });

         // Gửi thông báo qua WebSocket
         await sendNotificationToProject(existingProject._id, SOCKET_EVENTS.RECEIVE_ACTIVITY, {
            username: user.name,       // (tuỳ loại)
            action: "đã xóa",    // "updated", "commented", "assigned"
            target: `Sprint`,    // "issue #123", "task #789"
            timestamp: Date.now()
            }
        );
    } catch (error) {
        console.error('❌ Lỗi khi xóa sprint:', error);
        res.status(500).json({ message: 'Lỗi khi xóa sprint', error });
    }
};

// 🔵 Bắt đầu sprint + chuyển issue sang status "Phải làm"
export const startSprint = async (req, res) => {
    const { sprintId } = req.params;   
    const user = req.user; // userId đã có trong req.user từ middleware xác thực 
    const userId = req.user.id;

    try {
        // 1. Cập nhật trạng thái sprint là "started"
        const sprint = await Sprint.findByIdAndUpdate(
            sprintId,
            { started: true },
            { new: true }
        );
        const existingProject = await Project.findById(sprint.project);
        if (!existingProject) {
            return res.status(404).json({ message: 'Dự án không tồn tại' });
        }

        // Kiểm tra xem người dùng có phải là thành viên của dự án không
        const isMember = existingProject.members.some(member => member.user.toString() === userId.toString());
        if (!isMember) {
            return res.status(403).json({ message: 'Bạn không phải là thành viên của dự án này' });
        }
        

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
        // Gửi thông báo qua WebSocket
        await sendNotificationToProject(existingProject._id, SOCKET_EVENTS.RECEIVE_ACTIVITY, {
            username: user.name,       // (tuỳ loại)
            action: "đã bắt đầu",    // "updated", "commented", "assigned"
            target: `Sprint`,    // "issue #123", "task #789"
            timestamp: Date.now()
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi khi bắt đầu sprint' });
    }
};

// 🟢 Di chuyển Issue vào Sprint
export const moveIssueToEpic = async (req, res) => {
    try {
        const { issueId, epicId } = req.params;

        const issue = await Task.findByIdAndUpdate(
            issueId,
            { epic: epicId },
            { new: true }
        );

        if (!issue) {
            return res.status(404).json({ message: 'Không tìm thấy issue' });
        }

        

        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi di chuyển issue vào sprint', error });
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

        res.json(issue);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi di chuyển issue về backlog', error });
    }
};



export const assignIssue = async (req, res) => {
  try {
    const { issueId, assigneeId } = req.body;
    const userId = req.user.id;

    const issue = await Task.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue không tồn tại' });
    }

    // Cập nhật người được giao
    issue.assignee = assigneeId;
    await issue.save();

    res.status(200).json(issue);

    if(userId !== assigneeId) {
        // Gửi thông báo cho người được giao
        await sendNotificationToUser(assigneeId, SOCKET_EVENTS.RECEIVE_NOTIFICATION, { 
            type: 'assign',
            username: req.user.name,
            action:`đã được giao`,
            target: `Issue ${issue.project.name.substring(0, 3).toUpperCase()} - ${issue.number} ${issue.title}`,
            isRead: false,
            timestamp: Date.now(),
        });
    }

    await sendNotificationToProject(existingProject._id, SOCKET_EVENTS.RECEIVE_ACTIVITY, {
        username: user.name,       // (tuỳ loại)
        action: "đã bắt đầu",    // "updated", "commented", "assigned"
        target: `Sprint`,    // "issue #123", "task #789"
        timestamp: Date.now()
        }
    );

  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi assign issue', error });
  }
};

