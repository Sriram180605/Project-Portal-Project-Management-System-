// frontend/src/pages/mentor/MentorStudentsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { getStudents, getTeams, getMentorProjects, deleteTeam } from '../../services/api'; // <-- Import deleteTeam
import TeamBuilder from '../../components/mentor/TeamBuilder';

const MentorStudentsPage = () => {
    const [view, setView] = useState('students');
    const [students, setStudents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [studentsRes, teamsRes, projectsRes] = await Promise.all([
                getStudents(),
                getTeams(),
                getMentorProjects()
            ]);
            setStudents(studentsRes.data);
            setTeams(teamsRes.data);
            setProjects(projectsRes.data);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleProjectSelect = (projectId) => {
        if (projectId) {
            const project = projects.find(p => p.project_id === parseInt(projectId));
            setSelectedProject(project);
        } else {
            setSelectedProject(null);
        }
    };

    const handleTeamCreated = () => {
        setSelectedProject(null);
        fetchData();
    };
    
    // NEW: Function to handle deleting a team
    const handleDeleteTeam = async (teamId, teamName) => {
        if (window.confirm(`Are you sure you want to permanently delete the team "${teamName}"? This will also unassign it from any project.`)) {
            try {
                await deleteTeam(teamId);
                fetchData(); // Refresh the list of teams
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete team.');
            }
        }
    };

    const unassignedProjects = projects.filter(p => !p.team_id);
    const filteredStudents = students.filter(s =>
        s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.skills && s.skills.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div className="card bg-base-200 shadow-xl mb-6">
                <div className="card-body">
                    <h2 className="card-title">Team Formation</h2>
                    <p>Select a project below to start enrolling students and building a team.</p>
                    <select 
                        className="select select-bordered w-full max-w-xs mt-2"
                        onChange={(e) => handleProjectSelect(e.target.value)}
                        value={selectedProject ? selectedProject.project_id : ""}
                    >
                        <option value="">-- Select a Project to Manage --</option>
                        {unassignedProjects.map(p => (
                            <option key={p.project_id} value={p.project_id}>{p.project_title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedProject ? (
                <TeamBuilder project={selectedProject} onTeamCreated={handleTeamCreated} />
            ) : (
                <div>
                    <div role="tablist" className="tabs tabs-boxed">
                        <a role="tab" className={`tab ${view === 'students' ? 'tab-active' : ''}`} onClick={() => setView('students')}>
                            Student Roster
                        </a>
                        <a role="tab" className={`tab ${view === 'teams' ? 'tab-active' : ''}`} onClick={() => setView('teams')}>
                            Existing Teams
                        </a>
                    </div>

                    <div className="mt-6">
                        {loading ? <div className="text-center"><span className="loading loading-spinner"></span></div> : (
                            view === 'students' ? (
                                <div className="card bg-base-200 shadow-xl">
                                    <div className="card-body">
                                        <h2 className="card-title">All Students</h2>
                                        <input
                                            type="text"
                                            placeholder="Search by name or skill..."
                                            className="input input-bordered w-full max-w-sm"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <div className="overflow-x-auto mt-4">
                                            <table className="table">
                                                <thead><tr><th>Name</th><th>Email</th><th>Skills</th></tr></thead>
                                                <tbody>
                                                    {filteredStudents.map(student => (
                                                        <tr key={student.student_id} className="hover">
                                                            <td>{student.student_name}</td>
                                                            <td>{student.student_mail}</td>
                                                            <td>{student.skills || 'N/A'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {teams.map(team => (
                                        <div key={team.team_id} className="card bg-base-200 shadow-xl">
                                            <div className="card-body">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h2 className="card-title">{team.team_name}</h2>
                                                        <p className="text-sm font-semibold">
                                                            {team.project_title ? `Assigned to: ${team.project_title}` : <span className="text-warning">Unassigned</span>}
                                                        </p>
                                                    </div>
                                                    {/* NEW: Delete button dropdown */}
                                                    <div className="dropdown dropdown-end">
                                                        <button tabIndex={0} role="button" className="btn btn-sm btn-ghost btn-circle">•••</button>
                                                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-32">
                                                            <li><a onClick={() => handleDeleteTeam(team.team_id, team.team_name)}>Delete Team</a></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <h3 className="text-xs uppercase font-bold">Members:</h3>
                                                    <p className="text-sm opacity-80">{team.members || 'No members yet'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorStudentsPage;