import db from '../db.js';

// @desc    Get all available skills
// @route   GET /api/skills
export const getSkills = async (req, res) => {
    try {
        const [skills] = await db.query('SELECT * FROM skills ORDER BY skill_name');
        res.status(200).json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new skill
// @route   POST /api/skills
export const createSkill = async (req, res) => {
    const { skill_name } = req.body;
    if (!skill_name) return res.status(400).json({ message: 'Skill name is required.' });

    try {
        const sql = 'INSERT INTO skills (skill_name) VALUES (?)';
        const [result] = await db.query(sql, [skill_name]);
        res.status(201).json({ message: 'Skill created', skillId: result.insertId });
    } catch (error) {
        // Handle potential duplicate entry
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'This skill already exists.' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};