import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
  name: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null }, 
}, { timestamps: true });

const Status = mongoose.model('Status', statusSchema);
export default Status;