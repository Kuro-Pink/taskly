import express from 'express';
import {
  createEpic,
  getAllEpic,
  updateEpic,
  deleteEpic,
} from '../controllers/epicController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createEpic);
router.get('/', protect, getAllEpic);
router.put('/:epicId', protect, updateEpic);
router.delete('/:epicId', protect, deleteEpic);

export default router;
