import React, { useState } from 'react';
import { createProject } from '../../services/api';

const CreateProjectForm = ({ onProjectCreated, teamId = null }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = { 
                project_title: title, 
                project_description: description, 
                project_deadline: deadline,
                team_id: teamId 
            };
            await createProject(payload);
            
            setTitle('');
            setDescription('');
            setDeadline('');
            
            if (onProjectCreated) {
                onProjectCreated();
            }

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create project.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">Create New Project</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text">Project Title</span></label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input input-bordered" required />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Description</span></label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="textarea textarea-bordered" />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text">Deadline</span></label>
                        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input input-bordered" required />
                    </div>
                    {error && <p className="text-error text-sm">{error}</p>}
                    <div className="card-actions justify-end">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <span className="loading loading-spinner"></span> : 'Add Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectForm;