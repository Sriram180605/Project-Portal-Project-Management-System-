import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: '/api',
});

// Add a request interceptor to include the token in all requests
api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Auth Service ---
export const login = (role, credentials) => api.post(`/auth/${role}/login`, credentials);
export const signup = (role, userData) => api.post(`/auth/${role}/signup`, userData);

// --- Project Service ---
export const getMentorProjects = () => api.get('/projects/my-projects'); // New function
export const getProjects = () => api.get('/projects');
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (projectData) => api.post('/projects', projectData);
export const updateProject = (id, projectData) => api.put(`/projects/${id}`, projectData);
export const deleteProject = (id) => api.delete(`/projects/${id}`);
export const getProjectStats = (id) => api.get(`/projects/${id}/statistics`);
export const getProjectAuditLog = (id) => api.get(`/projects/${id}/audit`);
export const getMyRoleForProject = (id) => api.get(`/projects/${id}/my-role`);

// --- Student Service ---
export const getStudents = (skill = '') => api.get(`/students?skill=${skill}`);
export const getMyProjects = () => api.get('/students/my-projects');
export const getStudentProfile = () => api.get('/students/profile');
export const updateStudentProfile = (profileData) => api.put('/students/profile', profileData);

// --- Mentor Service ---
export const getMentorProfile = () => api.get('/mentors/profile');
export const updateMentorProfile = (profileData) => api.put('/mentors/profile', profileData);

// --- General Service ---
export const getSkills = () => api.get('/skills');
export const getRoles = () => api.get('/roles');

// --- Task Service ---
export const getTasksForProject = (projectId) => api.get(`/projects/${projectId}/tasks`);
export const createTask = (taskData) => api.post('/tasks', taskData);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);
export const updateTaskStatus = (taskId, status) => api.put(`/tasks/${taskId}/status`, { task_status: status });

// --- Team Service ---
export const createTeam = (teamData) => api.post('/teams/by-student', teamData);
export const getMyTeams = () => api.get('/teams/my-teams');
export const getTeamMembers = (teamId) => api.get(`/teams/${teamId}`); // Corrected path
export const deleteTeam = (teamId) => api.delete(`/teams/${teamId}`);
export const createTeamForProject = (teamData) => api.post('/teams/for-project', teamData);

// --- Invitation Service ---
export const getMyInvitations = () => api.get('/invitations');
export const sendInvitation = (invitationData) => api.post('/invitations', invitationData);
export const respondToInvitation = (id, status) => api.put(`/invitations/${id}`, { status });

// --- Submission Service ---
export const createSubmission = (submissionData) => api.post('/submissions', submissionData);
export const getSubmissionsForTask = (taskId) => api.get(`/tasks/${taskId}/submissions`);

// --- Feedback Service ---
export const createFeedback = (feedbackData) => api.post('/feedback', feedbackData);

// --- Enrollment Service ---
export const enrollStudent = (projectId, studentId) => api.post(`/projects/${projectId}/enroll`, { student_id: studentId });
export const getEnrolledStudents = (projectId) => api.get(`/projects/${projectId}/enrollments`);

export const getTeams = () => api.get('/teams');

// --- Achievement Service ---
export const getAchievementsForProject = (projectId) => api.get(`/projects/${projectId}/achievements`);
export const createAchievement = (achievementData) => api.post('/achievements', achievementData);
export const deleteAchievement = (achievementId) => api.delete(`/achievements/${achievementId}`);


export const getTaskDependenciesForProject = (projectId) => api.get(`/projects/${projectId}/dependencies`);
export const createTaskDependency = (dependencyData) => api.post('/tasks/dependencies', dependencyData);

export default api;