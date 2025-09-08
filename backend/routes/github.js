// routes/github.js
import express from "express";
import axios from 'axios'; // nếu dùng ES6 thì bỏ dòng này
const router = express.Router();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // nên để trong .env
const GITHUB_USERNAME = "kuro-pink"; // ví dụ: "kuro-pink"

router.post("/create-repo", async (req, res) => {
  const { projectName } = req.body;

  try {
    const response = await axios.post(
      "https://api.github.com/user/repos",
      {
        name: projectName,
        private: false, // hoặc true nếu muốn repo private
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    const repoUrl = response.data.html_url;

    // TODO: Lưu repoUrl vào DB gắn với project

    res.json({ success: true, repoUrl });
  } catch (error) {
    console.error("Lỗi tạo repo:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Không thể tạo repo" });
  }
});

export default router;