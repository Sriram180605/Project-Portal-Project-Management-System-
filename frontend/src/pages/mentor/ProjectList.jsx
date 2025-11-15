import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMentorProjects } from '../../services/api';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await getMentorProjects();
                setProjects(response.data);
            } catch (error) {
                console.error("Failed to fetch mentor's projects", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    if (loading) return <div className="text-center p-4"><span className="loading loading-spinner"></span></div>;

    return (
        <div className="card bg-base-200">
            <div className="card-body">
                <h2 className="card-title">My Projects</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {projects.length > 0 ? (
                        projects.map(project => (
                            <div key={project.project_id} className="p-4 bg-base-100 rounded-lg shadow-md">
                                <h3 className="font-bold text-lg">{project.project_title}</h3>
                                <p className="text-sm opacity-70">Status: {project.project_status}</p>
                                <p className="text-sm opacity-70">Deadline: {new Date(project.project_deadline).toLocaleDateString()}</p>
                                <div className="card-actions justify-end mt-2">
                                    <Link to={`/mentor/dashboard/projects/${project.project_id}`} className="btn btn-sm btn-outline btn-primary">
                                        View & Manage Team
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>You have not created any projects yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectList;