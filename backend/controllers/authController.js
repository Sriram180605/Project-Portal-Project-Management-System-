import db from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper function to generate a token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

// --- MENTOR FUNCTIONS ---

// @desc    Register a new mentor
// @route   POST /api/auth/mentor/signup
export const signupMentor = async (req, res) => {
    const { mentor_name, mentor_mail, password } = req.body;

    if (!mentor_name || !mentor_mail || !password) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        const [existingMentor] = await db.query('SELECT * FROM mentors WHERE mentor_mail = ?', [mentor_mail]);
        if (existingMentor.length > 0) {
            return res.status(400).json({ message: 'Mentor with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const sql = 'INSERT INTO mentors (mentor_name, mentor_mail, password) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [mentor_name, mentor_mail, hashedPassword]);
        
        res.status(201).json({
            id: result.insertId,
            name: mentor_name,
            email: mentor_mail,
            role: 'mentor',
            token: generateToken(result.insertId, 'mentor'),
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Authenticate a mentor and get token
// @route   POST /api/auth/mentor/login
export const loginMentor = async (req, res) => {
    const { mentor_mail, password } = req.body;

    try {
        const [mentors] = await db.query('SELECT * FROM mentors WHERE mentor_mail = ?', [mentor_mail]);
        
        if (mentors.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const mentor = mentors[0];
        const isMatch = await bcrypt.compare(password, mentor.password);

        if (isMatch) {
            res.json({
                id: mentor.mentor_id,
                name: mentor.mentor_name,
                email: mentor.mentor_mail,
                role: 'mentor',
                token: generateToken(mentor.mentor_id, 'mentor'),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


// --- STUDENT FUNCTIONS ---

// @desc    Register a new student
// @route   POST /api/auth/student/signup
export const signupStudent = async (req, res) => {
    const { student_name, student_mail, password, skills } = req.body; // Expects a skills string

    if (!student_name || !student_mail || !password) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [existingStudent] = await connection.query('SELECT * FROM students WHERE student_mail = ?', [student_mail]);
        if (existingStudent.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: 'Student with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const studentSql = 'INSERT INTO students (student_name, student_mail, password) VALUES (?, ?, ?)';
        const [result] = await connection.query(studentSql, [student_name, student_mail, hashedPassword]);
        const studentId = result.insertId;
        
        const skillNames = skills ? skills.split(',').map(skill => skill.trim()).filter(skill => skill) : [];
        if (skillNames.length > 0) {
            const skillIds = [];
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
            
            if (skillIds.length > 0) {
                const skillSql = 'INSERT INTO student_skill (student_id, skill_id) VALUES ?';
                const skillValues = skillIds.map(id => [studentId, id]);
                await connection.query(skillSql, [skillValues]);
            }
        }

        await connection.commit();
        
        res.status(201).json({
            id: studentId,
            name: student_name,
            email: student_mail,
            role: 'student',
            token: generateToken(studentId, 'student'),
        });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server Error', error: error.message });
    } finally {
        connection.release();
    }
};

// @desc    Authenticate a student and get token
// @route   POST /api/auth/student/login
export const loginStudent = async (req, res) => {
    const { student_mail, password } = req.body;

    try {
        const [students] = await db.query('SELECT * FROM students WHERE student_mail = ?', [student_mail]);
        
        if (students.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const student = students[0];
        const isMatch = await bcrypt.compare(password, student.password);

        if (isMatch) {
            res.json({
                id: student.student_id,
                name: student.student_name,
                email: student.student_mail,
                role: 'student',
                token: generateToken(student.student_id, 'student'),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};