
ProjectPortal 🚀
ProjectPortal is a full-stack web application designed to streamline project management and collaboration between mentors and students. This application provides role-based dashboards, team-building tools, task tracking, and a complete feedback system, all powered by a robust MySQL database.

✨ Features
🧑‍🏫 Mentor Role
Project Management: Create, Read, and Delete only their own projects.
Dashboard: View a list of their projects with live progress bars, status, and deadline-tracking.
Team Building: A centralized "Students & Teams" hub.
View a roster of all students and filter them by skill.
View all existing teams and their members.
Enroll students and build new teams for unassigned projects.
Delete any team.
Task Management: Add, delete, and manage tasks (including dependencies) for their projects.
Feedback: View student submissions in a modal and provide written feedback.
Oversight: View project achievements, statistics (task counts, member counts), and an audit log for deadline changes.
🧑‍🎓 Student Role
Team Management: Create new teams (becoming "Team Lead") or join existing ones.
Invitation System: Send, view, accept, and decline team invitations (with role assignment).
Project Dashboard: View all assigned projects (both student- and mentor-led) with progress bars and deadline badges.
Task Management:
View all project tasks and their dependencies.
Update task status (To-Do, In Progress, Done).
Submit work via URL in a modal that also shows submission/feedback history.
Feedback: View mentor feedback on their submissions.
Project Control (as Team Lead): Add/delete tasks, create/delete projects, and manage teams (for student-created projects only).
Profile: Manage their personal info and a list of their skills.
🛠️ Tech Stack
Frontend: React, React Router, Axios, Tailwind CSS, DaisyUI
Backend: Node.js, Express.js
Database: MySQL
Authentication: JWT (JSON Web Tokens) & bcrypt.js
🐬 Database Features
This project is built on a robust relational schema (in 3NF) with 16 tables. It fully utilizes advanced database features, all of which are integrated with the UI to fulfill the course rubrics.
3 Triggers:
update_project_on_tasks_completion: Automatically marks projects "Completed."
after_project_deadline_update: Logs changes to an audit table (visible on the mentor's project details page).
prevent_self_invitation: Prevents users from inviting themselves to a team (triggers a UI error alert).
3 Stored Procedures:
GetProjectStatistics: Fetches task/member counts for the mentor stats card.
GetStudentProfileDetails: Fetches student info and aggregates their skills for the profile page.
GetTeamDetails: Fetches all members and roles for a team.
3 User-Defined Functions (UDFs):
CalculateProjectProgress: Powers the progress bars on both dashboards.
DaysUntilDeadline: Powers the deadline badges on both dashboards.
GetTeamLeadName: Displays the Team Lead on the mentor's project list.
Advanced Queries: The backend uses complex JOINs, Nested Queries, and Aggregate Functions (like GROUP_CONCAT and COUNT) to populate the UI.
🚀 Getting Started
Prerequisites
Node.js (v18.x or later)
MySQL Server (e.g., via MySQL Workbench or XAMPP)
1. Backend Setup
Clone the repo: git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
Navigate to the backend folder: cd backend
Install dependencies: npm install
Create a .env file in the backend folder and add your database credentials:
PORT=5000 
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=project_management_db
JWT_SECRET=a_very_long_and_secret_key_for_jwt


Important: Create the database project_management_db in your MySQL server.
Run the Schema: Execute the entire schema.sql (or the consolidated script from your report) file in MySQL Workbench to create all tables, triggers, procedures, and functions.
Start the backend server: node server.js


2. Frontend Setup
Open a new terminal and navigate to the frontend folder: cd frontend
Install dependencies:
npm install
Start the frontend app (this connects to the backend proxy automatically): npm run dev
Open http://localhost:5173 in your browser.


