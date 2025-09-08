import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateIssue, deleteIssue, fetchAllIssue } from '../../redux/features/backlogSlice';
import { fetchAllEpics } from '../../redux/features/epicSlice';

const IssueItem = ({ item, projectKey }) => {
    const dispatch = useDispatch();
    const { epics } = useSelector((state) => state.epics);
    const currentProject = useSelector((state) => state?.projects?.currentProject);

    const [editingIssueId, setEditingIssueId] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [showEpicMenuFor, setShowEpicMenuFor] = useState(null);

    useEffect(() => {
        dispatch(fetchAllEpics());
    }, [dispatch]);

    // Hàm gán epic
    const handleAssignEpic = (issueId, epicId) => {
        dispatch(
            updateIssue({
                issueId,
                updates: {
                    epic: epicId,
                },
            }),
        )
            .unwrap()
            .then(() => dispatch(fetchIssueById(issueId)))
            .catch(console.error);
    };

    const handleEditIssue = (issue) => {
        setEditingIssueId(issue._id);
        setEditedTitle(issue.title);
    };

    const handleDeleteIssue = (id) => {
        if (confirm('Bạn có chắc muốn xóa issue này?')) {
            dispatch(deleteIssue(id))
                .unwrap()
                .then(() => dispatch(fetchAllIssue()))
                .catch((error) => console.error('Lỗi khi xóa issue:', error));
        }
    };

    const handleSaveEdit = (issueId) => {
        if (!editedTitle.trim()) return;
        dispatch(updateIssue({ issueId, updates: { title: editedTitle } }))
            .unwrap()
            .then(() => dispatch(fetchAllIssue()))
            .catch((error) => console.error('Lỗi khi cập nhật issue:', error));
        setEditingIssueId(null);
    };

    const handleCancelEditIssue = () => {
        setEditingIssueId(null);
        setEditedTitle('');
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
                <div className="flex w-full items-center justify-between gap-4">
                    {/* Trái: type + title */}
                    <div className="flex flex-1 items-center gap-2">
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
                    </div>

                    {/* Phải: 3 nút */}
                    <div className="flex w-[840px] items-center justify-between gap-4">
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

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowEpicOptions(true);
                            }}
                            className="text-gray-500 hover:text-green-600"
                            title="Chọn Epic"
                        >
                            + Epic
                        </button>

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
                    </div>
                </div>
            )}
        </>
    );
};

export default IssueItem;
