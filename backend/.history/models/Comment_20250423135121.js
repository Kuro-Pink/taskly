// models/Comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Comment', commentSchema);
