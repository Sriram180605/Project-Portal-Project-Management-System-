import express from 'express';
import { getRoles } from '../controllers/roleController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Anyone logged in can see the roles
router.route('/').get(protect, getRoles);

export default router;