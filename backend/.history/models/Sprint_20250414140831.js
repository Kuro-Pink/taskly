import mongoose from 'mongoose';

const sprintSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        startDate: { type: Date },
        endDate: { type: Date },
        issues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
        started: { type: Boolean, default: false }, // ✅ Trạng thái đã bắt đầu hay chưa
    },
    { timestamps: true }
);

export default mongoose.model('Sprint', sprintSchema);
