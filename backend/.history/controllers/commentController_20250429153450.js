import Comment from '../models/Comment.js';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';
import { sendWebSocketUpdate } from '../services/notificationService.js'; // Đảm bảo bạn có file này để xử lý WebSocket.

// 📌 Lấy tất cả comment của 1 issue
export const getCommentsByIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    if (!issueId) {
      return res.status(400).json({ message: 'Thiếu issueId' });
    }

    const comments = await Comment.find({ issue: issueId })
      .populate('user') // ⚠️ Đảm bảo là 'user' nếu schema dùng 'user'
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
    
    
    if (!issueId || !content || !userId) {
      return res.status(400).json({ message: 'Thiếu issueId, content hoặc userId' });
    }

    const newComment = await Comment.create({
      issue: issueId,
      content,
      user: userId,
    });

    // Gửi thông báo realtime
    sendWebSocketUpdateToIssue(issueId, SOCKET_EVENTS.CREATE_COMMENT, {
      type: "notify", // hoặc "activity", hoặc loại khác
      message: "🆕 Issue ABC đã được tạo",
      issueId: "123abc",       // (tuỳ loại)
      projectId: "proj456",    // (tuỳ loại)
      sender: {
        _id: "user001",
        name: "Nguyễn Văn A",
        avatar: "https://..."  // nếu có
      },
      timestamp: Date.now()
    }
    );


    res.status(201).json(newComment);
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

    if (!content) {
      return res.status(400).json({ message: 'Nội dung comment không được để trống' });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!updatedComment) {
      return res.status(404).json({ error: 'Không tìm thấy bình luận' });
    }

    sendWebSocketUpdateToIssue(updatedComment.issue, SOCKET_EVENTS.UPDATE_COMMENT, {
      issueId: updatedComment.issue,
      comment: updatedComment,
    });

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

    const deletedComment = await Comment.findByIdAndDelete(id);

    if (!deletedComment) {
      return res.status(404).json({ error: 'Không tìm thấy bình luận để xoá' });
    }

    sendWebSocketUpdateToIssue(deletedComment.issue, SOCKET_EVENTS.DELETE_COMMENT, {
      issueId: deletedComment.issue,
      commentId: deletedComment._id,
    });

    res.status(200).json({ message: 'Xoá thành công' });
  } catch (err) {
    console.error('Lỗi khi xoá comment:', err);
    res.status(500).json({ message: 'Lỗi khi xoá comment', error: err.message });
  }
};
