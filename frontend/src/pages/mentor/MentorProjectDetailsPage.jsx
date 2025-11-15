import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById, getTeamMembers, getProjectStats, getProjectAuditLog } from '../../services/api';
import TeamBuilder from '../../components/mentor/TeamBuilder';
import TaskList from '../../components/student/TaskList';
import Achievements from '../../components/shared/Achievements';
import ProjectStats from '../../components/mentor/ProjectStats';
import AuditLog from '../../components/mentor/AuditLog';

const MentorProjectDetailsPage = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [stats, setStats] = useState(null);
    const [auditLog, setAuditLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchProjectData = useCallback(async () => {
        try {
            setLoading(true);
            const projectRes = await getProjectById(projectId);
            setProject(projectRes.data);

            if (projectRes.data) {
                const [statsRes, auditRes] = await Promise.all([
                    getProjectStats(projectId),
                    getProjectAuditLog(projectId)
                ]);
                setStats(statsRes.data);
                setAuditLog(auditRes.data);

                if (projectRes.data.team_id) {
                    const membersRes = await getTeamMembers(projectRes.data.team_id);
                    setTeamMembers(membersRes.data);
                }
            }
        } catch (err) {
            setError('Failed to load project details.');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchProjectData();
    }, [fetchProjectData]);

    if (loading) return <div className="text-center p-8"><span className="loading loading-spinner"></span></div>;
    if (error) return <div className="alert alert-error">{error}</div>;
    if (!project) return null;

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <Link to="/mentor/dashboard/projects" className="btn btn-sm btn-outline">&larr; Back to Projects</Link>
            </div>
            <div className="p-6 card bg-base-200 shadow-lg">
                <h1 className="text-3xl font-bold">{project.project_title}</h1>
                <p className="mt-2 opacity-80">{project.project_description}</p>
            </div>

            <div className="card bg-base-200 shadow-lg">
                <div className="card-body">
                    <h2 className="card-title text-2xl">Team Management</h2>
                    {project.team_id ? (
                        <div>
                            <h3 className="font-bold text-lg mb-2">Assigned Team Members</h3>
                            {/* Team Members Table */}
                        </div>
                    ) : (
                        <TeamBuilder project={project} onTeamCreated={fetchProjectData} />
                    )}
                </div>
            </div>
            
            {/* MODIFIED: TaskList is now rendered unconditionally */}
            <TaskList projectId={projectId} project={project} />

            <div className="mt-6"><Achievements projectId={projectId} /></div>
            <div className="mt-6"><ProjectStats stats={stats} /></div>
            <div className="mt-6"><AuditLog logs={auditLog} /></div>
        </div>
    );
};

export default MentorProjectDetailsPage;