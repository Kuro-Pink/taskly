import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createIssue } from '../../redux/features/backlogSlice';
import { fetchProjectById } from '../../redux/features/projectSlice';
import { useParams } from 'react-router-dom';
const IssueForm = () => {
    const dispatch = useDispatch();
    const { key, id } = useParams(); // 🟢 Lấy giá trị từ URL
    const currentProject = useSelector((state) => state.project?.currentProject);

    const [newIssue, setNewIssue] = useState({ title: '', type: 'Task' });
    const [isCreatingIssue, setIsCreatingIssue] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchProjectById(id)); // ✅ Lấy thông tin dự án
        }
    }, [id, dispatch]);

    const handleAddIssue = () => {
        if (!newIssue.title.trim()) return;

        dispatch(
            createIssue({
                title: newIssue.title,
                type: newIssue.type,
                project: currentProject?._id,
            }),
        );

        setNewIssue({ title: '', type: 'Task' });
        setIsCreatingIssue(false);
    };

    return (
        <div>
            {isCreatingIssue ? (
                <div className="my-2 rounded-md bg-white p-2 shadow">
                    <input
                        type="text"
                        value={newIssue.title}
                        onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                        className="w-full rounded-md border p-1"
                        placeholder="Issue title"
                    />
                    <select
                        value={newIssue.type}
                        onChange={(e) => setNewIssue({ ...newIssue, type: e.target.value })}
                        className="mt-2 w-full rounded-md border p-1"
                    >
                        <option value="Task">Task</option>
                        <option value="Bug">Bug</option>
                        <option value="Story">Story</option>
                    </select>

                    <button onClick={handleAddIssue} className="mt-2 w-full rounded-md bg-blue-500 p-1 text-white">
                        Add Issue
                    </button>
                    <button
                        onClick={() => setIsCreatingIssue(false)}
                        className="mt-2 w-full rounded-md bg-gray-300 p-1"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button onClick={() => setIsCreatingIssue(true)} className="mt-2 w-full rounded-md bg-gray-300 p-2">
                    + Create Issue
                </button>
            )}
        </div>
    );
};

export default IssueForm;
