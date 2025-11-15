import express from 'express';
import { getSkills, createSkill } from '../controllers/skillController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getSkills).post(protect, createSkill);

export default router;