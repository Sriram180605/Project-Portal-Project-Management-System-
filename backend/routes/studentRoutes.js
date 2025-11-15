import express from 'express';
import { getStudents, updateStudentProfile, getMyProjects, getStudentProfile } from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getStudents); // For mentor to see all students

router.route('/profile')
    .get(protect, getStudentProfile)
    .put(protect, updateStudentProfile);

router.route('/my-projects').get(protect, getMyProjects);

export default router;