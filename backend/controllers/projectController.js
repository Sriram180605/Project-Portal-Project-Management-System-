import db from '../db.js';

export const getProjects = async (req, res) => {
    try {
        const sql = `
            SELECT 
                *, 
                CalculateProjectProgress(project_id) AS progress_percentage,
                DaysUntilDeadline(project_deadline) AS days_left,
                GetTeamLeadName(team_id) AS team_lead
            FROM projects 
            ORDER BY created_at DESC
        `;
        const [projects] = await db.query(sql);
        res.status(200).json(projects);
    } catch (error) { 
        res.status(500).json({ message: 'Server Error' }); 
    }
};

export const getMentorProjects = async (req, res) => {
  try {
    const mentorId = req.userId;
    const sql = `
      SELECT 
          p.*, 
          CalculateProjectProgress(p.project_id) AS progress_percentage,
          DaysUntilDeadline(p.project_deadline) AS days_left,
          GetTeamLeadName(p.team_id) AS team_lead
      FROM projects p
      WHERE p.mentor_id = ? 
      ORDER BY p.created_at DESC
    `;
    const [projects] = await db.query(sql, [mentorId]);
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching mentor projects:', error);
    res.status(500).json({ message: 'Server error while fetching projects.' });
  }
};

export const createProject = async (req, res) => {
    const { project_title, project_description, project_deadline, team_id } = req.body;
    const userId = req.userId;
    const userRole = req.role;

    if (!project_title || !project_deadline) {
        return res.status(400).json({ message: 'Title and deadline are required.' });
    }

    try {
        if (userRole === 'mentor') {
            const sql = 'INSERT INTO projects (mentor_id, project_title, project_description, project_deadline) VALUES (?, ?, ?, ?)';
            const [result] = await db.query(sql, [userId, project_title, project_description, project_deadline]);
            return res.status(201).json({ message: 'Project created', projectId: result.insertId });
        }

        if (userRole === 'student') {
            if (!team_id) {
                return res.status(400).json({ message: 'A team ID is required for students to create a project.' });
            }
            const [member] = await db.query(
                'SELECT r.role_name FROM team_member tm JOIN roles r ON tm.role_id = r.role_id WHERE tm.student_id = ? AND tm.team_id = ?', 
                [userId, team_id]
            );

            if (member.length === 0 || member[0].role_name !== 'Team Lead') {
                return res.status(403).json({ message: 'Not authorized. Only the Team Lead can create a project for this team.' });
            }

            const sql = 'INSERT INTO projects (project_title, project_description, project_deadline, team_id) VALUES (?, ?, ?, ?)';
            const [result] = await db.query(sql, [project_title, project_description, project_deadline, team_id]);
            return res.status(201).json({ message: 'Project created', projectId: result.insertId });
        }
    } catch (error) { 
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * MODIFIED: This function now also returns the project's progress percentage.
 */
export const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const sql = `
            SELECT *, CalculateProjectProgress(project_id) AS progress_percentage 
            FROM projects 
            WHERE project_id = ?
        `;
        const [projects] = await db.query(sql, [id]);
        if (projects.length === 0) return res.status(404).json({ message: 'Project not found' });
        res.status(200).json(projects[0]);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

export const updateProject = async (req, res) => {
    const { id } = req.params;
    const { project_title, project_description, project_deadline } = req.body;
    if (!project_title || !project_deadline) return res.status(400).json({ message: 'Title and deadline are required.' });
    
    try {
        const sql = 'UPDATE projects SET project_title = ?, project_description = ?, project_deadline = ? WHERE project_id = ?';
        await db.query(sql, [project_title, project_description, project_deadline, id]);
        res.status(200).json({ message: 'Project updated successfully' });
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

/**
 * MODIFIED: This function now prevents students from deleting mentor-owned projects.
 */
export const deleteProject = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.role;

    try {
        const [projects] = await db.query('SELECT mentor_id, team_id FROM projects WHERE project_id = ?', [id]);
        if (projects.length === 0) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        const project = projects[0];

        let isAuthorized = false;
        
        if (userRole === 'mentor' && project.mentor_id === userId) {
            isAuthorized = true;
        } 
        else if (userRole === 'student' && !project.mentor_id) { // Student can ONLY delete if it's NOT a mentor project
            if (project.team_id) {
                const [member] = await db.query(
                    'SELECT r.role_name FROM team_member tm JOIN roles r ON tm.role_id = r.role_id WHERE tm.student_id = ? AND tm.team_id = ?', 
                    [userId, project.team_id]
                );
                if (member.length > 0 && member[0].role_name === 'Team Lead') {
                    isAuthorized = true;
                }
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ message: 'You are not authorized to delete this project.' });
        }

        await db.query('DELETE FROM projects WHERE project_id = ?', [id]);
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) { 
        res.status(500).json({ message: 'Server Error', error: error.message }); 
    }
};

export const getProjectStats = async (req, res) => {
    const { id } = req.params;
    try {
        const [results] = await db.query('CALL GetProjectStatistics(?)', [id]);
        res.status(200).json(results[0][0]);
    } catch (error) { res.status(500).json({ message: 'Server Error', error: error.message }); }
};

export const getAuditLog = async (req, res) => {
    const { id } = req.params;
    try {
        const [logs] = await db.query('SELECT * FROM audit_log WHERE project_id = ? ORDER BY changed_at DESC', [id]);
        res.status(200).json(logs);
    } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

export const getMyRoleForProject = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    try {
        const [teams] = await db.query('SELECT team_id FROM projects WHERE project_id = ?', [id]);
        if (teams.length === 0 || !teams[0].team_id) return res.status(404).json({ message: 'Project is not assigned to a team' });
        
        const [member] = await db.query(
            'SELECT r.role_name FROM team_member tm JOIN roles r ON tm.role_id = r.role_id WHERE tm.student_id = ? AND tm.team_id = ?', 
            [userId, teams[0].team_id]
        );
        
        if (member.length === 0) return res.json({ role: null });
        
        res.json({ role: member[0].role_name });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const enrollStudent = async (req, res) => {
    const { id: projectId } = req.params;
    const { student_id } = req.body;
    const mentor_id = req.userId;

    try {
        const sql = 'INSERT INTO project_enrollment (project_id, student_id, mentor_id) VALUES (?, ?, ?)';
        await db.query(sql, [projectId, student_id, mentor_id]);
        res.status(201).json({ message: 'Student enrolled successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getEnrolledStudents = async (req, res) => {
    const { id: projectId } = req.params;
    try {
        const sql = `
            SELECT s.student_id, s.student_name, s.student_mail 
            FROM students s
            JOIN project_enrollment pe ON s.student_id = pe.student_id
            WHERE pe.project_id = ?
        `;
        const [students] = await db.query(sql, [projectId]);
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};