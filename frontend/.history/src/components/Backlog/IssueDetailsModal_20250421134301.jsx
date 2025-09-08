import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateIssue, fetchIssueById } from '../../redux/features/backlogSlice';

const dummyAssignees = [
    { _id: '1', name: 'Alice' },
    { _id: '2', name: 'Bob' },
    { _id: '3', name: 'Charlie' },
];

const IssueDetailsModal = ({ issue, onClose }) => {
    if (!issue) return null;

    const dispatch = useDispatch();

    const [editedTitle, setEditedTitle] = useState(issue.title || '');
    const [editingIssueId, setEditingIssueId] = useState(null); // NEW
    const [editedDescription, setEditedDescription] = useState(issue.description || '');
    const [editedType, setEditedType] = useState(issue.type || 'Task');
    const [editedAssigneeId, setEditedAssigneeId] = useState(issue.assignee?._id || '');

    const selectedAssignee = dummyAssignees.find((a) => a._id === editedAssigneeId);

    //✏️ Cập nhật IssueDetailsModal
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([
        { id: 'c1', user: 'Alice', text: 'Initial comment here', createdAt: new Date() },
        { id: 'c2', user: 'Bob', text: 'Another one', createdAt: new Date() },
    ]);

    useEffect(() => {
        if (issue) {
            setEditedTitle(issue.title || '');
            setEditedDescription(issue.description || '');
            setEditedType(issue.type || 'Task');
            setEditedAssigneeId(issue.assignee?._id || '');
        }
    }, [issue]); // 👈 mỗi khi issue thay đổi => cập nhật local state

    const handleSaveEdit = (issueId) => {
        if (!editedTitle.trim()) return;

        dispatch(updateIssue({ issueId, updates: { title: editedTitle } }))
            .unwrap()
            .then(() => {
                dispatch(fetchIssueById(issueId)); // 🔁 Lấy lại issue mới nhất
                setEditingIssueId(null); // Thoát chế độ chỉnh sửa
            })
            .catch((error) => {
                console.error('Lỗi khi cập nhật issue:', error);
            });
    };

    const handleCancelEditIssue = () => {
        setEditingIssueId(null);
        setEditedTitle(issue.title || '');
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
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/30 p-6 pt-20">
            <div className="h-[680px] w-[1160px] rounded-lg bg-white shadow-2xl">
                {/* Header */}
                <div className="flex h-[68px] items-center justify-between border-b px-8">
                    <div className="w-full pr-4">
                        <span className="rounded bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                            {editedType}
                        </span>
                        {editingIssueId === issue._id ? (
                            // Hiển thị input khi đang edit
                            <input
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            />
                        ) : (
                            // Hiển thị title bình thường
                            <h2 onClick={() => setEditingIssueId(issue._id)}>{issue.title}</h2>
                        )}
                    </div>
                    <button className="text-3xl text-gray-400 hover:text-gray-700" onClick={onClose}>
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="h-[612px] overflow-y-auto px-8 py-6">
                    {/* Description */}
                    <div className="mb-8">
                        <h3 className="mb-2 text-base font-semibold text-gray-700">Description</h3>
                        <textarea
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            rows={4}
                        />
                    </div>

                    {/* Info Section */}
                    <div className="mb-8 grid grid-cols-2 gap-6">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Assignee</label>
                            <select
                                value={editedAssigneeId}
                                onChange={(e) => setEditedAssigneeId(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            >
                                <option value="">Unassigned</option>
                                {dummyAssignees.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Reporter</label>
                            <input
                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700"
                                value={issue.reporter?.name || 'You'}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Sprint</label>
                            <input
                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700"
                                value={issue.sprint?.name || 'Backlog'}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Type</label>
                            <select
                                value={editedType}
                                onChange={(e) => setEditedType(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            >
                                <option value="Task">Task</option>
                                <option value="Bug">Bug</option>
                                <option value="Story">Story</option>
                            </select>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="mb-8">
                        <label className="mb-1 block text-sm font-semibold text-gray-700">Tags</label>
                        <div className="flex flex-wrap gap-2">
                            {(issue.tags || []).map((tag, idx) => (
                                <span key={idx} className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-800">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Comment Section */}
                    <div>
                        <h3 className="mb-2 text-base font-semibold text-gray-700">Activity</h3>
                        <textarea
                            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            rows={3}
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        ></textarea>
                        <button
                            onClick={() => {
                                if (!newComment.trim()) return;
                                setComments([
                                    ...comments,
                                    {
                                        id: Date.now().toString(),
                                        user: 'You',
                                        text: newComment.trim(),
                                        createdAt: new Date(),
                                    },
                                ]);
                                setNewComment('');
                            }}
                            className="mt-2 rounded bg-blue-600 px-4 py-1 text-sm text-white hover:bg-blue-700"
                        >
                            Comment
                        </button>

                        <div className="mt-4 space-y-4">
                            {comments.map((cmt) => (
                                <div key={cmt.id} className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-2xl font-semibold text-white">
                                        {cmt.user[0]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex text-2xl text-gray-600">
                                            <span className="mr-4 font-semibold">{cmt.user}</span>
                                            <span>{cmt.createdAt.toLocaleString()}</span>
                                        </div>
                                        <p className="mt-1 text-2xl text-gray-800">{cmt.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                            onClick={() => {
                                const updates = {
                                    title: editedTitle,
                                    description: editedDescription,
                                    type: editedType,
                                    assignee: dummyAssignees.find((a) => a._id === editedAssigneeId) || null,
                                };
                                // dispatch(updateIssue({ issueId: issue._id, updates }));
                                console.log('Saving issue:', updates);
                                onClose();
                            }}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDetailsModal;
