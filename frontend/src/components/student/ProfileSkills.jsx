import React, { useState, useEffect, useCallback } from 'react';
import { getStudentProfile, updateStudentProfile } from '../../services/api.js'; // Corrected Path
import { useAuth } from '../../context/AuthContext.jsx'; // Corrected Path

const ProfileSkills = () => {
    const { user } = useAuth();
    const [skills, setSkills] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [skillsText, setSkillsText] = useState('');
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getStudentProfile();
            setProfile(res.data);
            setSkillsText(res.data.skills || '');
            setSkills((res.data.skills || '').split(',').map(s => s.trim()).filter(s => s));
        } catch (error) {
            console.error("Failed to fetch skills", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSave = async () => {
        try {
            await updateStudentProfile({
                student_name: profile.student_name,
                student_mail: profile.student_mail,
                skills: skillsText
            });
            setIsEditing(false);
            fetchProfile(); 
        } catch (error) {
            console.error("Failed to update skills", error);
            alert("Failed to update skills.");
        }
    };

    const handleCancel = () => {
        setSkillsText(profile.skills || ''); 
        setIsEditing(false);
    };

    if (loading) {
        return <div className="skeleton h-28 w-full"></div>;
    }

    return (
        <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
                <div className="flex justify-between items-center">
                    <h2 className="card-title">My Skills</h2>
                    {!isEditing && (
                        <button onClick={() => setIsEditing(true)} className="btn btn-ghost btn-sm">
                            Edit
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <p className="text-sm opacity-70">Enter your skills separated by commas.</p>
                        <input
                            type="text"
                            placeholder="e.g., React, Node.js, SQL"
                            className="input input-bordered w-full"
                            value={skillsText}
                            onChange={(e) => setSkillsText(e.target.value)}
                        />
                        <div className="card-actions justify-end">
                            <button onClick={handleCancel} className="btn btn-ghost">Cancel</button>
                            <button onClick={handleSave} className="btn btn-primary">Save</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm opacity-70">Manage your skills to be discovered by mentors.</p>
                        <div className="card-actions mt-4 flex-wrap gap-2">
                            {skills.length > 0 ? (
                                skills.map((skill, index) => (
                                    <div key={index} className="badge badge-secondary badge-outline">{skill}</div>
                                ))
                            ) : (
                                <p className="text-sm">No skills added yet. Click 'Edit' to add some!</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSkills;