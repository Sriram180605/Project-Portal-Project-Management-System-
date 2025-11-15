import express from 'express';
import { 
    getProjects, 
    createProject, 
    getProjectById,
    updateProject,
    deleteProject,
    getProjectStats,
    getAuditLog,
    getMyRoleForProject,
    enrollStudent,
    getEnrolledStudents,
    getMentorProjects
} from '../controllers/projectController.js';
import { getTasksForProject } from '../controllers/taskController.js';
import { getAchievementsForProject } from '../controllers/achievementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { getTaskDependenciesForProject } from '../controllers/taskController.js';

const router = express.Router();

router.get('/my-projects', protect, getMentorProjects);

router.route('/')
    .get(protect, getProjects)
    .post(protect, createProject);

router.route('/:id')
    .get(protect, getProjectById)
    .put(protect, updateProject)
    .delete(protect, deleteProject);

router.route('/:id/tasks')
    .get(protect, getTasksForProject);

router.route('/:id/statistics')
    .get(protect, getProjectStats);

router.route('/:id/audit')
    .get(protect, getAuditLog);

router.route('/:id/my-role')
    .get(protect, getMyRoleForProject);
    
router.route('/:id/achievements')
    .get(protect, getAchievementsForProject);

router.route('/:id/enrollments')
    .get(protect, getEnrolledStudents);

router.route('/:id/enroll')
    .post(protect, enrollStudent);

router.route('/:id/dependencies')
    .get(protect, getTaskDependenciesForProject);

export default router;