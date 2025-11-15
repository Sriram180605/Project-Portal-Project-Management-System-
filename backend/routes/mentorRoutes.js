import express from 'express';
import { getMentorProfile, updateMentorProfile } from '../controllers/mentorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
    .get(protect, getMentorProfile)
    .put(protect, updateMentorProfile);

export default router;