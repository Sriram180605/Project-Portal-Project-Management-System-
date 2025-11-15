import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById, getProjectStats, getProjectAuditLog } from '../services/api';
import ProjectStats from '../components/mentor/ProjectStats';
import AuditLog from '../components/mentor/AuditLog';
import TeamBuilder from '../components/mentor/TeamBuilder'; // <-- Import the new component

const ProjectDetailsPage = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [stats, setStats] = useState(null);
    const [auditLog, setAuditLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [projectRes, statsRes, auditRes] = await Promise.all([
                getProjectById(projectId),
                getProjectStats(projectId),
                getProjectAuditLog(projectId)
            ]);
            
            setProject(projectRes.data);
            setStats(statsRes.data);
            setAuditLog(auditRes.data);
            setError('');
        } catch (err) {
            setError('Failed to fetch project details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="flex justify-center items-center h-64"><span className="loading loading-lg loading-spinner"></span></div>;
    if (error) return <div className="alert alert-error">{error}</div>;
    if (!project) return <p>Project not found.</p>;

    return (
        <div className="space-y-6">
            <div className="text-sm breadcrumbs">
                <ul>
                    <li><Link to="/mentor/dashboard">Dashboard</Link></li> 
                    <li>Project Details</li>
                </ul>
            </div>
            <div className="p-6 bg-base-200 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold">{project.project_title}</h1>
                <p className="mt-2 text-lg">{project.project_description}</p>
                <p className="mt-1 text-sm text-gray-500">Deadline: {new Date(project.project_deadline).toLocaleDateString()}</p>
            </div>
            
            {/* Conditionally render the Team Builder or the project stats */}
            {project.team_id ? (
                <>
                    <ProjectStats stats={stats} />
                    <AuditLog logs={auditLog} />
                    {/* Once a team is assigned, you would show the Task Manager and Team Details here */}
                </>
            ) : (
                <TeamBuilder project={project} onTeamCreated={fetchData} />
            )}
        </div>
    );
};

export default ProjectDetailsPage;