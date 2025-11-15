import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="hero min-h-[80vh] bg-base-100">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome to Project Portal</h1>
          <p className="py-6">
            The central hub for students and mentors to collaborate on projects,
            showcase skills, and achieve goals.
          </p>
          <div className="space-x-4">
            <Link to="/login" state={{ role: 'mentor' }} className="btn btn-primary">
              Mentor Login
            </Link>
            <Link to="/login" state={{ role: 'student' }} className="btn btn-secondary">
              Student Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;