import React, { useState } from 'react';
import CreateProjectForm from '../../components/mentor/CreateProjectForm';
import ProjectList from '../../components/mentor/ProjectList';

const MentorProjectsPage = () => {
    // This state is used to force a refresh of the ProjectList when a new project is created
    const [refreshKey, setRefreshKey] = useState(0);

    const handleProjectCreated = () => {
        setRefreshKey(prev => prev + 1);
        document.getElementById('create_project_modal').close();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">My Projects</h2>
                <button className="btn btn-primary" onClick={() => document.getElementById('create_project_modal').showModal()}>
                    + Add New Project
                </button>
            </div>

            <ProjectList key={refreshKey} />

            {/* Modal for Creating a New Project */}
            <dialog id="create_project_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <CreateProjectForm onProjectCreated={handleProjectCreated} />
                </div>
            </dialog>
        </div>
    );
};

export default MentorProjectsPage;