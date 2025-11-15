import React from 'react';
import { Link } from 'react-router-dom';

const MentorProfilePage = () => {
    return (
        <div className="max-w-md">
            <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
            <p className="mb-4">Update your name and email address.</p>
            <Link to="/profile" className="btn btn-primary">Edit Profile</Link>
        </div>
    );
};

export default MentorProfilePage;