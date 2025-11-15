import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAchievementsForProject, createAchievement, deleteAchievement } from '../../services/api';

const Achievements = ({ projectId }) => {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');

    const fetchAchievements = async () => {
        const res = await getAchievementsForProject(projectId);
        setAchievements(res.data);
    };

    useEffect(() => {
        fetchAchievements();
    }, [projectId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createAchievement({
            project_id: projectId,
            achievement_name: name,
            achievement_description: description,
            date_achieved: date
        });
        setName('');
        setDescription('');
        setDate('');
        fetchAchievements();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this achievement?')) {
            await deleteAchievement(id);
            fetchAchievements();
        }
    };

    return (
        <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">Project Achievements</h2>
                {/* Form to add new achievement */}
                <form onSubmit={handleSubmit} className="my-4 p-4 bg-base-300 rounded-lg space-y-2">
                    <h3 className="font-bold">Log a New Achievement</h3>
                    <input type="text" placeholder="Achievement Name" value={name} onChange={e => setName(e.target.value)} className="input input-bordered w-full" required />
                    <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="textarea textarea-bordered w-full"></textarea>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input input-bordered w-full" required />
                    <button type="submit" className="btn btn-primary btn-sm">Add Achievement</button>
                </form>
                
                {/* List of existing achievements */}
                <div className="space-y-3">
                    {achievements.map(ach => (
                        <div key={ach.achievement_id} className="p-3 bg-base-100 rounded-md flex justify-between items-start">
                            <div>
                                <p className="font-bold">{ach.achievement_name} - <span className="text-sm font-normal opacity-70">{new Date(ach.date_achieved).toLocaleDateString()}</span></p>
                                <p className="text-sm">{ach.achievement_description}</p>
                            </div>
                            <button onClick={() => handleDelete(ach.achievement_id)} className="btn btn-xs btn-error btn-outline">Delete</button>
                        </div>
                    ))}
                    {achievements.length === 0 && <p>No achievements logged yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default Achievements;