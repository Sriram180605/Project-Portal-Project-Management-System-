import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  
  const menuLinkClass = ({ isActive }) => 
    isActive ? 'tab tab-active' : 'tab';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-lg opacity-70">This is your personal dashboard.</p>
      </div>

      {/* Tabbed Menu Navigation */}
      <div className="tabs tabs-boxed">
        <NavLink to="/student/dashboard/projects" className={menuLinkClass}>
          My Projects
        </NavLink>
        <NavLink to="/student/dashboard/teams" className={menuLinkClass}>
          My Teams & Invitations
        </NavLink>
        <NavLink to="/student/dashboard/profile" className={menuLinkClass}>
          My Profile & Skills
        </NavLink>
      </div>

      {/* This is where the selected page will be rendered */}
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentDashboard;