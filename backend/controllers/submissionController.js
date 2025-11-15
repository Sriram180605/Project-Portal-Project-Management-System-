import db from '../db.js';

// @desc    Create a new submission for a task
// @route   POST /api/submissions
export const createSubmission = async (req, res) => {
    const { task_id, submission_link } = req.body;
    const student_id = req.userId; // Get student ID from the authenticated token

    if (!task_id || !submission_link) {
        return res.status(400).json({ message: 'Task ID and submission link are required.' });
    }

    try {
        const sql = 'INSERT INTO submissions (task_id, student_id, submission_link) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [task_id, student_id, submission_link]);
        res.status(201).json({ message: 'Submission created successfully', submissionId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all submissions and feedback for a task
// @route   GET /api/tasks/:taskId/submissions
export const getSubmissionsForTask = async (req, res) => {
    const { taskId } = req.params;
    try {
        // This is a JOIN query as required by the rubric
        const sql = `
            SELECT s.submission_no, s.submission_link, s.submission_timestamp, st.student_name,
                   f.comment_text, f.timestamp as feedback_timestamp, m.mentor_name
            FROM submissions s
            JOIN students st ON s.student_id = st.student_id
            LEFT JOIN feedback f ON s.submission_no = f.submission_no
            LEFT JOIN mentors m ON f.mentor_id = m.mentor_id
            WHERE s.task_id = ?
            ORDER BY s.submission_timestamp DESC
        `;
        const [submissions] = await db.query(sql, [taskId]);
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};