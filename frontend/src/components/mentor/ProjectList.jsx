import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMentorProjects, deleteProject } from '../../services/api';

// MODIFIED: Removed 'key' from the props
const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getMentorProjects();
      setProjects(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  // MODIFIED: Removed 'key' from the dependency array.
  // The useEffect will now run once when the component mounts.
  // The parent component will force a re-render by changing the key, which works correctly.
  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
        try {
            await deleteProject(projectId);
            fetchProjects();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete project.');
        }
    }
  };

  if (loading) return <div className="skeleton h-32 w-full"></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="card bg-base-200 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">My Projects</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Title / Team Lead</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length > 0 ? projects.map((project) => (
                <tr key={project.project_id} className="hover">
                  <td>
                    <Link to={`/mentor/dashboard/projects/${project.project_id}`} className="font-bold link link-hover">
                        {project.project_title}
                    </Link>
                    <div className="text-sm opacity-50">{project.team_lead || 'No Team Assigned'}</div>
                  </td>
                  <td>
                    <span className={`badge ${project.project_status === 'Completed' ? 'badge-success' : 'badge-ghost'}`}>
                        {project.project_status}
                    </span>
                  </td>
                  <td>
                    <progress 
                        className="progress progress-primary w-24" 
                        value={project.progress_percentage || 0} 
                        max="100">
                    </progress>
                    <span className="ml-2 text-sm font-bold">{Math.round(project.progress_percentage || 0)}%</span>
                  </td>
                  <td>
                    <div className={`badge ${project.days_left < 0 ? 'badge-error' : 'badge-outline'}`}>
                        {project.days_left < 0 ? `${Math.abs(project.days_left)} days overdue` : `${project.days_left} days left`}
                    </div>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(project.project_id)} className="btn btn-xs btn-outline btn-error">Delete</button>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan="5" className="text-center">You have not created any projects yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;