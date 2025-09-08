import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },  // title là bắt buộc
        number: Number,
        type: { 
            type: String, 
            enum: ['Task', 'Bug', 'Story'], 
            required: true  // type là bắt buộc và chỉ nhận giá trị trong 3 tùy chọn này
        },
        status: { type: mongoose.Schema.Types.ObjectId, ref: 'Status' },  // status không bắt buộc 
        sprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint', default: null },  // sprint không bắt buộc
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, 
        status: { type: mongoose.Schema.Types.ObjectId, ref: 'Status', default: null  },
        epic: { type: mongoose.Schema.Types.ObjectId, ref: 'Epic', default: null  },
        assignees: [{ type: String }]  // assignees không bắt buộc
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Người tạo issue
    },
    { timestamps: true }
);

export default mongoose.model('Task', taskSchema);
