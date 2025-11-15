// frontend/src/App.jsx

import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MentorDashboard from './pages/MentorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProfilePage from './pages/ProfilePage';
import StudentProjectDetailsPage from './pages/StudentProjectDetailsPage';
import StudentMyProjectsPage from './pages/student/StudentMyProjectsPage';
import StudentTeamsPage from './pages/student/StudentTeamsPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import MentorProjectsPage from './pages/mentor/MentorProjectsPage';
import MentorProjectDetailsPage from './pages/mentor/MentorProjectDetailsPage';
import MentorStudentsPage from './pages/mentor/MentorStudentsPage';
import MentorProfilePage from './pages/mentor/MentorProfilePage';

function App() {
  return (
    <div className="min-h-screen bg-base-100" data-theme="dark">
      <Navbar />
      <main className="container mx-auto p-4 md:p-6">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={
            <div className="text-center py-20">
              <h1 className="text-4xl font-bold text-error">Unauthorized Access</h1>
              <p className="mt-4">You do not have permission to view this page.</p>
            </div>
          }/>

          {/* --- MENTOR PROTECTED ROUTES --- */}
          {/* This Route wraps all mentor routes and protects them */}
          <Route element={<ProtectedRoute allowedRoles={['mentor']} />}>
            <Route path="/mentor/dashboard" element={<MentorDashboard />}>
              <Route index element={<Navigate to="projects" replace />} />
              <Route path="projects" element={<MentorProjectsPage />} />
              <Route path="projects/:projectId" element={<MentorProjectDetailsPage />} />
              <Route path="students" element={<MentorStudentsPage />} />
              <Route path="profile" element={<MentorProfilePage />} />
            </Route>
          </Route>
          
          {/* --- STUDENT PROTECTED ROUTES --- */}
          {/* This Route wraps all student routes and protects them */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />}>
              <Route index element={<Navigate to="projects" replace />} />
              <Route path="projects" element={<StudentMyProjectsPage />} />
              <Route path="teams" element={<StudentTeamsPage />} />
              <Route path="profile" element={<StudentProfilePage />} />
            </Route>
            <Route path="/student/project/:projectId" element={<StudentProjectDetailsPage />} />
          </Route>
          
          {/* --- GENERAL PROTECTED ROUTES (if any) --- */}
          <Route element={<ProtectedRoute />}>
             <Route path="/profile" element={<ProfilePage />} />
          </Route>
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;