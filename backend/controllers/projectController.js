import Invite from "../models/Invite.js";
import Project from "../models/Project.js";
import Status from '../models/Status.js'; // ✅ Bổ sung import
import { sendNotificationToUser } from "../services/notificationService.js";
import axios from 'axios';

// 🟢 Tạo dự án mới
export const createProject = async (req, res) => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  try {
    const { name, description, key } = req.body;
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({ message: "Bạn cần đăng nhập để tạo dự án" });
    }

    if (!name) {
      return res.status(400).json({ message: "Tên dự án là bắt buộc" });
    }

    let projectKey = key || name.substring(0, 3).toUpperCase();
    let existingProject = await Project.findOne({ key: projectKey });
    let counter = 1;

    while (existingProject) {
      projectKey = `${name.substring(0, 3).toUpperCase()}${counter}`;
      existingProject = await Project.findOne({ key: projectKey });
      counter++;
    }

    // 1. Tạo repo GitHub
    const response = await axios.post(
      "https://api.github.com/user/repos",
      { name, private: false },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const githubUrl = response.data.html_url;

    // Tạo dự án mới
    const newProject = new Project({
      name,
      description,
      key: projectKey,
      githubUrl,
      owner: ownerId,
      members: [{ user: ownerId, role: "Owner", name: req.user.name }],
    });

    await newProject.save();

      // Sau khi newProject.save() xong
    const defaultStatuses = ["Phải làm", "Đang làm", "Hoàn thành"];

    await Promise.all(
      defaultStatuses.map((statusName) => {
        const status = new Status({ name: statusName, project: newProject._id, creator: ownerId });
        return status.save();
      })
    );

    res.status(201).json({ message: "Dự án đã được tạo và 3 status mặc định đã có sẵn", project: newProject });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo dự án", error: error.message });
  }
};


// 🟢 Lấy toàn bộ dự án
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("owner", "name email");
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách dự án", error: error.message });
  }
};

// 🟢 Lấy dự án theo ID
export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Tìm dự án và populate owner + members
    const project = await Project.findById(projectId)
      .populate("owner", "name email")
      .populate("members.user", "name email");

    if (!project) {
      return res.status(404).json({ message: "Dự án không tồn tại" });
    }

    res.json({ project });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin dự án", error: error.message });
  }
};

// ✅ Hàm Xóa Dự Án
export const deleteProject = async (req, res) => {
  try {
      const { projectId } = req.params;

      // 🔹 Tìm dự án trong database
      const project = await Project.findById(projectId);
      if (!project) {
          return res.status(404).json({ message: "Dự án không tồn tại" });
      }

      // 🔹 Kiểm tra quyền xóa (Chỉ chủ sở hữu có quyền)
      if (project.owner.toString() !== req.user.id) {
          return res.status(403).json({ message: "Bạn không có quyền xóa dự án này" });
      }

      await project.deleteOne(); // ✅ Xóa dự án
      res.status(200).json({ message: "Dự án đã được xóa thành công!" });
  } catch (error) {
      res.status(500).json({ message: "Lỗi khi xóa dự án", error: error.message });
  }
};


export const requestJoinProject = async (req, res) => {
  try {
    const { code } = req.body; // Gộp cả inviteCode và token chung 1 tên
    const userId = req.user.id;

    // Có thể code là inviteCode hoặc token, thử tìm theo cả 2
    let project = await Project.findOne({ inviteCode: code });
    
    if (!project) {
      // Nếu không phải inviteCode, thử xem có phải token dạng liên kết mời không
      const invite = await Invite.findOne({ token: code }); // nếu có bảng riêng
    
      if (!invite) {
        return res.status(404).json({ message: "Mã mời không hợp lệ" });
      }
      project = await Project.findById(invite.projectId);
      if (!project) return res.status(404).json({ message: "Dự án không tồn tại" });
    }

    // Kiểm tra đã là thành viên
    if (project.members.some(m => m.user.toString() === userId)) {
      return res.status(400).json({ message: "Bạn đã là thành viên" });
    }

    // Thêm user vào project
    project.members.push({ user: userId, role: "Member", name: req.user.name });
    await project.save();

    // Gửi thông báo cho Owner
    sendNotificationToUser(project.owner, "NEW_NOTIFICATION", `Yêu cầu tham gia dự án từ ${req.user.name}`);

    res.json({ message: "Vào dự án thành công.", project });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xử lý yêu cầu tham gia", error: error.message });
  }
};


export const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("members.user", "name email")
      .populate("pendingInvites.user", "name email"); // <-- populate thêm pendingInvites

    if (!project) {
      return res.status(404).json({ message: "Dự án không tồn tại" });
    }

    res.json({ 
      members: project.members,
      pendingInvites: project.pendingInvites // <-- trả luôn pendingInvites
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách thành viên", error: error.message });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, newRole } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Dự án không tồn tại" });

    const owner = project.members.find(m => m.user.toString() === req.user.id && m.role === "Owner");
    if (!owner) return res.status(403).json({ message: "Bạn không có quyền thay đổi vai trò" });

    const member = project.members.find(m => m.user.toString() === userId);
    if (!member) return res.status(404).json({ message: "Thành viên không tồn tại" });

    member.role = newRole;
    await project.save();

    res.json({ message: "Cập nhật vai trò thành công", member });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật vai trò", error: error.message });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Dự án không tồn tại" });

    const owner = project.members.find(m => m.user.toString() === req.user.id && m.role === "Owner");
    if (!owner) return res.status(403).json({ message: "Bạn không có quyền xóa thành viên" });

    project.members = project.members.filter(m => m.user.toString() !== userId);
    await project.save();

    // Gửi notification cho người bị remove
    sendNotificationToUser(userId, `Bạn đã bị loại khỏi dự án ${project.name}.`);

    res.status(200).json({ message: "Xóa thành viên thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa thành viên", error: error.message });
  }
};
