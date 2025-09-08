import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },  // title là bắt buộc
        number: Number,
        description: { type: String, default: null },  // description không bắt buộc
        type: { 
            type: String, 
            enum: ['Task', 'Bug', 'Story'], 
            required: true  // type là bắt buộc và chỉ nhận giá trị trong 3 tùy chọn này
        },
        sprint: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint', default: null },  // sprint không bắt buộc
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, 
        status: { type: mongoose.Schema.Types.ObjectId, ref: 'Status', default: null  },
        epic: { type: mongoose.Schema.Types.ObjectId, ref: 'Epic', default: null  },
        creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Người tạo issue
        assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },  // assignees không bắt buộc
        startDate: { type: Date, default: Date.now },
        endDate: {
            type: Date,
            default: () => {
                const date = new Date();
                date.setDate(date.getDate() + 7);
                return date;
            }
        },
         parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null }, // thêm trường parent
    },
    { timestamps: true }
);

export default mongoose.model('Task', taskSchema);
