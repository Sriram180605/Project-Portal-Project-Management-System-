import db from '../db.js';

// @desc    Get all available roles
// @route   GET /api/roles
export const getRoles = async (req, res) => {
    try {
        const [roles] = await db.query('SELECT * FROM roles ORDER BY role_name');
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};