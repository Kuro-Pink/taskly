import Project from "../models/Project.js";
import Status from '../models/Status.js'; // ✅ Bổ sung import
import { sendNotificationToUser, sendWebSocketUpdate } from "../services/notificationService.js";

// 🟢 Tạo dự án mới
export const createProject = async (req, res) => {
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

    // Tạo dự án mới
    const newProject = new Project({
      name,
      description,
      key: projectKey,
      owner: ownerId,
      members: [{ user: ownerId, role: "Owner" }],
    });

    await newProject.save();

      // Sau khi newProject.save() xong
    await Promise.all(
      defaultStatuses.map((statusName) => {
        const status = new Status({ name: statusName, project: newProject._id });
        return status.save();
      })
    );
      

    for (let statusName of defaultStatuses) {
      const status = new Status({ name: statusName, project: newProject._id });
      await status.save();
    }

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
    const { inviteCode } = req.params;
    const userId = req.user.id;

    const project = await Project.findOne({ inviteCode });
    if (!project) return res.status(404).json({ message: "Dự án không tồn tại" });

    // Kiểm tra đã là thành viên hoặc đang chờ duyệt
    if (project.members.some(m => m.user.toString() === userId)) {
      return res.status(400).json({ message: "Bạn đã là thành viên" });
    }
    if (project.pendingInvites.some(i => i.user.toString() === userId)) {
      return res.status(400).json({ message: "Bạn đã gửi yêu cầu tham gia" });
    }

    // Thêm user vào pendingInvites
    project.pendingInvites.push({ user: userId });
    await project.save();

    // Gửi thông báo cho Owner
    sendNotificationToUser(project.owner, "NEW_NOTIFICATION", `Yêu cầu tham gia dự án từ ${req.user.name}`);

    res.json({ message: "Yêu cầu tham gia đã được gửi. Đợi xác nhận từ chủ dự án." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xử lý yêu cầu tham gia", error: error.message });
  }
};

export const respondJoinRequest = async (req, res) => {
  try {
    const { projectId, userId, action } = req.body;
    const project = await Project.findById(projectId);    
    if (!project) return res.status(404).json({ message: "Dự án không tồn tại" });

    // Kiểm tra quyền Owner/Lead
    const ownerOrLead = project.members.find(
      m => m.user.toString() === req.user.id && (m.role === "Owner" || m.role === "Lead")
    );
    if (!ownerOrLead) return res.status(403).json({ message: "Bạn không có quyền duyệt thành viên" });

    // Tìm user trong pendingInvites
    const inviteIndex = project.pendingInvites.findIndex(i => i.user.toString() === userId);
    if (inviteIndex === -1) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu tham gia này" });
    }

    if (action === "accept") {
      project.members.push({ user: userId, role: "Member" });
      sendNotificationToUser(userId, "NEW_NOTIFICATION", "Bạn đã được chấp nhận vào dự án!");

      // Gửi activity log cho toàn bộ project
      sendWebSocketUpdate("NEW_NOTIFICATION", {
        projectId: project._id,
        message: `${req.user.name} đã chấp nhận một thành viên mới vào dự án.`
      });
    } else {
      sendNotificationToUser(userId, "Yêu cầu tham gia dự án của bạn đã bị từ chối.");
    }

    // Xóa khỏi pendingInvites
    project.pendingInvites.splice(inviteIndex, 1);
    await project.save();

    res.json({ message: action === "accept" ? "Thành viên đã được thêm" : "Yêu cầu đã bị từ chối" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xử lý duyệt yêu cầu", error: error.message });
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
