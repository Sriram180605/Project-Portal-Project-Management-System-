import express from 'express';
import { createSubmission, getSubmissionsForTask } from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to create a new submission
router.route('/').post(protect, createSubmission);

// This route is technically part of the task resource, but we can put it here for simplicity
// A more RESTful approach would be router.get('/tasks/:taskId/submissions', ...)
// Let's add it to taskRoutes instead for better structure.

export default router;