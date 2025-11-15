-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS project_management_db;

-- Use the newly created database
USE project_management_db;

-- Table for students
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    student_mail VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for mentors
CREATE TABLE mentors (
    mentor_id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_name VARCHAR(100) NOT NULL,
    mentor_mail VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for projects
CREATE TABLE projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    project_title VARCHAR(255) NOT NULL,
    project_description TEXT,
    project_deadline DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for teams
CREATE TABLE teams (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT UNIQUE,
    team_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE SET NULL
);

-- Lookup table for skills
CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(50) NOT NULL UNIQUE
);

-- Lookup table for roles
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- Table for tasks within a project
CREATE TABLE tasks (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    task_status ENUM('To-Do', 'In Progress', 'Done') NOT NULL DEFAULT 'To-Do',
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Table for submissions for each task
CREATE TABLE submissions (
    submission_no INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    student_id INT NOT NULL,
    submission_link VARCHAR(2048) NOT NULL,
    submission_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Table for mentor feedback on submissions
CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    submission_no INT NOT NULL,
    mentor_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_no) REFERENCES submissions(submission_no) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE
);

-- Table for project achievements
CREATE TABLE achievements (
    achievement_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    achievement_description TEXT,
    date_achieved DATE NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Table for team invitations
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

-- Junction table for student skills (Many-to-Many)
CREATE TABLE student_skill (
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (student_id, skill_id),
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE
);

-- Junction table for team members (Many-to-Many)
CREATE TABLE team_member (
    team_id INT NOT NULL,
    student_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (team_id, student_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
);

-- Junction table for task dependencies (Many-to-Many, recursive)
CREATE TABLE task_dependency (
    task_id INT NOT NULL,
    dependent_task_id INT NOT NULL,
    PRIMARY KEY (task_id, dependent_task_id),
    FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE,
    FOREIGN KEY (dependent_task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
);

-- Junction table for mentor-student project enrollment (Ternary Relationship)
CREATE TABLE project_enrollment (
    project_id INT NOT NULL,
    student_id INT NOT NULL,
    mentor_id INT NOT NULL,
    PRIMARY KEY (project_id, student_id),
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE
);