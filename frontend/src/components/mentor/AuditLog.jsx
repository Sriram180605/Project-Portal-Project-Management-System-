import React from 'react';

// This component is the GUI for your Trigger
const AuditLog = ({ logs }) => {
    return (
        <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">Project Audit Log</h2>
                <p className="text-sm">(Data from Database Trigger)</p>
                <div className="overflow-x-auto mt-4 max-h-64">
                    <table className="table table-zebra table-pin-rows">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Change Description</th>
                                <th>Changed By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs && logs.length > 0 ? logs.map(log => (
                                <tr key={log.log_id}>
                                    <td>{new Date(log.changed_at).toLocaleString()}</td>
                                    <td>{log.change_description}</td>
                                    <td>{log.changed_by_user}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan="3">No changes logged.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLog;