// routes/commentRoute.js
import express from 'express';
import { createComment, getCommentsByIssue,updateComment, deleteComment } from '../controllers/commentController.js';
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/:issueId', protect, getCommentsByIssue);
router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

export default router;
