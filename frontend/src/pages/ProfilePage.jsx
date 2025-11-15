import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudentProfile, updateStudentProfile, getMentorProfile, updateMentorProfile } from '../services/api';

const ProfilePage = () => {
    const { user, loginUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    
    // Student-specific state for skills as a single text string
    const [skillsText, setSkillsText] = useState('');

    const loadProfileData = useCallback(async () => {
        try {
            if (user.role === 'student') {
                const profileRes = await getStudentProfile();
                setName(profileRes.data.student_name);
                setEmail(profileRes.data.student_mail);
                setSkillsText(profileRes.data.skills || ''); // Set the skills string
            } else { // Mentor
                const profileRes = await getMentorProfile();
                setName(profileRes.data.mentor_name);
                setEmail(profileRes.data.mentor_mail);
            }
        } catch (error) {
            console.error("Failed to load profile data", error);
            setMessage('Error: Could not load profile data.');
        } finally {
            setLoading(false);
        }
    }, [user.role]);

    useEffect(() => {
        loadProfileData();
    }, [loadProfileData]);
    
    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            if (user.role === 'student') {
                await updateStudentProfile({ student_name: name, student_mail: email, skills: skillsText });
            } else {
                await updateMentorProfile({ mentor_name: name, mentor_mail: email });
            }
            loginUser({ ...user, name, email }); // Update name/email in context
            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Error: Failed to update profile.');
        }
    };

    if (loading) return <div className="flex justify-center"><span className="loading loading-lg loading-spinner"></span></div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl">Edit Your Profile ({user.role})</h2>
                    <form onSubmit={handleUpdate} className="space-y-4 mt-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text">Name</span></label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input input-bordered" required />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text">Email</span></label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input input-bordered" required />
                        </div>

                        {user.role === 'student' && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-bold">Manage Your Skills</span>
                                </label>
                                <input 
                                    type="text"
                                    placeholder="e.g., React, Node.js, SQL"
                                    className="input input-bordered"
                                    value={skillsText}
                                    onChange={(e) => setSkillsText(e.target.value)}
                                />
                                <div className="label">
                                    <span className="label-text-alt">Enter skills separated by commas</span>
                                </div>
                            </div>
                        )}

                        {message && <p className={message.startsWith('Error') ? 'text-error' : 'text-success'}>{message}</p>}

                        <div className="card-actions justify-end">
                            <button type="submit" className="btn btn-primary">Update Profile</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;