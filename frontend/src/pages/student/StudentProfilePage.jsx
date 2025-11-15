import React from 'react';
import ProfileSkills from '../../components/student/ProfileSkills';
import { Link } from 'react-router-dom';

const StudentProfilePage = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Profile & Skills</h2>
        <Link to="/profile" className="btn btn-outline btn-sm">Edit Name/Email</Link>
      </div>
      <ProfileSkills />
    </div>
  );
};

export default StudentProfilePage;