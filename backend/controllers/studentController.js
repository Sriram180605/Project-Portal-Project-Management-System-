import db from '../db.js';

export const getStudents = async (req, res) => {
    const { skill } = req.query;
    try {
        let sql = `
            SELECT s.student_id, s.student_name, s.student_mail, GROUP_CONCAT(sk.skill_name SEPARATOR ', ') as skills
            FROM students s
            LEFT JOIN student_skill ss ON s.student_id = ss.student_id
            LEFT JOIN skills sk ON ss.skill_id = sk.skill_id
        `;
        const params = [];

        if (skill) {
            sql += ` WHERE s.student_id IN (
                        SELECT ss_inner.student_id FROM student_skill ss_inner
                        JOIN skills sk_inner ON ss_inner.skill_id = sk_inner.skill_id
                        WHERE sk_inner.skill_name LIKE ?
                    )`;
            params.push(`%${skill}%`);
        }
        
        sql += ` GROUP BY s.student_id ORDER BY s.student_name`;
        const [students] = await db.query(sql, params);
        res.status(200).json(students);
    } catch (error) { 
        res.status(500).json({ message: 'Server Error' }); 
    }
};

export const getMyProjects = async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.*, 
                t.team_name, 
                m.mentor_name,
                CalculateProjectProgress(p.project_id) AS progress_percentage,
                DaysUntilDeadline(p.project_deadline) AS days_left
            FROM projects p
            JOIN teams t ON p.team_id = t.team_id
            LEFT JOIN mentors m ON p.mentor_id = m.mentor_id
            WHERE p.team_id IN (
                SELECT team_id FROM team_member WHERE student_id = ?
            )
        `;
        const [projects] = await db.query(sql, [req.userId]);
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getStudentProfile = async (req, res) => {
    try {
        const [results] = await db.query('CALL GetStudentProfileDetails(?)', [req.userId]);
        const profile = results[0][0];

        if (!profile) return res.status(404).json({ message: 'Student not found' });
        
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const updateStudentProfile = async (req, res) => {
    const { student_name, student_mail, skills } = req.body;
    const studentId = req.userId;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const studentSql = 'UPDATE students SET student_name = ?, student_mail = ? WHERE student_id = ?';
        await connection.query(studentSql, [student_name, student_mail, studentId]);

        const skillNames = skills ? skills.split(',').map(skill => skill.trim()).filter(skill => skill) : [];
        const skillIds = [];

        if (skillNames.length > 0) {
            for (const name of skillNames) {
                let [existingSkills] = await connection.query('SELECT skill_id FROM skills WHERE skill_name = ?', [name]);
                let skillId;
                if (existingSkills.length > 0) {
                    skillId = existingSkills[0].skill_id;
                } else {
                    const [newSkillResult] = await connection.query('INSERT INTO skills (skill_name) VALUES (?)', [name]);
                    skillId = newSkillResult.insertId;
                }
                skillIds.push(skillId);
            }
        }

        await connection.query('DELETE FROM student_skill WHERE student_id = ?', [studentId]);

        if (skillIds.length > 0) {
            const skillSql = 'INSERT INTO student_skill (student_id, skill_id) VALUES ?';
            const skillValues = skillIds.map(id => [studentId, id]);
            await connection.query(skillSql, [skillValues]);
        }

        await connection.commit();
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        connection.release();
    }
};