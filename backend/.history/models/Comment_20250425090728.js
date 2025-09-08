// models/Comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  issue: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Người tạo issue
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
