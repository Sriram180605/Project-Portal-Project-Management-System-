import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyProjects } from '../../services/api';

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getMyProjects();
        setProjects(res.data);
      } catch (error) {
        setError("Failed to fetch your projects.");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="skeleton h-40 w-full"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">My Projects</h2>
        {projects.length > 0 ? (
          <div className="space-y-4 mt-4">
            {projects.map(project => (
              <div key={project.project_id} className="p-4 bg-base-100 rounded-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg">{project.project_title}</h3>
                            {project.mentor_name && <div className="badge badge-neutral">Mentor: {project.mentor_name}</div>}
                        </div>
                        <p className="text-sm opacity-70 max-w-lg mt-1">{project.project_description}</p>
                    </div>
                    <Link to={`/student/project/${project.project_id}`} className="btn btn-secondary btn-sm flex-shrink-0">
                        View Tasks
                    </Link>
                </div>
                {/* MODIFIED: Added progress and deadline info */}
                <div className="flex items-center gap-4 mt-3">
                    <div className="w-full">
                        <progress 
                            className="progress progress-primary" 
                            value={project.progress_percentage || 0} 
                            max="100">
                        </progress>
                    </div>
                    <div className={`badge ${project.days_left < 0 ? 'badge-error' : 'badge-outline'}`}>
                        {project.days_left < 0 ? `${Math.abs(project.days_left)}d overdue` : `${project.days_left}d left`}
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm opacity-70 mt-4">You are not enrolled in any projects yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyProjects;