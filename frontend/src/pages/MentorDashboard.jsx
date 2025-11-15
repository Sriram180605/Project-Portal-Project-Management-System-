import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MentorDashboard = () => {
  const { user } = useAuth();
  
  const menuLinkClass = ({ isActive }) => 
    `tab ${isActive ? 'tab-active' : ''}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-lg opacity-70">This is your mentor dashboard.</p>
      </div>

      <div className="tabs tabs-boxed">
        <NavLink to="/mentor/dashboard/projects" className={menuLinkClass}>
          Projects
        </NavLink>
        <NavLink to="/mentor/dashboard/students" className={menuLinkClass}>
          Students & Teams
        </NavLink>
        <NavLink to="/mentor/dashboard/profile" className={menuLinkClass}>
          My Profile
        </NavLink>
      </div>

      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default MentorDashboard;