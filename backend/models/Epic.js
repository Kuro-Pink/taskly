// models/Epic.js
import mongoose from 'mongoose';

const epicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  startDate: { type: Date, default: Date.now },
  endDate: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 14);
        return date;
      }
    },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Người tạo issue
}, { timestamps: true });

const Epic = mongoose.model('Epic', epicSchema);
export default Epic;
