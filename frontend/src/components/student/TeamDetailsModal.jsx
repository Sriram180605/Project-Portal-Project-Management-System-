import React, { useState, useEffect, useCallback } from 'react';
import { getTeamMembers, getStudents, sendInvitation } from '../../services/api';

const TeamDetailsModal = ({ team, onClose }) => {
    const [members, setMembers] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!team) return;
        try {
            setLoading(true);
            const [membersRes, studentsRes] = await Promise.all([
                getTeamMembers(team.team_id),
                getStudents()
            ]);
            setMembers(membersRes.data);
            setAllStudents(studentsRes.data);
        } catch (error) {
            console.error("Failed to fetch team details", error);
        } finally {
            setLoading(false);
        }
    }, [team]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSendInvite = async (receiverId) => {
        try {
            await sendInvitation({ receiver_id: receiverId, team_id: team.team_id });
            alert('Invitation sent!');
        } catch (error) {
            alert('Failed to send invitation. The user might already be on a team or have a pending invite.');
        }
    };

    const memberIds = members.map(m => m.student_id);
    const availableStudents = allStudents.filter(s => !memberIds.includes(s.student_id));

    return (
        <dialog id="team_details_modal" className="modal">
            <div className="modal-box w-11/12 max-w-3xl">
                <h3 className="font-bold text-2xl">Manage Team: {team?.team_name}</h3>
                
                {loading ? <span className="loading loading-spinner"></span> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {/* Current Members Section */}
                        <div>
                            <h4 className="font-bold text-lg mb-2">Current Members</h4>
                            <div className="space-y-2">
                                {members.map(member => (
                                    <div key={member.student_name} className="p-2 bg-base-300 rounded-md">
                                        <p className="font-semibold">{member.student_name}</p>
                                        <p className="text-xs opacity-70">{member.role_name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Invite Students Section */}
                        <div>
                             <h4 className="font-bold text-lg mb-2">Invite New Members</h4>
                             <div className="overflow-x-auto h-64">
                                <table className="table table-sm">
                                    <tbody>
                                        {availableStudents.map(student => (
                                            <tr key={student.student_id}>
                                                <td>{student.student_name}</td>
                                                <td><button onClick={() => handleSendInvite(student.student_id)} className="btn btn-xs btn-outline">Send Invite</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="modal-action">
                    <form method="dialog">
                        <button className="btn" onClick={onClose}>Close</button>
                    </form>
                </div>
            </div>
        </dialog>
    );
};

export default TeamDetailsModal;