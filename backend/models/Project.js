import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    key: { type: String, required: true, unique: true }, // Key 3 chữ cái đầu
    githubUrl: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    inviteCode: {
      type: String,
      unique: true,
      default: () => Math.random().toString(36).slice(2, 10),
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["Owner", "Lead", "Member"], default: "Member" },
        name: { type: String, required: true }
      },
    ],
    pendingInvites: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);
