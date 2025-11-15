import React from 'react';

// This component is the GUI for your Stored Procedure and Aggregate Queries
const ProjectStats = ({ stats }) => {
    if (!stats) return null;

    return (
        <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">Project Statistics</h2>
                <p className="text-sm">(Data from Stored Procedure)</p>
                <div className="stats stats-vertical lg:stats-horizontal shadow mt-4">
                    <div className="stat">
                        <div className="stat-title">Team Members</div>
                        <div className="stat-value text-primary">{stats.member_count || 0}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Total Tasks</div>
                        <div className="stat-value text-secondary">{stats.total_tasks || 0}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Tasks Completed</div>
                        <div className="stat-value text-accent">{stats.completed_tasks || 0}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectStats;