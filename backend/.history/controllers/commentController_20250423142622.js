// controllers/commentController.js
import Comment from '../models/Comment.js';
import { sendWebSocketUpdate } from "../websocket";

export const addComment = async (req, res) => {
  const { issueId, content, userId } = req.body;
  const comment = await Comment.create({ issue: issueId, content, user: userId });

  sendWebSocketUpdate('new-comment', {
    issueId: savedComment.issueId,
    comment: savedComment,
    receivers: relatedUsers.map(u => u._id),
  });
  

  res.status(200).json(comment);
};


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
