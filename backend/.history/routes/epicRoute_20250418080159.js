import express from 'express';
import {
  createEpic,
  getEpicsByProject,
  updateEpic,
  deleteEpic,
} from '../controllers/epicController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createEpic);
router.get('/project/:projectId', protect, getEpicsByProject);
router.put('/:projectId', protect, updateEpic);
router.delete('/:projectId', protect, deleteEpic);

export default router;
