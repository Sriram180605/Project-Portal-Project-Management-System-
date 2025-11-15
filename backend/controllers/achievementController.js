import db from '../db.js';

// @desc    Get all achievements for a project
// @route   GET /api/projects/:id/achievements
export const getAchievementsForProject = async (req, res) => {
    const { id: projectId } = req.params;
    try {
        const sql = 'SELECT * FROM achievements WHERE project_id = ? ORDER BY date_achieved DESC';
        const [achievements] = await db.query(sql, [projectId]);
        res.status(200).json(achievements);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new achievement
// @route   POST /api/achievements
export const createAchievement = async (req, res) => {
    const { project_id, achievement_name, achievement_description, date_achieved } = req.body;
    if (!project_id || !achievement_name || !date_achieved) {
        return res.status(400).json({ message: 'Project ID, name, and date are required.' });
    }
    // Basic authorization: We'll add this later if needed
    try {
        const sql = 'INSERT INTO achievements (project_id, achievement_name, achievement_description, date_achieved) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [project_id, achievement_name, achievement_description, date_achieved]);
        res.status(201).json({ message: 'Achievement created', achievementId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete an achievement
// @route   DELETE /api/achievements/:id
export const deleteAchievement = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM achievements WHERE achievement_id = ?', [id]);
        res.status(200).json({ message: 'Achievement deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};