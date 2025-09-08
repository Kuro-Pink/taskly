// controllers/commentController.js
import Comment from '../models/Comment.js';

export const addComment = async (req, res) => {
  const { content, issue } = req.body;
  const userId = req.user._id;

  try {
    const comment = await Comment.create({ content, issue, author: userId });
    
    // Gửi comment qua socket
    req.io.to(issue).emit('new-comment', comment);

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi tạo comment' });
  }
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
