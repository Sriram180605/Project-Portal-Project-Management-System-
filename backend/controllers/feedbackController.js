import db from '../db.js';

// @desc    Create feedback for a submission
// @route   POST /api/feedback
export const createFeedback = async (req, res) => {
    const { submission_no, comment_text } = req.body;
    const mentor_id = req.userId;
    const userRole = req.role;

    if (userRole !== 'mentor') {
        return res.status(403).json({ message: 'Only mentors can provide feedback.' });
    }

    if (!submission_no || !comment_text) {
        return res.status(400).json({ message: 'Submission number and comment text are required.' });
    }

    try {
        const sql = 'INSERT INTO feedback (submission_no, mentor_id, comment_text) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [submission_no, mentor_id, comment_text]);
        res.status(201).json({ message: 'Feedback created', feedbackId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};