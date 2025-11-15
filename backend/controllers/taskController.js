import db from '../db.js';

export const getTasksForProject = async (req, res) => {
    const { id: projectId } = req.params;
    try {
        const sql = 'SELECT * FROM tasks WHERE project_id = ? ORDER BY task_id';
        const [tasks] = await db.query(sql, [projectId]);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const createTask = async (req, res) => {
    const { project_id, task_name, task_description } = req.body;
    const userId = req.userId;
    const userRole = req.role;

    if (!project_id || !task_name) {
        return res.status(400).json({ message: 'Project ID and task name are required.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        let isAuthorized = false;
        if (userRole === 'mentor') {
            isAuthorized = true;
        } else { 
            const [teams] = await connection.query('SELECT team_id FROM projects WHERE project_id = ?', [project_id]);
            if (teams.length > 0 && teams[0].team_id) {
                const teamId = teams[0].team_id;
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
            return res.status(403).json({ message: 'Not authorized to add tasks to this project.' });
        }

        const sql = 'INSERT INTO tasks (project_id, task_name, task_description) VALUES (?, ?, ?)';
        const [result] = await connection.query(sql, [project_id, task_name, task_description || null]);
        await connection.commit();
        res.status(201).json({ message: 'Task created', taskId: result.insertId });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        connection.release();
    }
};

export const updateTaskStatus = async (req, res) => {
    const { taskId } = req.params;
    const { task_status } = req.body;
    const userId = req.userId;

    if (!task_status) return res.status(400).json({ message: 'Task status is required.' });

    try {
        const [tasks] = await db.query('SELECT project_id FROM tasks WHERE task_id = ?', [taskId]);
        if (tasks.length === 0) return res.status(404).json({ message: 'Task not found' });

        const [teams] = await db.query('SELECT team_id FROM projects WHERE project_id = ?', [tasks[0].project_id]);
        if (teams.length === 0 || !teams[0].team_id) return res.status(403).json({ message: 'Not authorized' });

        const [member] = await db.query('SELECT * FROM team_member WHERE student_id = ? AND team_id = ?', [userId, teams[0].team_id]);
        if (member.length === 0) return res.status(403).json({ message: 'Not authorized' });
        
        const sql = 'UPDATE tasks SET task_status = ? WHERE task_id = ?';
        await db.query(sql, [task_status, taskId]);
        res.status(200).json({ message: 'Task status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    const userId = req.userId;
    const userRole = req.role;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [tasks] = await connection.query('SELECT project_id FROM tasks WHERE task_id = ?', [taskId]);
        if (tasks.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Task not found.' });
        }
        const projectId = tasks[0].project_id;
        
        let isAuthorized = false;
        if (userRole === 'mentor') {
            isAuthorized = true;
        } else { 
            const [teams] = await connection.query('SELECT team_id FROM projects WHERE project_id = ?', [projectId]);
            if (teams.length > 0 && teams[0].team_id) {
                const teamId = teams[0].team_id;
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
            return res.status(403).json({ message: 'Not authorized to delete this task.' });
        }

        await connection.query('DELETE FROM tasks WHERE task_id = ?', [taskId]);
        await connection.commit();
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        connection.release();
    }
};

// ... (keep all existing functions like getTasksForProject, createTask, etc.)

/**
 * @desc    Get all task dependencies for a project
 * @route   GET /api/projects/:id/dependencies
 */
export const getTaskDependenciesForProject = async (req, res) => {
    const { id: projectId } = req.params;
    try {
        const sql = `
            SELECT td.*, t_dep.task_name as dependent_task_name
            FROM task_dependency td
            JOIN tasks t_main ON td.task_id = t_main.task_id
            JOIN tasks t_dep ON td.dependent_task_id = t_dep.task_id
            WHERE t_main.project_id = ?
        `;
        const [dependencies] = await db.query(sql, [projectId]);
        res.status(200).json(dependencies);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * @desc    Create a new dependency between two tasks
 * @route   POST /api/tasks/dependencies
 */
export const createTaskDependency = async (req, res) => {
    const { task_id, dependent_task_id } = req.body;
    if (!task_id || !dependent_task_id) {
        return res.status(400).json({ message: 'Both task IDs are required.' });
    }

    try {
        // Prevent circular dependencies (A -> B and B -> A)
        const [existing] = await db.query(
            'SELECT * FROM task_dependency WHERE task_id = ? AND dependent_task_id = ?',
            [dependent_task_id, task_id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Circular dependency detected.' });
        }
        
        const sql = 'INSERT INTO task_dependency (task_id, dependent_task_id) VALUES (?, ?)';
        await db.query(sql, [task_id, dependent_task_id]);
        res.status(201).json({ message: 'Dependency created.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'This dependency already exists.' });
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};