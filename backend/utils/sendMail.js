import nodemailer from 'nodemailer';

const sendMail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USERNAME, // ví dụ: yourname@gmail.com
        pass: process.env.GMAIL_PASSWORD, // app password (mật khẩu ứng dụng)
      },
    });

    await transporter.sendMail({
      from: `"Taskly System" <${process.env.GMAIL_USERNAME}>`, // ⚠️ dùng đúng email thật
      to,
      subject,
      html,
    });

    console.log(`[Mail] ✅ Đã gửi mail tới ${to}: ${subject}`);
  } catch (error) {
    console.error(`[Mail] ❌ Lỗi gửi mail tới ${to}:`, error);
  }
};

export default sendMail;
