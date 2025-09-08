import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateIssue, deleteIssue, fetchAllIssue } from '../../redux/features/backlogSlice';

const IssueItem = ({ item, projectKey }) => {
    const dispatch = useDispatch();
    const currentProject = useSelector((state) => state?.project?.currentProject);

    const [editingIssueId, setEditingIssueId] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');

    const handleEditIssue = (issue) => {
        setEditingIssueId(issue._id);
        setEditedTitle(issue.title);
    };

    const handleCancelEditIssue = () => {
        setEditingIssueId(null);
        setEditedTitle('');
    };

    const handleSaveEdit = (issueId) => {
        if (!editedTitle.trim()) return;
        dispatch(updateIssue({ issueId, updates: { title: editedTitle } }))
            .unwrap()
            .then(() => dispatch(fetchAllIssue()))
            .catch((error) => console.error('Lỗi khi cập nhật issue:', error));
        setEditingIssueId(null);
    };

    const handleDeleteIssue = (id) => {
        if (confirm('Bạn có chắc muốn xóa issue này?')) {
            dispatch(deleteIssue(id))
                .unwrap()
                .then(() => dispatch(fetchAllIssue()))
                .catch((error) => console.error('Lỗi khi xóa issue:', error));
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveEdit(editingIssueId);
        } else if (e.key === 'Escape') {
            handleCancelEditIssue();
        }
    };

    return (
        <>
            {editingIssueId === item._id ? (
                <div className="flex w-full items-center gap-2">
                    <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit(item._id);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="Lưu"
                    >
                        ✔️
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEditIssue();
                        }}
                        className="text-red-500 hover:text-red-700"
                        title="Hủy"
                    >
                        ❌
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2">
                        <span
                            className={`px-2 py-1 text-sm font-bold ${
                                item.type === 'Task'
                                    ? 'text-green-500'
                                    : item.type === 'Bug'
                                      ? 'text-red-500'
                                      : 'text-blue-500'
                            }`}
                        >
                            {item.type}
                        </span>
                        <p>{`${currentProject?.key || projectKey} - ${item.number} ${item.title}`}</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditIssue(item);
                            }}
                            className="text-gray-500 hover:text-blue-500"
                            title="Sửa"
                        >
                            ✏️
                        </button>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteIssue(item._id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                        title="Xóa"
                    >
                        🗑️
                    </button>
                </>
            )}
        </>
    );
};

export default IssueItem;
