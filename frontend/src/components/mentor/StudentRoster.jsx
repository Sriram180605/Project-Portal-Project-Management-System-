import React, { useState, useEffect } from 'react';
import { getStudents } from '../../services/api';

const StudentRoster = () => {
    const [students, setStudents] = useState([]);
    const [skill, setSkill] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            const response = await getStudents();
            setStudents(response.data);
            setLoading(false);
        };
        fetchStudents();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        const response = await getStudents(skill);
        setStudents(response.data);
        setLoading(false);
    };

    return (
        <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">Student Roster</h2>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input type="text" placeholder="Filter by skill..." value={skill} onChange={(e) => setSkill(e.target.value)} className="input input-bordered w-full" />
                    <button type="submit" className="btn btn-secondary">Search</button>
                </form>
                <div className="overflow-x-auto h-64">
                    {loading ? <p>Loading students...</p> : (
                        <table className="table table-pin-rows">
                            <thead>
                                <tr><th>Name</th><th>Email</th><th>Skills</th></tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student.student_id}>
                                        <td>{student.student_name}</td>
                                        <td>{student.student_mail}</td>
                                        <td>{student.skills || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentRoster;