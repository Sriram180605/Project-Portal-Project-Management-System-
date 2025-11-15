import React from 'react';
import MyProjects from '../../components/student/MyProjects';

const StudentMyProjectsPage = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Your Enrolled Projects</h2>
      <MyProjects />
    </div>
  );
};

export default StudentMyProjectsPage;