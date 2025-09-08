// controllers/commentController.js
import Comment from '../models/Comment.js';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';
import { sendWebSocketUpdateToIssue } from '../config/websocket.js'; // hoặc sendWebSocketUpdateToIssue

export const getCommentsByIssue = async (req, res) => {
  try {
    const comments = await Comment.find({ issue: req.params.issueId })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy comment' });
  }
};


export const createComment = async (req, res) => {
  const { issueId, content, userId } = req.body;

  const savedComment = await Comment.create({
    issue: issueId,
    content,
    user: userId,
  });
  await savedComment.save();

  // 🟡 Lấy danh sách người liên quan đến issue (assign, creator, follower...)
  const relatedUsers = await getUsersRelatedToIssue(issueId); // Tự cài hoặc giả lập

  // 🔵 Gửi đến từng user bằng event rõ ràng
  relatedUsers.forEach((user) => {
    io.to(user._id).emit(SOCKET_EVENTS.CREATE_COMMENT, {
      issueId,
      comment: savedComment,
    });
  });

  // ✅ Trả về
  res.status(201).json(savedComment);
};

export const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

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
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findByIdAndDelete(id);

  if (!comment) {
    return res.status(404).json({ error: 'Không tìm thấy bình luận để xoá' });
  }

  sendWebSocketUpdateToIssue(comment.issue, SOCKET_EVENTS.DELETE_COMMENT, {
    issueId: comment.issue,
    commentId: comment._id,
  });

  res.status(200).json({ message: 'Xoá thành công' });
};





