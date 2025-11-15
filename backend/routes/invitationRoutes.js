import express from 'express';
import { getMyInvitations, sendInvitation, respondToInvitation } from '../controllers/invitationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getMyInvitations)
    .post(protect, sendInvitation);

router.route('/:id').put(protect, respondToInvitation);

export default router;