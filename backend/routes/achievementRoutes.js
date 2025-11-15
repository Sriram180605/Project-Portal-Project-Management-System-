import express from 'express';
import { createAchievement, deleteAchievement } from '../controllers/achievementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createAchievement);
router.route('/:id').delete(protect, deleteAchievement);

export default router;