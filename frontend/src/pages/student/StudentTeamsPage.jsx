import React, { useState, useEffect, useCallback } from 'react';
import { 
    getStudents, 
    createTeam, 
    sendInvitation, 
    getMyTeams, 
    getTeamMembers, 
    getRoles, 
    respondToInvitation, 
    deleteTeam,
    getMyInvitations
} from '../../services/api';
import CreateProjectForm from '../../components/mentor/CreateProjectForm';

const StudentTeamsPage = () => {
    const [allStudents, setAllStudents] = useState([]);
    const [myTeams, setMyTeams] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [teamName, setTeamName] = useState('');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [studentsRes, rolesRes, myTeamsRes, invitationsRes] = await Promise.all([
                getStudents(),
                getRoles(),
                getMyTeams(),
                getMyInvitations()
            ]);
            setAllStudents(studentsRes.data);
            setAvailableRoles(rolesRes.data.filter(r => r.role_name !== 'Team Lead'));
            setMyTeams(myTeamsRes.data);
            setInvitations(invitationsRes.data);
        } catch (error) {
            console.error("Failed to fetch page data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            await createTeam({ team_name: teamName });
            setTeamName('');
            fetchData();
            alert(`Team "${teamName}" created!`);
        } catch (error) { alert(error.response?.data?.message || 'Failed to create team.'); }
    };
    
    const handleSelectTeam = async (team) => {
        setSelectedTeam(team);
        try {
            const res = await getTeamMembers(team.team_id);
            setTeamMembers(res.data);
        } catch (error) { console.error("Failed to fetch team members", error); }
    };

    const handleInvitationResponse = async (invitationId, status) => {
        try {
            await respondToInvitation(invitationId, status);
            fetchData();
        } catch (error) { alert(`Failed to ${status} invitation.`); }
    };

    const handleRoleSelection = (studentId, roleId) => {
        setSelectedRoles(prev => ({ ...prev, [studentId]: parseInt(roleId) }));
    };

    const handleSendInvite = async (receiverId) => {
        const role_id = selectedRoles[receiverId];
        if (!role_id) {
            alert('Please select a role for the student before sending an invite.');
            return;
        }
        try {
            await sendInvitation({ receiver_id: receiverId, team_id: selectedTeam.team_id, role_id });
            alert('Invitation sent!');
        } catch (error) { alert(error.response?.data?.message || 'Failed to send invitation.'); }
    };

    const handleDeleteTeam = async (team) => {
        if (window.confirm(`Are you sure you want to permanently delete the team "${team.team_name}"?`)) {
            try {
                await deleteTeam(team.team_id);
                setSelectedTeam(null);
                fetchData();
                alert('Team deleted successfully.');
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete team.');
            }
        }
    };

    const handleProjectCreated = () => {
        fetchData();
        document.getElementById('create_project_modal').close();
    };
    
    // Bug Fix: Filter invite list by student_id
    const memberIds = teamMembers.map(m => m.student_id);
    const availableStudentsForInvite = allStudents.filter(s => !memberIds.includes(s.student_id));
    
    // Bug Fix: Determine if the selected team is mentor-led
    const isMentorProjectTeam = selectedTeam && selectedTeam.mentor_id;

    if (loading) return <div className="flex justify-center mt-10"><span className="loading loading-spinner loading-lg"></span></div>;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    {/* Left column for creating team, my teams, and invitations remains the same */}
                    <div className="card bg-base-200 shadow-xl"><form className="card-body" onSubmit={handleCreateTeam}><h2 className="card-title">Create a New Team</h2><div className="form-control"><input type="text" placeholder="New Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="input input-bordered" required /></div><div className="card-actions justify-end"><button type="submit" className="btn btn-primary">Create Team</button></div></form></div>
                    <div className="card bg-base-200 shadow-xl"><div className="card-body"><h2 className="card-title">My Teams</h2><div className="join join-vertical w-full">{myTeams.map(team => (<button key={team.team_id} onClick={() => handleSelectTeam(team)} className={`btn join-item ${selectedTeam?.team_id === team.team_id ? 'btn-active' : ''}`}>{team.team_name}</button>))
                    } {myTeams.length === 0 && <p className="text-sm opacity-70">You are not part of any teams yet.</p>}</div></div></div>
                    <div className="card bg-base-200 shadow-xl"><div className="card-body"><h2 className="card-title">Incoming Invitations</h2><div className="space-y-3 mt-2">{invitations.length > 0 ? invitations.map(inv => (<div key={inv.invitation_id} className="p-3 bg-base-100 rounded-lg"><p className="text-sm"><span className="font-bold">{inv.sender_name}</span> invited you to join <span className="font-bold">{inv.team_name}</span> as a <span className="font-bold">{inv.role_name}</span>.</p><div className="flex gap-2 mt-2"><button onClick={() => handleInvitationResponse(inv.invitation_id, 'accepted')} className="btn btn-xs btn-success">Accept</button><button onClick={() => handleInvitationResponse(inv.invitation_id, 'declined')} className="btn btn-xs btn-error">Decline</button></div></div>)) : (<p className="text-sm opacity-70">You have no pending invitations.</p>)}</div></div></div>
                </div>

                <div className="md:col-span-2">
                    {selectedTeam ? (
                        <div className="card bg-base-200 shadow-xl">
                            <div className="card-body">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="card-title">Manage Team: {selectedTeam.team_name}</h2>
                                        {selectedTeam.project_id && ( <div className="badge badge-success mt-1">Project Assigned</div> )}
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Bug Fix: Conditionally show buttons */}
                                        {selectedTeam.role_name === 'Team Lead' && !selectedTeam.project_id && !isMentorProjectTeam && (
                                            <button className="btn btn-accent btn-sm" onClick={()=>document.getElementById('create_project_modal').showModal()}>Create Project</button>
                                        )}
                                        {selectedTeam.role_name === 'Team Lead' && !isMentorProjectTeam && (
                                            <button onClick={() => handleDeleteTeam(selectedTeam)} className="btn btn-error btn-outline btn-sm">Delete Team</button>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-4 mt-4">
                                    <h3 className="font-bold mb-2">Current Members:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {teamMembers.map(member => (
                                            <div key={member.student_id} className="badge badge-lg badge-outline">{member.student_name} ({member.role_name})</div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Bug Fix: Conditionally hide the invite interface */}
                                {selectedTeam.role_name === 'Team Lead' && !isMentorProjectTeam ? (
                                    <>
                                        <div className="divider"></div>
                                        <h3 className="font-bold mb-2">Invite Students:</h3>
                                        <div className="overflow-x-auto h-96">
                                            <table className="table">
                                                <thead><tr><th>Name / Skills</th><th>Assign Role & Invite</th></tr></thead>
                                                <tbody>
                                                    {availableStudentsForInvite.map(student => (
                                                        <tr key={student.student_id}>
                                                            <td><div>{student.student_name}</div><div className="text-xs opacity-50">{student.skills || 'N/A'}</div></td>
                                                            <td className="flex gap-2 items-center">
                                                                <select className="select select-bordered select-xs" onChange={(e) => handleRoleSelection(student.student_id, e.target.value)} defaultValue="">
                                                                    <option disabled value="">Select Role</option>
                                                                    {availableRoles.map(role => (<option key={role.role_id} value={role.role_id}>{role.role_name}</option>))}
                                                                </select>
                                                                <button onClick={() => handleSendInvite(student.student_id)} className="btn btn-xs btn-outline">Send</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    isMentorProjectTeam && <p className="text-sm opacity-70 mt-4">This team was created by a mentor. Only the mentor can invite new members.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-base-200 rounded-lg min-h-96">
                            <p className="text-lg">Select a team from the left to view members and send invitations.</p>
                        </div>
                    )}
                </div>
            </div>
            
            <dialog id="create_project_modal" className="modal">
                <div className="modal-box">
                    <form method="dialog"><button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button></form>
                    <CreateProjectForm teamId={selectedTeam?.team_id} onProjectCreated={handleProjectCreated} />
                </div>
            </dialog>
        </>
    );
};

export default StudentTeamsPage;