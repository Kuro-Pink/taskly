import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateIssue, fetchIssueById, fetchAllIssue, fetchAllSprint } from '../../redux/features/backlogSlice';
import { getCommentsByIssue, createComment, updateComment, deleteComment } from '../../redux/features/commentSlice'; // sửa đường dẫn nếu cần
import { fetchAllEpics } from '../../redux/features/epicSlice';
import { fetchStatuses } from '../../redux/features/statusSlice';
import { useSelector } from 'react-redux';
import { current } from '@reduxjs/toolkit';
const dummyAssignees = [
    { _id: '1', name: 'Alice' },
    { _id: '2', name: 'Bob' },
    { _id: '3', name: 'Charlie' },
];

const IssueDetailsModal = ({ issue, onClose }) => {
    if (!issue) return null;
    const currentProject = useSelector((state) => state.projects.currentProject);
    const { comments } = useSelector((state) => state.comment);
    const { user } = useSelector((state) => state.auth); // Lấy user hiện tại

    const { issues, sprints, loading, error } = useSelector((state) => state.backlog);
    const { statuses } = useSelector((state) => state.statuses);
    const { epics } = useSelector((state) => state.epics);

    const dispatch = useDispatch();

    const [editedTitle, setEditedTitle] = useState(issue.title || '');
    const [editingIssueId, setEditingIssueId] = useState(null); // NEW
    const [editedDescription, setEditedDescription] = useState(issue.description || '');
    const [editedStatus, setEditedStatus] = useState(issue.status || statuses[0]);
    const [editedType, setEditedType] = useState(issue.type || 'Task');
    const [editedEpicId, setEditedEpicId] = useState(issue.epic || '');

    const [editedAssigneeId, setEditedAssigneeId] = useState(issue.assignee?._id || '');

    const selectedAssignee = dummyAssignees.find((a) => a._id === editedAssigneeId);

    const selectedIssue = useSelector((state) => state.backlog.selectedIssue);

    const [newComment, setNewComment] = useState('');
    const [editCommentId, setEditCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');

    useEffect(() => {
        if (selectedIssue) {
            setEditedTitle(selectedIssue.title || '');
            setEditedType(selectedIssue.type || '');
        }
    }, [selectedIssue]); // 👈 thay vì chỉ [issue]

    useEffect(() => {
        if (issue) {
            dispatch(getCommentsByIssue(issue._id));
        }
    }, [issue]);

    useEffect(() => {
        dispatch(fetchAllSprint());
        dispatch(fetchStatuses());
        dispatch(fetchAllEpics());
    }, [dispatch]);

    const handleSaveEdit = (issueId) => {
        if (!editedTitle.trim()) return;
        console.log('Saving issue:', editedTitle, editedType);

        dispatch(updateIssue({ issueId, updates: { title: editedTitle, type: editedType } }))
            .unwrap()
            .then(() => {
                dispatch(fetchIssueById(issueId)); // ✅ Làm mới lại props từ Redux
                setEditingIssueId(null); // Thoát chế độ chỉnh sửa
            })
            .catch((error) => {
                console.error('Lỗi khi cập nhật issue:', error);
            });
    };

    const handleCancelEditIssue = () => {
        setEditingIssueId(null);
        setEditedTitle(selectedIssue.title || '');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveEdit(editingIssueId);
        } else if (e.key === 'Escape') {
            handleCancelEditIssue();
        }
    };

    const handleStatusChange = (newStatus) => {
        const statusId = statuses.find(
            (status) => status.name === newStatus && status.project === currentProject._id,
        )?._id;
        setEditedStatus(newStatus);
        setEditingIssueId(issue._id);

        dispatch(
            updateIssue({
                issueId: issue._id,
                updates: { status: statusId },
            }),
        )
            .unwrap()
            .then(() => {
                dispatch(fetchIssueById(issue._id));
                setEditingIssueId(null);
            })
            .catch(console.error);
    };

    const handleTypeChange = (newType) => {
        setEditedType(newType);
        setEditingIssueId(issue._id);

        dispatch(
            updateIssue({
                issueId: issue._id,
                updates: { type: newType }, // Giữ title hiện tại
            }),
        )
            .unwrap()
            .then(() => {
                dispatch(fetchIssueById(issue._id));
                setEditingIssueId(null);
            })
            .catch(console.error);
    };

    const handleEpicSaveEdit = (newEpic) => {
        setEditedEpicId(newEpic);
        setEditingIssueId(issue._id);

        dispatch(
            updateIssue({
                issueId: issue._id,
                updates: { epic: newEpic },
            }),
        )
            .unwrap()
            .then(() => {
                dispatch(fetchIssueById(issue._id));
                setEditingIssueId(null);
            })
            .catch(console.error);
    };

    const handleCreateComment = () => {
        if (!newComment.trim()) return;
        dispatch(createComment({ issueId: issue._id, content: newComment.trim() }));
        setNewComment('');
    };

    // 👉 Chuẩn bị sửa comment (fill dữ liệu vào input)
    const handleStartEditComment = (comment) => {
        console.log('Start editing comment:', comment._id);
        setEditCommentId(comment._id);
        setEditContent(comment.content);
    };

    const handleCancelEditComment = () => {
        setEditCommentId(null); // Đóng form khi cancel
        setEditContent(''); // Reset nội dung
    };

    // 👉 Xác nhận sửa comment
    const handleUpdateComment = () => {
        if (!editContent.trim() || !editCommentId) return;
        dispatch(updateComment({ commentId: editCommentId, content: editContent.trim() }));
        setEditCommentId(null);
        setEditContent('');
    };

    // 👉 Xóa comment
    const handleDeleteComment = (commentId) => {
        // Hỏi xác nhận trước khi xóa
        const isConfirmed = window.confirm('Bạn có chắc muốn xóa bình luận này?');
        if (isConfirmed) {
            dispatch(deleteComment(commentId)); // Dispatch action delete
            toast.success('Bình luận đã bị xóa!'); // Thông báo xóa thành công
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/30 p-6 pt-20">
            <div className="h-[680px] w-[1160px] rounded-lg bg-white shadow-2xl">
                {/* Header */}
                <div className="flex h-[68px] items-center justify-between border-b px-8">
                    <div className="w-full pr-4">
                        <span className="rounded bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                            ⚡{epics.find((epic) => issue.epic && epic._id === editedEpicId)?.name || ''}
                        </span>
                        /
                        <span className="rounded bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                            {editedType}
                        </span>
                        {editingIssueId === issue._id ? (
                            <input
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="mt-2 w-full rounded border border-gray-300 px-2 py-1 text-2xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            />
                        ) : (
                            <h2 onClick={() => setEditingIssueId(issue._id)} className="cursor-pointer">
                                {selectedIssue ? selectedIssue.title : issue.title}
                            </h2>
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
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Trạng thái</label>
                                <select
                                    value={editedStatus}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                >
                                    {statuses
                                        .filter((status) => issue.status && status.project === currentProject._id)
                                        ?.map((status) => (
                                            <option key={status._id} value={status.name}>
                                                {status.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">Loại issue</label>
                                <select
                                    value={editedType}
                                    onChange={(e) => handleTypeChange(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                >
                                    <option value="Task">Task</option>
                                    <option value="Bug">Bug</option>
                                    <option value="Story">Story</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Giao cho</label>
                            <select
                                value={editedAssigneeId}
                                onChange={(e) => handleEpicSaveEdit(e.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            >
                                <option value="">Unassigned</option>
                                {dummyAssignees.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Epic</label>
                            <select
                                value={editedEpicId}
                                onChange={(e) => handleEpicSaveEdit(e.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            >
                                {epics
                                    .filter((epic) => issue.epic && epic.projectId === currentProject._id)
                                    .map((epic) => (
                                        <option key={epic._id} value={epic._id}>
                                            {epic ? epic.name : ''}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Sprint</label>
                            <input
                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-bold text-purple-500"
                                value={sprints.find((s) => s._id === issue.sprint)?.name || 'No Sprint'}
                                readOnly
                            />
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
                            onClick={handleCreateComment}
                            className="mt-2 rounded bg-blue-600 px-4 py-1 text-sm text-white hover:bg-blue-700"
                        >
                            Bình luận
                        </button>

                        <div className="mt-4 space-y-4">
                            {comments.map((cmt) => (
                                <div key={cmt._id} className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-xl font-semibold text-white">
                                        {user?.name?.[0] || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-base text-gray-600">
                                            <div className="mr-4">
                                                <span className="mr-4 text-2xl font-semibold">
                                                    {user?.name || 'Unknown'}
                                                </span>
                                                <span>{new Date(cmt.createdAt).toLocaleString()}</span>
                                            </div>
                                            {user?._id === cmt.userId && (
                                                <div className="flex-1 items-center space-x-2 text-xl text-blue-600">
                                                    <button
                                                        className="mx-2 cursor-pointer px-2"
                                                        onClick={() => handleStartEditComment(cmt)}
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        className="mx-2 cursor-pointer p-2"
                                                        onClick={() => handleDeleteComment(cmt._id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {/* Nếu comment này đang được edit */}
                                        {console.log('Edit comment ID:', editCommentId)}
                                        {editCommentId === cmt._id ? (
                                            <div className="mt-2">
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="w-full rounded border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400"
                                                />
                                                <div className="mt-2 space-x-2">
                                                    <button
                                                        onClick={handleUpdateComment}
                                                        className="rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600"
                                                    >
                                                        LưuLưu
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEditComment}
                                                        className="rounded bg-gray-400 px-3 py-1 text-white hover:bg-gray-500"
                                                    >
                                                        Huỷ
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // Nếu không phải edit thì hiển thị bình thường
                                            <p className="mt-1 text-gray-800">{cmt.content}</p>
                                        )}
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
