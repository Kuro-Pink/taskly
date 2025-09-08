import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateIssue, fetchIssueById, fetchAllIssue, fetchAllSprint } from '../../redux/features/backlogSlice';
import { getCommentsByIssue, createComment, updateComment, deleteComment } from '../../redux/features/commentSlice'; // sửa đường dẫn nếu cần
import { fetchAllEpics } from '../../redux/features/epicSlice';
import { fetchStatuses } from '../../redux/features/statusSlice';
import { useSelector } from 'react-redux';
import { current } from '@reduxjs/toolkit';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useParams } from 'react-router-dom';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    Typography,
} from '@mui/material';
import { toast } from 'react-toastify';

const IssueDetailsModal = ({ issue, onClose }) => {
    if (!issue) return null;
    const { key } = useParams();
    const currentProject = useSelector((state) => state.projects.currentProject);
    const members = currentProject.members;

    const { comments } = useSelector((state) => state.comment);

    const { user } = useSelector((state) => state.auth); // Lấy user hiện tại

    const { issues, sprints, loading, error } = useSelector((state) => state.backlog);
    const { statuses } = useSelector((state) => state.statuses);
    const { epics } = useSelector((state) => state.epics);

    const dispatch = useDispatch();
    const [editingIssueId, setEditingIssueId] = useState(null); // NEW
    const [editedTitle, setEditedTitle] = useState(issue.title || '');
    const [editedDescription, setEditedDescription] = useState(issue.description || '');
    const [editedStatus, setEditedStatus] = useState(issue.status || 'Error');
    const [editedType, setEditedType] = useState(issue.type || 'Task');
    const [editedEpicId, setEditedEpicId] = useState(issue.epic || '');

    const [editedAssigneeId, setEditedAssigneeId] = useState(issue.assignee || '');

    const selectedIssue = useSelector((state) => state.backlog.selectedIssue);

    const [newComment, setNewComment] = useState('');
    const [editCommentId, setEditCommentId] = useState(null);
    const [editContent, setEditContent] = useState('');

    const [description, setDescription] = useState('Mô tả công việc ban đầu...');
    const [isEditing, setIsEditing] = useState(false);

    //Modal waring
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [pendingAssignee, setPendingAssignee] = useState(null);
    const totalTasks = issues.filter((issue) => issue.project === currentProject._id).length;

    // Đếm số task mỗi người
    const workloadMap = {};
    for (let issue of issues) {
        const id = issue.assignee || 'unassigned';
        workloadMap[id] = (workloadMap[id] || 0) + 1;
    }

    const getPercent = (id) => {
        return Math.round(((workloadMap[id] || 0) / totalTasks) * 100);
    };

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

    const handleSaveDescription = () => {
        setDescription(editedDescription);

        dispatch(updateIssue({ issueId: issue._id, updates: { description: editedDescription } }))
            .unwrap()
            .then(() => {
                dispatch(fetchAllIssue());
                dispatch(fetchIssueById(issue._id)); // ✅ Làm mới lại props từ Redux
                setIsEditing(false);
            })
            .catch((error) => {
                console.error('Lỗi khi cập nhật issue:', error);
            });
    };

    const handleCancelDescription = () => {
        setEditedDescription(description); // reset lại nội dung cũ
        setIsEditing(false);
    };

    const handleSaveEdit = (issueId) => {
        if (!editedTitle.trim()) return;
        dispatch(updateIssue({ issueId, updates: { title: editedTitle, type: editedType } }))
            .unwrap()
            .then(() => {
                dispatch(fetchAllIssue());
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
        setEditedStatus(newStatus);
        setEditingIssueId(issue._id);

        dispatch(
            updateIssue({
                issueId: issue._id,
                updates: { status: newStatus },
            }),
        )
            .unwrap()
            .then(() => {
                dispatch(fetchAllIssue());
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
                dispatch(fetchAllIssue());
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
                dispatch(fetchAllIssue());
                dispatch(fetchIssueById(issue._id));
                setEditingIssueId(null);
            })
            .catch(console.error);
    };

    const handleAssignSaveEdit = (newAssignId) => {
        const percent = getPercent(newAssignId);

        if (percent >= 50) {
            const others = members
                .filter((m) => m.user._id !== newAssignId)
                .map((m) => ({
                    id: m.user._id,
                    name: m.name,
                    percent: getPercent(m.user._id),
                }))
                .filter((m) => m.percent < 70)
                .sort((a, b) => a.percent - b.percent); // ít trước

            setSuggestedUsers(others);
            setPendingAssignee(newAssignId);
            setShowWarningModal(true);
            return;
        }

        proceedAssign(newAssignId);
    };

    const proceedAssign = (assigneeId) => {
        setEditedAssigneeId(assigneeId);
        setEditingIssueId(issue._id);

        dispatch(
            updateIssue({
                issueId: issue._id,
                updates: { assignee: assigneeId },
            }),
        )
            .unwrap()
            .then(() => {
                dispatch(fetchAllIssue());
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
                            ⚡{epics.find((epic) => epic._id === editedEpicId)?.name || ''}
                        </span>
                        /
                        <span className="rounded bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                            {`${key} - ${issue.number}`}
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
                        <h3 className="mb-2 text-base font-semibold text-gray-700">Mô tả công việc</h3>

                        {isEditing ? (
                            <>
                                <textarea
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                    rows={4}
                                />
                                <div className="mt-2 flex gap-2">
                                    <button
                                        onClick={handleSaveDescription}
                                        className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                                    >
                                        Lưu
                                    </button>
                                    <button
                                        onClick={handleCancelDescription}
                                        className="rounded bg-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-400"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div
                                className="cursor-pointer rounded-md bg-gray-100 p-3 text-sm text-gray-800 hover:bg-gray-200"
                                onClick={() => setIsEditing(true)}
                            >
                                {editedDescription || <span className="text-gray-400 italic">Chưa có mô tả</span>}
                            </div>
                        )}
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
                                            <option key={status._id} value={status._id}>
                                                {status ? status.name : 'Chưa có trạng thái'}
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
                                onChange={(e) => handleAssignSaveEdit(e.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            >
                                <option value="">Chưa được chỉ định</option>
                                {members.map((user) => (
                                    <option key={user._id} value={user.user._id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Dialog open={showWarningModal} onClose={() => setShowWarningModal(false)}>
                            <DialogTitle>Thành viên đang quá tải</DialogTitle>
                            <DialogContent>
                                <Typography>
                                    Thành viên bạn chọn đang có nhiều công việc được giao. Bạn có thể xem xét những
                                    người khác ít việc hơn:
                                </Typography>
                                <List>
                                    {suggestedUsers.map((u) => (
                                        <ListItem key={u.id}>
                                            <ListItemText primary={`${u.name} (${u.percent}%)`} />
                                        </ListItem>
                                    ))}
                                </List>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setShowWarningModal(false)}>Huỷ</Button>
                                <Button
                                    onClick={() => {
                                        setShowWarningModal(false);
                                        proceedAssign(pendingAssignee);
                                    }}
                                    variant="contained"
                                    color="error"
                                >
                                    Vẫn giao việc
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-semibold text-gray-700">Epic</label>
                            <select
                                value={editedEpicId || ''}
                                onChange={(e) => handleEpicSaveEdit(e.target.value)}
                                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            >
                                {!issue.epic && <option value="">Chưa có Epic</option>}
                                {epics
                                    .filter((epic) => String(epic.projectId) === String(currentProject._id))
                                    .map((epic) => (
                                        <option key={epic._id} value={epic._id}>
                                            {epic.name}
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

                    {/* Comment Section */}
                    <div>
                        <h3 className="mb-2 text-base font-semibold text-gray-700">Bình luận</h3>
                        <textarea
                            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            rows={3}
                            placeholder="Viết bình luận vào đây..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        ></textarea>
                        <button
                            onClick={handleCreateComment}
                            className="mt-4 rounded bg-blue-600 px-4 py-1 text-sm text-white hover:bg-blue-700"
                        >
                            Thêm bình luận
                        </button>

                        <div className="mt-4 space-y-4">
                            {comments.map((cmt) => (
                                <div key={cmt._id} className="flex items-start gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-xl font-semibold text-white">
                                        {cmt?.username?.[0] || '?'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-base text-gray-600">
                                            <div className="mr-4">
                                                <span className="mr-4 text-2xl font-semibold">
                                                    {cmt?.username || 'Unknown'}
                                                </span>
                                                <span>
                                                    {' '}
                                                    {formatDistanceToNow(new Date(cmt.createdAt), {
                                                        addSuffix: true,
                                                        locale: vi,
                                                    })}
                                                </span>
                                            </div>
                                            {user.id === cmt.user && (
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
                                                        Lưu
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
