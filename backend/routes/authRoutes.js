import express from 'express';
import { signupMentor, loginMentor, signupStudent, loginStudent } from '../controllers/authController.js';

const router = express.Router();

router.post('/mentor/signup', signupMentor);
router.post('/mentor/login', loginMentor);
router.post('/student/signup', signupStudent);
router.post('/student/login', loginStudent);

export default router;