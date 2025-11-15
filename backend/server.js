import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './db.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js'; // <-- ADD THIS

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
  res.send('API is running successfully.');
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/achievements', achievementRoutes); // <-- ADD THIS

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));