import React, { useState, useEffect, useCallback } from 'react';
import { getTasksForProject, createTask, deleteTask, updateTaskStatus, getTaskDependenciesForProject } from '../../services/api';
import SubmitWorkModal from './SubmitWorkModal';
import AddDependencyModal from './AddDependencyModal';
import { useAuth } from '../../context/AuthContext';

// MODIFIED: The full code for this sub-component is now included.
const AddTaskForm = ({ projectId, onTaskAdded }) => {
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await createTask({ project_id: projectId, task_name: taskName, task_description: taskDescription });
            setTaskName('');
            setTaskDescription('');
            onTaskAdded(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add task.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="p-4 bg-base-100 rounded-lg space-y-2">
            <h3 className="font-bold">Add a New Task</h3>
            <div className="form-control">
                <input 
                    type="text" 
                    placeholder="Enter New Task Name" 
                    className="input input-bordered w-full"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    required
                />
            </div>
            <div className="form-control">
                <textarea
                    placeholder="Task Description (Optional)"
                    className="textarea textarea-bordered w-full"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                ></textarea>
            </div>
            {error && <p className="text-error text-xs">{error}</p>}
            <button type="submit" className="btn btn-sm btn-secondary" disabled={loading}>
                {loading ? <span className="loading loading-spinner-xs"></span> : "Add Task"}
            </button>
        </form>
    );
};

const TaskList = ({ projectId, isTeamLead, project }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [dependencies, setDependencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);

    const fetchData = useCallback(async () => {
        if (!projectId) return;
        try {
            setLoading(true);
            const [tasksRes, depsRes] = await Promise.all([
                getTasksForProject(projectId),
                getTaskDependenciesForProject(projectId)
            ]);
            setTasks(tasksRes.data);
            setDependencies(depsRes.data);
        } catch (error) {
            console.error("Failed to fetch tasks or dependencies:", error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openModal = (modalId) => document.getElementById(modalId).showModal();

    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try { await deleteTask(taskId); fetchData(); }
            catch (error) { alert(error.response?.data?.message || 'Failed to delete task.'); }
        }
    };
    
    const handleStatusChange = async (taskId, newStatus) => {
        try { await updateTaskStatus(taskId, newStatus); fetchData(); }
        catch (error) { alert(error.response?.data?.message || 'Failed to update task status.'); }
    };
    
    const isAdmin = (user?.role === 'mentor') || isTeamLead;

    if (loading && tasks.length === 0) return <div className="skeleton h-60 w-full"></div>;

    return (
        <>
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Project Tasks</h2>
                    
                    {isAdmin && <AddTaskForm projectId={projectId} onTaskAdded={fetchData} />}

                    <div className="overflow-x-auto mt-4">
                        <table className="table">
                            <thead><tr><th>Task</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {tasks.map(task => {
                                    const taskDeps = dependencies.filter(d => d.task_id === task.task_id);
                                    return (
                                        <tr key={task.task_id} className="hover">
                                            <td>
                                                <p className="font-bold">{task.task_name}</p>
                                                <p className="text-xs opacity-60">{task.task_description}</p>
                                                {taskDeps.length > 0 && (
                                                    <div className="text-xs opacity-70 mt-1">
                                                        <span className="font-semibold">Depends on: </span>
                                                        {taskDeps.map(d => d.dependent_task_name).join(', ')}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <select className="select select-bordered select-xs" value={task.task_status} onChange={(e) => handleStatusChange(task.task_id, e.target.value)} disabled={user.role === 'mentor'}>
                                                    <option>To-Do</option>
                                                    <option>In Progress</option>
                                                    <option>Done</option>
                                                </select>
                                            </td>
                                            <td className="flex flex-col sm:flex-row gap-2">
                                                <button onClick={() => { setSelectedTask(task); openModal('submit_work_modal'); }} className="btn btn-sm btn-primary">Submissions</button>
                                                {isAdmin && (
                                                    <>
                                                        <button onClick={() => { setSelectedTask(task); openModal(`dependency_modal_${task.task_id}`); }} className="btn btn-sm btn-outline">Deps</button>
                                                        <button onClick={() => handleDelete(task.task_id)} className="btn btn-sm btn-error btn-outline">Delete</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {tasks.length === 0 && !loading && (<tr><td colSpan="3" className="text-center">No tasks have been added yet.</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <SubmitWorkModal task={selectedTask} onSuccessfulSubmit={fetchData} />
            {tasks.map(task => (<AddDependencyModal key={task.task_id} task={task} allTasks={tasks} onDependencyAdded={fetchData} />))}
        </>
    );
};

export default TaskList;