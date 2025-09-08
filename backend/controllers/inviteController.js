import crypto from 'crypto';
import Invite from '../models/Invite.js';
import sendMail from '../utils/sendMail.js';
import Project from '../models/Project.js';

export const sendInviteEmail = async (req, res) => {
  const { email } = req.body;
  const { projectId } = req.params;

  const token = crypto.randomBytes(24).toString('hex');
  const existingProject = await Project.findById(projectId);
    if (!existingProject) {
        return res.status(404).json({ message: 'Dự án không tồn tại' });
    }    
    console.log('existingProject', existingProject);
    
  

  const invite = await Invite.create({
    email,
    token,
    projectId,
    status: 'pending',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  const link = `http://localhost:5173/projects/${existingProject.key}/boards/${invite.projectId}/invite?token=${token}`;

  await sendMail({
    to: email,
    subject: '📩 Lời mời tham gia dự án',
    html: `<p>Bạn được mời vào một dự án. Nhấn vào link dưới đây để tham gia:</p>
           <a href="${link}">${link}</a>`,
  });

  res.status(200).json({ message: 'Đã gửi lời mời!' });
};

export const acceptInvite = async (req, res) => {
  const { token, userId } = req.body;

  const invite = await Invite.findOne({ token, status: 'pending' });
  if (!invite) return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });

  const project = await Project.findById(invite.projectId);
  if (!project) return res.status(404).json({ message: 'Dự án không tồn tại' });

  // Kiểm tra nếu user đã ở trong project thì thôi
  const alreadyIn = project.members.some((m) => m.user.toString() === userId);
  if (!alreadyIn) {
    project.members.push({ user: userId, role: 'Member', name: 'Người được mời' });
    await project.save();
  }

  invite.status = 'accepted';
  await invite.save();

  res.status(200).json({ message: 'Đã tham gia dự án thành công' });
};
