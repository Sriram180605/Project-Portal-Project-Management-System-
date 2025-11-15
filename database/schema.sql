CREATE DATABASE IF NOT EXISTS project_management_db;
USE project_management_db;

-- TABLE DEFINITIONS (with one addition to 'projects')
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    student_mail VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mentors (
    mentor_id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_name VARCHAR(100) NOT NULL,
    mentor_mail VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT, -- This column was added previously
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT,
    project_deadline DATE NOT NULL,
    project_status ENUM('Ongoing', 'Completed', 'On Hold') NOT NULL DEFAULT 'Ongoing', -- NEW COLUMN
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- Foreign key will be added after 'teams' table is created
);

CREATE TABLE teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNIQUE,
    team_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE SET NULL
);

-- Add the foreign key to projects now that teams exists
ALTER TABLE projects ADD FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE SET NULL;

CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    task_status ENUM('To-Do', 'In Progress', 'Done') NOT NULL DEFAULT 'To-Do',
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- (Other table definitions like submissions, feedback, etc. remain the same)
CREATE TABLE submissions (
    submission_no INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_link VARCHAR(2048) NOT NULL,
    submission_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    submission_no INT NOT NULL,
    mentor_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_no) REFERENCES submissions(submission_no) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE
);

CREATE TABLE achievements (
    achievement_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    achievement_description TEXT,
    date_achieved DATE NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

CREATE TABLE invitations (
    invitation_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    team_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'declined') NOT NULL DEFAULT 'pending',
    FOREIGN KEY (sender_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE
);

CREATE TABLE student_skill (
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (student_id, skill_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

CREATE TABLE team_member (
    team_id INT NOT NULL,
    student_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (team_id, student_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

CREATE TABLE task_dependency (
    task_id INT NOT NULL,
    dependent_task_id INT NOT NULL,
    PRIMARY KEY (task_id, dependent_task_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (dependent_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

CREATE TABLE project_enrollment (
    project_id INT NOT NULL,
    student_id INT NOT NULL,
    mentor_id INT NOT NULL,
    PRIMARY KEY (project_id, student_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE
);

CREATE TABLE audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    change_description VARCHAR(255),
    changed_by_user VARCHAR(100), 
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- --- TRIGGERS (3 TOTAL) ---

-- TRIGGER 1 OF 3: Logs changes to a project's deadline. (Existing)
DELIMITER $$
CREATE TRIGGER after_project_deadline_update
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
    IF OLD.project_deadline <> NEW.project_deadline THEN
        INSERT INTO audit_log(project_id, change_description, changed_by_user)
        VALUES(OLD.project_id, 
               CONCAT('Deadline changed from ', OLD.project_deadline, ' to ', NEW.project_deadline),
               CURRENT_USER());
    END IF;
END$$
DELIMITER ;

-- TRIGGER 2 OF 3: Prevents a student from sending an invitation to themselves. (New)
DELIMITER $$
CREATE TRIGGER prevent_self_invitation
BEFORE INSERT ON invitations
FOR EACH ROW
BEGIN
    IF NEW.sender_id = NEW.receiver_id THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'A student cannot send an invitation to themselves.';
    END IF;
END$$
DELIMITER ;

-- TRIGGER 3 OF 3: Automatically marks a project as 'Completed' when all its tasks are 'Done'. (New)
DELIMITER $$
CREATE TRIGGER update_project_on_tasks_completion
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    DECLARE total_tasks INT;
    DECLARE completed_tasks INT;

    IF NEW.task_status = 'Done' THEN
        SELECT COUNT(*) INTO total_tasks FROM tasks WHERE project_id = NEW.project_id;
        SELECT COUNT(*) INTO completed_tasks FROM tasks WHERE project_id = NEW.project_id AND task_status = 'Done';
        
        IF total_tasks > 0 AND total_tasks = completed_tasks THEN
            UPDATE projects SET project_status = 'Completed' WHERE project_id = NEW.project_id;
        END IF;
    END IF;
END$$
DELIMITER ;


-- --- STORED PROCEDURES (3 TOTAL) ---

-- PROCEDURE 1 OF 3: Gets key statistics for a given project. (Existing, Improved)
DELIMITER $$
CREATE PROCEDURE GetProjectStatistics(IN proj_id INT)
BEGIN
    SELECT
        (SELECT COUNT(*) FROM team_member WHERE team_id = (SELECT team_id FROM projects WHERE project_id = proj_id)) AS member_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = proj_id) AS total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE project_id = proj_id AND task_status = 'Done') AS completed_tasks;
END$$
DELIMITER ;

-- PROCEDURE 2 OF 3: Gets a student's full profile, including their skills. (New)
DELIMITER $$
CREATE PROCEDURE GetStudentProfileDetails(IN p_student_id INT)
BEGIN
    SELECT 
        s.student_id, 
        s.student_name, 
        s.student_mail, 
        GROUP_CONCAT(sk.skill_name SEPARATOR ', ') as skills
    FROM students s
    LEFT JOIN student_skill ss ON s.student_id = ss.student_id
    LEFT JOIN skills sk ON ss.skill_id = sk.skill_id
    WHERE s.student_id = p_student_id
    GROUP BY s.student_id;
END$$
DELIMITER ;

-- PROCEDURE 3 OF 3: Gets all members of a specific team, including their role. (New)
DELIMITER $$
CREATE PROCEDURE GetTeamDetails(IN p_team_id INT)
BEGIN
    SELECT s.student_name, r.role_name
    FROM team_member tm
    JOIN students s ON tm.student_id = s.student_id
    JOIN roles r ON tm.role_id = r.role_id
    WHERE tm.team_id = p_team_id;
END$$
DELIMITER ;


-- --- USER-DEFINED FUNCTIONS (3 TOTAL) ---

-- FUNCTION 1 OF 3: Calculates the completion percentage of a project. (Existing)
DELIMITER $$
CREATE FUNCTION CalculateProjectProgress(proj_id INT)
RETURNS DECIMAL(5, 2)
DETERMINISTIC
BEGIN
    DECLARE total_tasks INT;
    DECLARE completed_tasks INT;
    SELECT COUNT(*) INTO total_tasks FROM tasks WHERE project_id = proj_id;
    IF total_tasks = 0 THEN
        RETURN 0.00;
    END IF;
    SELECT COUNT(*) INTO completed_tasks FROM tasks WHERE project_id = proj_id AND task_status = 'Done';
    RETURN (completed_tasks / total_tasks) * 100.00;
END$$
DELIMITER ;

-- FUNCTION 2 OF 3: Calculates the number of days until a project's deadline. (New)
DELIMITER $$
CREATE FUNCTION DaysUntilDeadline(p_deadline DATE)
RETURNS INT
DETERMINISTIC
BEGIN
    RETURN DATEDIFF(p_deadline, CURDATE());
END$$
DELIMITER ;

-- FUNCTION 3 OF 3: Gets the name of the Team Lead for a given team. (New)
DELIMITER $$
CREATE FUNCTION GetTeamLeadName(p_team_id INT)
RETURNS VARCHAR(100)
DETERMINISTIC
BEGIN
    DECLARE lead_name VARCHAR(100);
    SELECT s.student_name INTO lead_name
    FROM team_member tm
    JOIN students s ON tm.student_id = s.student_id
    JOIN roles r ON tm.role_id = r.role_id
    WHERE tm.team_id = p_team_id AND r.role_name = 'Team Lead'
    LIMIT 1;
    RETURN lead_name;
END$$
DELIMITER ;



INSERT INTO roles (role_id, role_name) 
VALUES (1, 'Team Lead') 
ON DUPLICATE KEY UPDATE role_name = 'Team Lead';

USE project_management_db;
ALTER TABLE invitations ADD COLUMN role_id INT NOT NULL AFTER team_id;
ALTER TABLE invitations ADD FOREIGN KEY (role_id) REFERENCES roles(role_id);

-- In your database tool (e.g., MySQL Workbench)

USE project_management_db;
DROP PROCEDURE IF EXISTS GetTeamDetails;

-- Then, create the new version that includes student_id
DELIMITER $$
CREATE PROCEDURE GetTeamDetails(IN p_team_id INT)
BEGIN
    SELECT s.student_id, s.student_name, r.role_name
    FROM team_member tm
    JOIN students s ON tm.student_id = s.student_id
    JOIN roles r ON tm.role_id = r.role_id
    WHERE tm.team_id = p_team_id;
END$$
DELIMITER ;

