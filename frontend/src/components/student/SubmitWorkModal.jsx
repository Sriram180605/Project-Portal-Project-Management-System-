import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createSubmission, getSubmissionsForTask, createFeedback } from '../../services/api';

const SubmitWorkModal = ({ task, onSuccessfulSubmit }) => {
    const { user } = useAuth();
    const [submissionLink, setSubmissionLink] = useState('');
    const [pastSubmissions, setPastSubmissions] = useState([]);
    const [commentText, setCommentText] = useState({}); // Use an object for multiple feedback forms
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const modalId = 'submit_work_modal';

    const fetchSubmissions = useCallback(async () => {
        if (!task) return;
        try {
            setLoading(true);
            const res = await getSubmissionsForTask(task.task_id);
            setPastSubmissions(res.data);
        } catch (err) {
            console.error("Failed to fetch submissions", err);
        } finally {
            setLoading(false);
        }
    }, [task]);
    
    useEffect(() => {
        if (task) {
          fetchSubmissions();
        }
    }, [task, fetchSubmissions]);

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!submissionLink) {
            setError('Submission link cannot be empty.');
            return;
        }
        try {
            await createSubmission({ task_id: task.task_id, submission_link: submissionLink });
            setSubmissionLink('');
            fetchSubmissions();
            if (onSuccessfulSubmit) onSuccessfulSubmit();
        } catch (err) {
            setError('Failed to submit work.');
        }
    };

    const handleFeedbackSubmit = async (e, submissionNo) => {
        e.preventDefault();
        const feedback = commentText[submissionNo];
        if (!feedback) return;
        try {
            await createFeedback({ submission_no: submissionNo, comment_text: feedback });
            setCommentText(prev => ({ ...prev, [submissionNo]: '' })); // Clear only this feedback input
            fetchSubmissions();
        } catch (error) {
            alert('Failed to submit feedback.');
        }
    };

    const handleCommentChange = (submissionNo, text) => {
        setCommentText(prev => ({ ...prev, [submissionNo]: text }));
    };

    return (
        <dialog id={modalId} className="modal">
            <div className="modal-box w-11/12 max-w-2xl">
                <h3 className="font-bold text-lg">Submissions for: {task?.task_name}</h3>
                
                {/* 1. Student Submission Form */}
                {user?.role === 'student' && (
                    <form onSubmit={handleStudentSubmit} className="py-4 space-y-2">
                        <div className="form-control">
                            <label className="label"><span className="label-text">New Submission Link</span></label>
                            <input type="url" placeholder="https://..." value={submissionLink} onChange={(e) => setSubmissionLink(e.target.value)} className="input input-bordered" required />
                        </div>
                        {error && <p className="text-error text-sm">{error}</p>}
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </form>
                )}

                <div className="divider">Submission History & Feedback</div>

                {/* 2. Submission History & Mentor Feedback Forms */}
                <div className="space-y-4 max-h-60 overflow-y-auto">
                    {loading ? <p>Loading history...</p> : pastSubmissions.map(sub => (
                        <div key={sub.submission_no}>
                            <div className="chat chat-start">
                                <div className="chat-header">
                                    {sub.student_name}
                                    <time className="text-xs opacity-50 ml-2">{new Date(sub.submission_timestamp).toLocaleString()}</time>
                                </div>
                                <div className="chat-bubble chat-bubble-info">
                                    <a href={sub.submission_link} target="_blank" rel="noopener noreferrer" className="link break-all">{sub.submission_link}</a>
                                </div>
                            </div>
                            {sub.comment_text && (
                                <div className="chat chat-end mt-2">
                                     <div className="chat-header">
                                        {sub.mentor_name} (Feedback)
                                        <time className="text-xs opacity-50 ml-2">{new Date(sub.feedback_timestamp).toLocaleString()}</time>
                                    </div>
                                    <div className="chat-bubble chat-bubble-success">{sub.comment_text}</div>
                                </div>
                            )}
                            {user?.role === 'mentor' && !sub.comment_text && (
                                <form onSubmit={(e) => handleFeedbackSubmit(e, sub.submission_no)} className="mt-2 ml-10">
                                    <textarea
                                        className="textarea textarea-bordered w-full"
                                        placeholder="Write your feedback here..."
                                        value={commentText[sub.submission_no] || ''}
                                        onChange={(e) => handleCommentChange(sub.submission_no, e.target.value)}
                                        rows={2}
                                        required
                                    ></textarea>
                                    <button type="submit" className="btn btn-xs btn-secondary mt-1">Post Feedback</button>
                                </form>
                            )}
                        </div>
                    ))}
                    {!loading && pastSubmissions.length === 0 && <p>No submissions yet for this task.</p>}
                </div>
                
                {/* 3. Correct Close Button */}
                <div className="modal-action">
                    <button type="button" className="btn" onClick={() => document.getElementById(modalId).close()}>Close</button>
                </div>
            </div>
        </dialog>
    );
};

export default SubmitWorkModal;