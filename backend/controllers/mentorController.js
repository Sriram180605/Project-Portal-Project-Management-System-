import db from '../db.js';

// @desc    Get mentor profile
// @route   GET /api/mentors/profile
export const getMentorProfile = async (req, res) => {
    try {
        const [mentors] = await db.query('SELECT mentor_id, mentor_name, mentor_mail FROM mentors WHERE mentor_id = ?', [req.userId]);
        if (mentors.length === 0) return res.status(404).json({ message: 'Mentor not found' });
        res.json(mentors[0]);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update mentor profile
// @route   PUT /api/mentors/profile
export const updateMentorProfile = async (req, res) => {
    const { mentor_name, mentor_mail } = req.body;
    try {
        const sql = 'UPDATE mentors SET mentor_name = ?, mentor_mail = ? WHERE mentor_id = ?';
        await db.query(sql, [mentor_name, mentor_mail, req.userId]);
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};