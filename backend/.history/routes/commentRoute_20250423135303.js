// routes/commentRoute.js
import express from 'express';
import { addComment, getCommentsByIssue } from '../controllers/commentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, addComment);
router.get('/:issueId', authenticate, getCommentsByIssue);

export default router;
