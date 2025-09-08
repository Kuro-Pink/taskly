import express from 'express';
import { createStatus, getAllStatuses, deleteStatus, updateStatus } from '../controllers/statusController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createStatus);
router.get('/', protect, getAllStatuses);
router.put('/:id', protect, updateStatus);
router.delete('/:id', protect, deleteStatus);



export default router;
