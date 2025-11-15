import React, { useState, useEffect } from 'react';
import { getStudents, getEnrolledStudents, enrollStudent, getRoles, createTeamForProject } from '../../services/api';

const TeamBuilder = ({ project, onTeamCreated }) => {
    const [allStudents, setAllStudents] = useState([]);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [teamName, setTeamName] = useState(`${project.project_title} Team`);
    const [memberRoles, setMemberRoles] = useState({}); // { studentId: roleId }
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            const [studentsRes, enrolledRes, rolesRes] = await Promise.all([
                getStudents(),
                getEnrolledStudents(project.project_id),
                getRoles()
            ]);
            setAllStudents(studentsRes.data);
            setEnrolledStudents(enrolledRes.data);
            setAvailableRoles(rolesRes.data);
        } catch (error) {
            console.error("Failed to fetch data for team builder", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [project.project_id]);

    const handleEnroll = async (studentId) => {
        try {
            await enrollStudent(project.project_id, studentId);
            fetchData(); // Refresh lists
        } catch (error) {
            alert("Failed to enroll student.");
        }
    };
    
    const handleRoleChange = (studentId, roleId) => {
        setMemberRoles(prev => ({...prev, [studentId]: parseInt(roleId)}));
    };

    const handleCreateTeam = async () => {
        const members = enrolledStudents.map(student => ({
            student_id: student.student_id,
            role_id: memberRoles[student.student_id]
        })).filter(member => member.role_id);

        if (members.length !== enrolledStudents.length) {
            alert("Please assign a role to every enrolled student.");
            return;
        }

        try {
            await createTeamForProject({ project_id: project.project_id, team_name: teamName, members });
            alert("Team created and assigned successfully!");
            onTeamCreated();
        } catch (error) {
            alert("Failed to create team.");
        }
    };
    
    const enrolledIds = enrolledStudents.map(s => s.student_id);
    const filteredStudents = allStudents.filter(s => 
        !enrolledIds.includes(s.student_id) &&
        s.student_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Roster for Enrollment */}
            <div className="card bg-base-300 shadow-inner">
                <div className="card-body">
                    <h3 className="card-title">1. Enroll Students</h3>
                    <input type="text" placeholder="Search students..." className="input input-sm input-bordered" onChange={(e) => setSearchTerm(e.target.value)} />
                    <div className="mt-2 h-64 overflow-y-auto">
                        {filteredStudents.map(student => (
                            <div key={student.student_id} className="flex justify-between items-center p-2 hover:bg-base-100 rounded-md">
                                <div>
                                    <p>{student.student_name}</p>
                                    {/* MODIFIED: Show skills */}
                                    <p className="text-xs opacity-60">{student.skills || 'No skills listed'}</p>
                                </div>
                                <button onClick={() => handleEnroll(student.student_id)} className="btn btn-xs btn-outline btn-success">Enroll</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Team Formation Panel */}
            <div className="card bg-base-300 shadow-inner">
                <div className="card-body">
                    <h3 className="card-title">2. Form Team</h3>
                    <input type="text" placeholder="Team Name" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="input input-sm input-bordered mt-2" required/>
                    <div className="mt-2 h-64 overflow-y-auto space-y-2">
                        {enrolledStudents.map(student => (
                            <div key={student.student_id} className="flex items-center gap-4 p-2 bg-base-100 rounded-md">
                                <span className="flex-1 font-semibold">{student.student_name}</span>
                                <select className="select select-bordered select-xs" onChange={(e) => handleRoleChange(student.student_id, e.target.value)} defaultValue="">
                                    <option disabled value="">Assign Role</option>
                                    {availableRoles.map(role => <option key={role.role_id} value={role.role_id}>{role.role_name}</option>)}
                                </select>
                            </div>
                        ))}
                         {enrolledStudents.length === 0 && <p className="text-sm text-center opacity-60 p-4">No students enrolled yet.</p>}
                    </div>
                    <div className="card-actions justify-end mt-4">
                        <button onClick={handleCreateTeam} className="btn btn-primary" disabled={enrolledStudents.length === 0}>Create & Assign Team</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamBuilder;