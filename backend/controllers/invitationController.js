import db from '../db.js';

// @desc    Get all pending invitations for the logged-in user
// @route   GET /api/invitations
export const getMyInvitations = async (req, res) => {
    const receiver_id = req.userId;
    try {
        const sql = `
            SELECT i.invitation_id, s.student_name as sender_name, t.team_name, r.role_name
            FROM invitations i
            JOIN students s ON i.sender_id = s.student_id
            JOIN teams t ON i.team_id = t.team_id
            JOIN roles r ON i.role_id = r.role_id
            WHERE i.receiver_id = ? AND i.status = 'pending'
        `;
        const [invitations] = await db.query(sql, [receiver_id]);
        res.status(200).json(invitations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Send a new invitation with a specific role
// @route   POST /api/invitations
export const sendInvitation = async (req, res) => {
    const { receiver_id, team_id, role_id } = req.body;
    const sender_id = req.userId;

    if (!receiver_id || !team_id || !role_id) {
        return res.status(400).json({ message: 'Receiver, team, and role are required.' });
    }
    
    // Prevent sending an invite to oneself
    if (parseInt(receiver_id) === sender_id) {
        return res.status(400).json({ message: 'You cannot invite yourself to a team.' });
    }

    try {
        // Check if the user is already a member of the team
        const [members] = await db.query('SELECT * FROM team_member WHERE student_id = ? AND team_id = ?', [receiver_id, team_id]);
        if (members.length > 0) {
            return res.status(400).json({ message: 'This student is already a member of the team.' });
        }

        // Check if there is already a pending invitation
        const [pendingInvites] = await db.query('SELECT * FROM invitations WHERE receiver_id = ? AND team_id = ? AND status = "pending"', [receiver_id, team_id]);
        if (pendingInvites.length > 0) {
            return res.status(400).json({ message: 'This student already has a pending invitation for this team.' });
        }

        // If all checks pass, create the invitation
        const sql = 'INSERT INTO invitations (sender_id, receiver_id, team_id, role_id) VALUES (?, ?, ?, ?)';
        await db.query(sql, [sender_id, receiver_id, team_id, role_id]);
        res.status(201).json({ message: 'Invitation sent successfully.' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Respond to an invitation (accept or decline)
// @route   PUT /api/invitations/:id
export const respondToInvitation = async (req, res) => {
    const { id } = req.params; // invitation_id
    const { status } = req.body; // 'accepted' or 'declined'
    const student_id = req.userId;

    if (!status || !['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ message: 'A valid status (accepted/declined) is required.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [invitations] = await connection.query('SELECT * FROM invitations WHERE invitation_id = ?', [id]);
        if (invitations.length === 0 || invitations[0].receiver_id !== student_id) {
            await connection.rollback();
            return res.status(404).json({ message: 'Invitation not found or you are not authorized to respond.' });
        }
        
        const invitation = invitations[0];
        
        await connection.query('UPDATE invitations SET status = ? WHERE invitation_id = ?', [status, id]);
        
        if (status === 'accepted') {
            const { team_id, role_id } = invitation; 
            const memberSql = 'INSERT INTO team_member (team_id, student_id, role_id) VALUES (?, ?, ?)';
            await connection.query(memberSql, [team_id, student_id, role_id]);
        }
        
        await connection.commit();
        res.status(200).json({ message: `Invitation ${status}.` });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        connection.release();
    }
};