import mongoose from 'mongoose';

const sprintSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        startDate: { type: Date, default: Date.now },
        endDate: {
            type: Date,
            default: () => {
              const date = new Date();
              date.setDate(date.getDate() + 14);
              return date;
            }
          },
        issues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
        started: { type: Boolean, default: false }, // ✅ Trạng thái đã bắt đầu hay chưa
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Người tạo issue
    },
    { timestamps: true }
);

export default mongoose.model('Sprint', sprintSchema);
