import React, { useState } from 'react';
import { createTaskDependency } from '../../services/api';

const AddDependencyModal = ({ task, allTasks, onDependencyAdded }) => {
    const [selectedDependency, setSelectedDependency] = useState('');
    const [error, setError] = useState('');

    if (!task) return null; // Prevent rendering if no task is selected

    const availableTasks = allTasks.filter(t => t.task_id !== task.task_id);
    const modalId = `dependency_modal_${task.task_id}`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedDependency) {
            setError('Please select a task.');
            return;
        }
        try {
            await createTaskDependency({
                task_id: task.task_id,
                dependent_task_id: selectedDependency
            });
            onDependencyAdded();
            document.getElementById(modalId).close();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add dependency.');
        }
    };

    return (
        <dialog id={modalId} className="modal">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Add Dependency for: "{task.task_name}"</h3>
                <p className="py-2">Select a task that must be completed before this one can start.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select
                        className="select select-bordered w-full"
                        value={selectedDependency}
                        onChange={(e) => setSelectedDependency(e.target.value)}
                        required
                    >
                        <option value="">-- Select a task --</option>
                        {availableTasks.map(t => (
                            <option key={t.task_id} value={t.task_id}>{t.task_name}</option>
                        ))}
                    </select>
                    {error && <p className="text-sm text-error">{error}</p>}
                    <div className="modal-action">
                        {/* MODIFIED: Replaced <form> with a button */}
                        <button type="button" className="btn btn-ghost" onClick={() => document.getElementById(modalId).close()}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Dependency</button>
                    </div>
                </form>
            </div>
        </dialog>
    );
};

export default AddDependencyModal;