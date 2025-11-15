import express from 'express';
import { 
    createTask, 
    updateTaskStatus, 
    deleteTask,
    createTaskDependency // <-- Import new function
} from '../controllers/taskController.js';
import { getSubmissionsForTask } from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createTask);

// Add this new route
router.route('/dependencies').post(protect, createTaskDependency);

router.route('/:taskId')
    .put(protect, updateTaskStatus)
    .delete(protect, deleteTask);

router.route('/:taskId/status')
    .put(protect, updateTaskStatus);

router.route('/:taskId/submissions')
    .get(protect, getSubmissionsForTask);

export default router;