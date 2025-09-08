import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },  // ID dự án
  username: String,
  action: String,
  target: String,
  type: String, // Loại activity như 'create', 'update', 'delete'
  isRead: { type: Boolean, default: true }, // Hoạt động đã đọc
}, { timestamps: true });

export default mongoose.model('Activity', activitySchema);
