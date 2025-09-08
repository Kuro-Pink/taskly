// models/Epic.js
import mongoose from 'mongoose';

const epicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
}, { timestamps: true });

const Epic = mongoose.model('Epic', epicSchema);
export default Epic;
