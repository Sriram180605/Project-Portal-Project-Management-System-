import express from 'express';
import { 
    createTeamByStudent,
    getMyTeams,
    getTeamMembers,
    deleteTeam,
    createTeamForProject,
    getTeams // <-- Import new function
} from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for mentors to get an overview of all teams
router.get('/', protect, getTeams); // <-- Add this new route

// Route for students creating their own team
router.post('/by-student', protect, createTeamByStudent);

// Route for mentors creating a team for a specific project
router.post('/for-project', protect, createTeamForProject);

// Route to get all teams for the logged-in student
router.get('/my-teams', protect, getMyTeams);

// Routes for a specific team (get members or delete the team)
router.route('/:teamId')
    .get(protect, getTeamMembers)
    .delete(protect, deleteTeam);

export default router;