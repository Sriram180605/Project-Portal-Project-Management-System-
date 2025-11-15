import db from '../db.js';

export const getTeams = async (req, res) => {
    try {
        const sql = `
            SELECT 
                t.team_id,
                t.team_name,
                p.project_title,
                GROUP_CONCAT(s.student_name SEPARATOR ', ') as members
            FROM teams t
            LEFT JOIN projects p ON t.project_id = p.project_id
            LEFT JOIN team_member tm ON t.team_id = tm.team_id
            LEFT JOIN students s ON tm.student_id = s.student_id
            GROUP BY t.team_id
            ORDER BY t.created_at DESC
        `;
        const [teams] = await db.query(sql);
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * THIS IS THE CORRECTED FUNCTION
 * It dynamically finds the 'Team Lead' role ID instead of hardcoding it.
 */
export const createTeamByStudent = async (req, res) => {
    const { team_name } = req.body;
    const student_id = req.userId;

    if (!team_name) {
        return res.status(400).json({ message: 'Team name is required.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Step 1: Find the role_id for 'Team Lead' dynamically
        const [roles] = await connection.query("SELECT role_id FROM roles WHERE role_name = 'Team Lead'");
        if (roles.length === 0) {
            await connection.rollback();
            return res.status(500).json({ message: "Configuration error: 'Team Lead' role not found in the database." });
        }
        const teamLeadRoleId = roles[0].role_id;

        // Step 2: Insert the new team
        const teamSql = 'INSERT INTO teams (team_name) VALUES (?)';
        const [teamResult] = await connection.query(teamSql, [team_name]);
        const teamId = teamResult.insertId;

        // Step 3: Insert the creator as the Team Lead using the dynamically found ID
        const memberSql = 'INSERT INTO team_member (team_id, student_id, role_id) VALUES (?, ?, ?)';
        await connection.query(memberSql, [teamId, student_id, teamLeadRoleId]);

        await connection.commit();
        res.status(201).json({ message: 'Team created successfully', teamId: teamId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        connection.release();
    }
};

export const createTeamForProject = async (req, res) => {
    const { project_id, team_name, members } = req.body; 
    if (!project_id || !team_name || !members || members.length === 0) {
        return res.status(400).json({ message: 'Project ID, team name, and members are required.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const teamSql = 'INSERT INTO teams (project_id, team_name) VALUES (?, ?)';
        const [teamResult] = await connection.query(teamSql, [project_id, team_name]);
        const teamId = teamResult.insertId;
        
        await connection.query('UPDATE projects SET team_id = ? WHERE project_id = ?', [teamId, project_id]);

        const memberSql = 'INSERT INTO team_member (team_id, student_id, role_id) VALUES ?';
        const memberValues = members.map(member => [teamId, member.student_id, member.role_id]);
        await connection.query(memberSql, [memberValues]);

        await connection.commit();
        res.status(201).json({ message: 'Team created successfully', teamId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        connection.release();
    }
};

export const getMyTeams = async (req, res) => {
    const student_id = req.userId;
    try {
        const sql = `
            SELECT t.team_id, t.team_name, r.role_name, t.project_id
            FROM teams t
            JOIN team_member tm ON t.team_id = tm.team_id
            LEFT JOIN roles r ON tm.role_id = r.role_id 
            WHERE tm.student_id = ?
        `;
        const [teams] = await db.query(sql, [student_id]);
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const getTeamMembers = async (req, res) => {
    const { teamId } = req.params;
    try {
        const [members] = await db.query('CALL GetTeamDetails(?)', [teamId]);
        res.status(200).json(members[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteTeam = async (req, res) => {
    const { teamId } = req.params;
    const userId = req.userId;
    const userRole = req.role;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        let isAuthorized = false;

        // Authorize mentors to delete any team
        if (userRole === 'mentor') {
            isAuthorized = true;
        } 
        // Authorize students only if they are the Team Lead AND the team is not on a mentor's project
        else if (userRole === 'student') {
            // Check if team is assigned to a mentor project
            const [projects] = await connection.query('SELECT mentor_id FROM projects WHERE team_id = ?', [teamId]);
            const isMentorProject = projects.length > 0 && projects[0].mentor_id;
            
            if (!isMentorProject) {
                const [member] = await connection.query(
                    'SELECT r.role_name FROM team_member tm JOIN roles r ON tm.role_id = r.role_id WHERE tm.student_id = ? AND tm.team_id = ?',
                    [userId, teamId]
                );
                if (member.length > 0 && member[0].role_name === 'Team Lead') {
                    isAuthorized = true;
                }
            }
        }

        if (!isAuthorized) {
            await connection.rollback();
            return res.status(403).json({ message: 'You are not authorized to delete this team.' });
        }
        
        await connection.query('DELETE FROM teams WHERE team_id = ?', [teamId]);

        await connection.commit();
        res.status(200).json({ message: 'Team deleted successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        connection.release();
    }
};