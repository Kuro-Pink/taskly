// file: crons/deadlineNotiCron.js
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import dayjs from 'dayjs';
import sendMail from '../utils/sendMail.js';


export const startDeadlineNotificationCron = () => {
  console.log('[Cron] Khởi động kiểm tra deadline bằng setInterval mỗi ngày...');

  setInterval(async () => {
    console.log('[Cron] 🔄 Tick kiểm tra task...');
    try {
      const today = dayjs();
      const tasks = await Task.find({ endDate: { $exists: true } })
        .populate({ path: 'status', select: 'name' })
        .populate('assignee')
        .populate('project');        

      console.log(`[Cron] Tìm thấy ${tasks.length} task có endDate`);

      for (let task of tasks) {
        const statusName = task.status?.name || 'chưa có status';
        const assigneeName = task.assignee?.name || 'chưa có assignee';
        const endDate = dayjs(task.endDate);

        if (!endDate.isValid()) {
          console.warn(`[Cron] ❗ Task "${task.title}" có endDate không hợp lệ:`, task.endDate);
          continue;
        }

        console.log('[Cron] Task:', {
           
          assignee: assigneeName,
        });

        if (statusName === 'Hoàn thành') continue;
        if (!task.assignee) continue;

        const diff = endDate.diff(today, 'day');

        let action = '';
        if (diff < 0) {
          action = 'đã quá hạn';
        } else if (diff <= 2) {
          action = 'sắp hết hạn';
        } else {
          console.log(`[Cron] Task chưa cần cảnh báo: ${task.title} (còn ${diff} ngày)`);
          continue;
        }

        const existed = await Notification.findOne({
          userId: task.assignee._id,
          projectId: task.project._id,
          target: `Issue ${task.project.name.substring(0, 3).toUpperCase()} - ${task.number} ${task.title}`,
          action,
          type: 'issue',
        });

        if (existed) continue;

        await Notification.create({
          userId: task.assignee._id,
          projectId: task.project._id,
          username: 'Hệ thống',
          action,
          target: `Issue ${task.project.name.substring(0, 3).toUpperCase()} - ${task.number} ${task.title}`,
          type: 'issue',
          isRead: false,
        });

        console.log(`[Cron] ✅ Đã tạo thông báo: ${task.title} - ${action}`);

        // ✅ Gửi mail cho người nhận task
       console.log(`[Cron] 📨 Gửi mail đến: ${task.assignee.email}`);
        // ✅ Gửi mail cho người nhận task
        if (task.assignee.email) {
          await sendMail({
            to: task.assignee.email,
            subject: `🔔 Task "${task.title}" ${action}`,
            html: `
              <p>Xin chào <b>${task.assignee.name}</b>,</p>
              <p>Task <b>${task.title}</b> trong dự án <b>${task.project.name}</b> hiện đang <b>${action}</b>.</p>
              <p>Hạn chót: <b>${dayjs(task.endDate).format('DD/MM/YYYY')}</b></p>
              <hr/>
              <p style="color:gray">Đây là email tự động từ hệ thống.</p>
            `,
          });
        }
        console.log(`[Cron] ✅ Đã gửi mail cảnh báo cho ${task.assignee.email}`);
      }
    } catch (error) {
      console.error('[Cron] ❌ Lỗi kiểm tra deadline:', error);
    }
  },  24 * 60 * 60 * 1000); // mỗi phút
};
