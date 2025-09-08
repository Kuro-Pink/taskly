import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';
import { sendNotificationToUser, sendNotificationToProject } from '../services/notificationService.js'; // Đảm bảo bạn có file này để xử lý WebSocket.

// 📌 Lấy tất cả comment của 1 issue
export const getCommentsByIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    if (!issueId) {
      return res.status(400).json({ message: 'Thiếu issueId' });
    }

    const comments = await Comment.find({ issue: issueId })
      .populate('issue')
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (err) {
    console.error('Lỗi khi lấy comment:', err);
    res.status(500).json({ message: 'Lỗi khi lấy comment' });
  }
};

// 📌 Tạo comment mới
export const createComment = async (req, res) => {
  try {
    const { issueId, content } = req.body;
    const userId = req.user?.id;
    const user = req.user;
    
    
    if (!issueId || !content || !userId) {
      return res.status(400).json({ message: 'Thiếu issueId, content hoặc userId' });
    }

     const issue = await Task.findById(issueId);
    if (!issue) {
        return res.status(404).json({ message: 'Không tìm thấy issue' });
    }

    // Kiểm tra xem người dùng có quyền sửa issue trong dự án không
    const existingProject = await Project.findById(issue.project);
    if (!existingProject) {
        return res.status(404).json({ message: 'Dự án không tồn tại' });
    }

    const isMember = existingProject.members.some(member => member.user.toString() === userId.toString());
    if (!isMember) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa issue trong dự án này' });
    }

    const newComment = await Comment.create({
      issue: issueId,
      content,
      user: userId,
      username: user.name
      
    });
    
    
     res.status(201).json(newComment);
    // Gửi thông báo realtime
    sendNotificationToProject(existingProject._id,SOCKET_EVENTS.RECEIVE_ACTIVITY, {
      username: user.name,       // (tuỳ loại)
      action: "đã bình luận",    // "updated", "commented", "assigned"
      target: `Issue ${existingProject.key} - ${issue.number}`,    // "issue #123", "task #789"
      timestamp: Date.now()
      }
    );

    if(issue.assignee && issue.assignee !== userId) {
       await sendNotificationToUser(issue.assignee, SOCKET_EVENTS.RECEIVE_NOTIFICATION, { 
          type: 'comment',
          username: user.name,
          action: "đã bình luận",
          target: `Issue ${existingProject.key} - ${issue.number}`,
          isRead: false,
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.error('Lỗi khi tạo comment:', err);
    res.status(500).json({ message: 'Lỗi khi tạo comment', error: err.message });
  }
};

// 📌 Cập nhật nội dung comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    const user = req.user;
    
    if (!content) {
      return res.status(400).json({ message: 'Nội dung comment không được để trống' });
    }

    const comment =  await Comment.findById(id)
    const issue = await Task.findById(comment.issue);

    if (!issue) {
        return res.status(404).json({ message: 'Không tìm thấy issue' });
    }
    

    // Kiểm tra xem người dùng có quyền sửa issue trong dự án không
    const existingProject = await Project.findById(issue.project);
    if (!existingProject) {
        return res.status(404).json({ message: 'Dự án không tồn tại' });
    }

    const isMember = existingProject.members.some(member => member.user.toString() === userId.toString());
    if (!isMember) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa issue trong dự án này' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ error: 'Không tìm thấy bình luận' });
    }

   

    res.status(200).json(updatedComment);
  } catch (err) {
    console.error('Lỗi khi cập nhật comment:', err);
    res.status(500).json({ message: 'Lỗi khi cập nhật comment', error: err.message });
  }
};

// 📌 Xoá comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user
    const userId = req.user?.id;

    const comment =  await Comment.findById(id)

    const issue = await Task.findById(comment.issue);
    if (!issue) {
        return res.status(404).json({ message: 'Không tìm thấy issue' });
    }

    // Kiểm tra xem người dùng có quyền sửa issue trong dự án không
    const existingProject = await Project.findById(issue.project);
    if (!existingProject) {
        return res.status(404).json({ message: 'Dự án không tồn tại' });
    }

    const isMember = existingProject.members.some(member => member.user.toString() === userId.toString());
    if (!isMember) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa issue trong dự án này' });
    }

    const deletedComment = await Comment.findByIdAndDelete(id);

    if (!deletedComment) {
      return res.status(404).json({ error: 'Không tìm thấy bình luận để xoá' });
    }

    

    res.status(200).json({ message: 'Xoá thành công' });
  } catch (err) {
    console.error('Lỗi khi xoá comment:', err);
    res.status(500).json({ message: 'Lỗi khi xoá comment', error: err.message });
  }
};
