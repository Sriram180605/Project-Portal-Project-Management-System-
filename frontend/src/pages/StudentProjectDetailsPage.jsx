import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProjectById, getMyRoleForProject, deleteProject, getTeamMembers } from '../services/api';
import TaskList from '../components/student/TaskList';
import Achievements from '../components/shared/Achievements';

const StudentProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isTeamLead, setIsTeamLead] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]); // <-- New state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const projectRes = await getProjectById(projectId);
            setProject(projectRes.data);

            // Fetch role and team members concurrently
            if (projectRes.data.team_id) {
                const [roleRes, membersRes] = await Promise.all([
                    getMyRoleForProject(projectId),
                    getTeamMembers(projectRes.data.team_id)
                ]);

                if (roleRes.data.role === 'Team Lead') {
                    setIsTeamLead(true);
                }
                setTeamMembers(membersRes.data);
            }
        } catch (error) { 
            console.error("Could not fetch project details", error); 
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [projectId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone.')) {
        try {
            await deleteProject(projectId);
            alert('Project deleted successfully.');
            navigate('/student/dashboard');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete project.');
        }
    }
  };

  if (loading) return <div className="flex justify-center"><span className="loading loading-lg loading-spinner"></span></div>;
  if (!project) return <p>Project not found.</p>;

  return (
    <div className="space-y-6">
      <div className="text-sm breadcrumbs">
        <ul>
          <li><Link to="/student/dashboard">Dashboard</Link></li> 
          <li>Project: {project.project_title}</li>
        </ul>
      </div>

      <div className="p-6 bg-base-200 rounded-lg shadow-lg">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold">{project.project_title}</h1>
                <p className="mt-1 text-sm text-gray-500">Deadline: {new Date(project.project_deadline).toLocaleDateString()}</p>
            </div>
            {isTeamLead && (
                <button onClick={handleDelete} className="btn btn-error btn-outline">Delete Project</button>
            )}
        </div>

        {/* MODIFIED: Add Progress Bar */}
        <div className="mt-4">
            <h3 className="text-sm font-bold">Overall Progress ({Math.round(project.progress_percentage || 0)}%)</h3>
            <progress 
                className="progress progress-primary w-full" 
                value={project.progress_percentage || 0} 
                max="100">
            </progress>
        </div>
      </div>
      
      {/* MODIFIED: Add Team Members display */}
      <div className="card bg-base-200">
        <div className="card-body">
            <h2 className="card-title">Team Members</h2>
            <div className="flex flex-wrap gap-2">
                {teamMembers.map((member, index) => (
                    <div key={index} className="badge badge-lg badge-outline">
                        {member.student_name} ({member.role_name})
                    </div>
                ))}
            </div>
        </div>
      </div>

      <TaskList projectId={projectId} isTeamLead={isTeamLead} project={project} />
      
      <div className="mt-6">
        <Achievements projectId={projectId} />
      </div>
    </div>
  );
};

export default StudentProjectDetailsPage;