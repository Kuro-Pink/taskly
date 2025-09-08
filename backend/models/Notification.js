import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },  // ID dự án
  username: String,
  action: String,
  target: String,
  type: String, // issue, sprint, epic, ...
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
