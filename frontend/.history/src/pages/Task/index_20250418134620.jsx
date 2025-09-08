import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    createIssue,
    updateIssue,
    deleteIssue,
    fetchAllIssue,
    fetchAllSprint,
} from '../../redux/features/backlogSlice';
import { createStatus, updateStatus, deleteStatus, fetchStatuses } from '../../redux/features/statusSlice';

const KanbanBoard = () => {
    const dispatch = useDispatch();
    const { issues, sprints } = useSelector((state) => state.backlog);
    const { statuses } = useSelector((state) => state.statuses);
    const currentProject = useSelector((state) => state.projects.currentProject);

    const [newIssue, setNewIssue] = useState({ title: '', type: 'Task' });
    const [editingIssueId, setEditingIssueId] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [creatingStatusMap, setCreatingStatusMap] = useState({}); // 👈 xử lý trạng thái form riêng cho từng status

    const [isCreatingStatus, setIsCreatingStatus] = useState(false);
    const [newStatusName, setNewStatusName] = useState('');
    const [editingStatusId, setEditingStatusId] = useState(null);
    const [editedStatusName, setEditedStatusName] = useState('');

    // Lọc các sprint đã bắt đầu và thuộc dự án hiện tại
    const startedSprintIds = sprints?.filter((sprint) => {
        sprint.started && String(sprint.project) === String(currentProject?._id);
    });

    const filteredIssues = issues?.filter((issue) => {
        const isInCurrentProject = String(issue.project) === String(currentProject?._id);

        const isInStartedSprint = startedSprintIds.some((s) => String(s._id) === String(issue.sprint));
        const hasStatusOnly = !issue.sprint && issue.status;

        const hasStatusInProject = statuses?.some(
            (status) =>
                String(status.project) === String(currentProject?._id) && String(status._id) === String(issue.status),
        );

        statuses?.forEach((status) => {
            console.log(
                'Checking status:',
                status._id,
                'project:',
                status.project,
                '==?',
                issue.project,
                'status ==?',
                issue.status,
                '->',
                String(status.project) === String(issue.project) && String(status._id) === String(issue.status),
            );
        });

        // console.log('hasStatusInProject', hasStatusInProject);
        // console.log('isInStartedSprint', isInStartedSprint);
        // console.log('hasStatusOnly', hasStatusOnly);
        // console.log('isInCurrentProject', isInCurrentProject);
        // console.log('issue', issue);
        // console.log('issue.sprint', issue.sprint);
        // console.log('issue.status', issue.status);
        // console.log('issue.project', issue.project);

        return isInCurrentProject && (isInStartedSprint || hasStatusOnly || hasStatusInProject);
    });

    const filteredStatuses = statuses?.filter((status) => String(status.project) === String(currentProject?._id));

    const issuesByStatus = filteredStatuses?.reduce((acc, status) => {
        acc[status._id] = filteredIssues.filter((issue) => String(issue.status) === String(status._id));
        return acc;
    }, {});

    useEffect(() => {
        dispatch(fetchAllIssue());
        dispatch(fetchAllSprint());
        dispatch(fetchStatuses());
    }, [dispatch]);

    const handleEditIssue = (issue) => {
        setEditingIssueId(issue._id);
        setEditedTitle(issue.title);
    };

    const handleCancelEditIssue = () => {
        setEditingIssueId(null);
        setEditedTitle('');
    };

    const handleSaveEdit = (issueId) => {
        dispatch(updateIssue({ issueId, updates: { title: editedTitle } }))
            .unwrap()
            .then(() => {
                dispatch(fetchAllIssue());
            })
            .catch((error) => {
                console.error('Lỗi khi cập nhật issue:', error);
            });
        setEditingIssueId(null);
    };

    const handleAddIssue = (statusId) => {
        console.log('statusId', statusId);
        if (!newIssue.title) return;
        dispatch(
            createIssue({
                title: newIssue.title,
                type: newIssue.type,
                project: currentProject._id,
                status: statusId,
            }),
        );
        setNewIssue({ title: '', type: 'Task' });
        setCreatingStatusMap((prev) => ({ ...prev, [statusId]: false }));
    };

    const handleDeleteIssue = (id) => {
        if (confirm('Bạn có chắc muốn xóa issue này?')) {
            dispatch(deleteIssue(id))
                .unwrap()
                .then(() => {
                    dispatch(fetchAllIssue());
                })
                .catch((error) => {
                    console.error('Lỗi khi xóa issue:', error);
                });
        }
    };

    const handleSubmitCreateStatus = () => {
        if (newStatusName.trim()) {
            console.log('newStatusName', newStatusName);

            dispatch(createStatus({ name: newStatusName.trim(), project: currentProject._id }));
            setNewStatusName('');
            setIsCreatingStatus(false);
        }
    };

    const handleSubmitEditStatus = (statusId) => {
        if (editedStatusName.trim()) {
            dispatch(updateStatus({ statusId, updatedData: { name: editedStatusName.trim() } }))
                .unwrap()
                .then(() => {
                    // ✅ Cập nhật xong thì reload backlog
                    dispatch(fetchStatuses());
                })
                .catch((error) => {
                    console.error('Lỗi khi bắt đầu sprint:', error);
                });
            setEditingStatusId(null);
        }
    };

    const handleDeleteStatus = (statusId) => {
        if (window.confirm('Bạn chắc chắn muốn xóa status này?')) {
            dispatch(deleteStatus(statusId));
        }
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const { draggableId, destination, source } = result;

        if (destination.droppableId !== source.droppableId) {
            dispatch(
                updateIssue({
                    issueId: draggableId,
                    updates: {
                        status: destination.droppableId,
                    },
                }),
            )
                .unwrap()
                .then(() => {
                    dispatch(fetchAllIssue()); // optional: reload lại để đảm bảo
                })
                .catch((error) => {
                    console.error('Lỗi khi cập nhật issue khi kéo thả:', error);
                });
        }
    };

    if (!statuses || !issues || !sprints || !currentProject) {
        return <div>Đang tải dữ liệu...</div>;
    }

    return (
        <div className="p-4">
            <div className="flex gap-4 overflow-auto">
                <DragDropContext onDragEnd={handleDragEnd}>
                    {filteredStatuses?.map((status) => (
                        <Droppable droppableId={status._id} key={status._id}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="w-72 flex-shrink-0 rounded bg-gray-100 p-4 shadow-md"
                                >
                                    <div className="mb-2 flex items-center justify-between">
                                        <h2 className="text-lg font-semibold">{status.name}</h2>
                                        <div className="text-sm text-gray-500">
                                            {issuesByStatus[status._id]?.length || 0}
                                        </div>
                                    </div>

                                    {editingStatusId === status._id ? (
                                        <div className="relative w-full">
                                            <input
                                                type="text"
                                                value={editedStatusName}
                                                onChange={(e) => setEditedStatusName(e.target.value)}
                                                className="w-full rounded border border-gray-300 px-2 py-1 pr-16"
                                                autoFocus
                                            />
                                            <div className="absolute top-1/2 right-2 z-50 flex -translate-y-1/2 gap-2">
                                                <button
                                                    onClick={() => handleSubmitEditStatus(status._id)}
                                                    className="text-green-600 hover:text-green-800"
                                                >
                                                    ✔️
                                                </button>
                                                <button
                                                    onClick={() => setEditingStatusId(null)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingStatusId(status._id);
                                                        setEditedStatusName(status.name); // hoặc item.name nếu là status
                                                    }}
                                                    className="text-gray-500 hover:text-blue-500"
                                                >
                                                    ✏
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStatus(status._id)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    🗑
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {(issuesByStatus[status._id] || []).map((item, index) => (
                                        <Draggable key={item._id} draggableId={item._id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="my-2 rounded bg-white p-2 shadow"
                                                >
                                                    {editingIssueId === item._id ? (
                                                        <div className="relative w-full">
                                                            <input
                                                                type="text"
                                                                value={editedTitle}
                                                                onChange={(e) => setEditedTitle(e.target.value)}
                                                                className="w-full rounded border border-gray-300 px-2 py-1 pr-16"
                                                                autoFocus
                                                            />
                                                            <div className="absolute top-1/2 right-2 z-50 flex -translate-y-1/2 gap-2">
                                                                <button
                                                                    onClick={() => handleSaveEdit(item._id)}
                                                                    className="text-green-600 hover:text-green-800"
                                                                >
                                                                    ✔️
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEditIssue}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    ❌
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-between">
                                                            <div className="flex gap-2">
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
                                                                <p>{`${currentProject?.key} - ${item.number} ${item.title}`}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEditIssue(item)}
                                                                    className="text-gray-500 hover:text-blue-500"
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteIssue(item._id)}
                                                                    className="text-gray-400 hover:text-red-500"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}

                                    {provided.placeholder}

                                    {creatingStatusMap[status._id] ? (
                                        <div className="my-2 rounded bg-white p-2 shadow">
                                            <input
                                                type="text"
                                                value={newIssue.title}
                                                onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                                                className="w-full rounded border p-1"
                                                placeholder="Issue title"
                                            />
                                            <select
                                                value={newIssue.type}
                                                onChange={(e) => setNewIssue({ ...newIssue, type: e.target.value })}
                                                className="mt-2 w-full rounded border p-1"
                                            >
                                                <option value="Task">Task</option>
                                                <option value="Bug">Bug</option>
                                                <option value="Story">Story</option>
                                            </select>
                                            <button
                                                onClick={() => handleAddIssue(status._id)}
                                                className="mt-2 w-full rounded bg-blue-500 p-1 text-white"
                                            >
                                                Add Issue
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setCreatingStatusMap((prev) => ({
                                                        ...prev,
                                                        [status._id]: false,
                                                    }))
                                                }
                                                className="mt-2 w-full rounded bg-gray-300 p-1"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                setCreatingStatusMap((prev) => ({
                                                    ...prev,
                                                    [status._id]: true,
                                                }))
                                            }
                                            className="mt-2 w-full rounded bg-gray-300 p-2"
                                        >
                                            + Create Issue
                                        </button>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </DragDropContext>

                <div className="my-4 space-y-2">
                    {isCreatingStatus ? (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newStatusName}
                                onChange={(e) => setNewStatusName(e.target.value)}
                                placeholder="Tên status..."
                                className="w-64 rounded border border-gray-300 px-3 py-2"
                            />
                            <button
                                onClick={handleSubmitCreateStatus}
                                className="rounded bg-green-600 px-3 text-white hover:bg-green-700"
                            >
                                ✔️
                            </button>
                            <button
                                onClick={() => setIsCreatingStatus(false)}
                                className="text-red-500 hover:text-red-700"
                            >
                                ❌
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCreatingStatus(true)}
                            className="h-10 min-w-[10rem] self-start rounded bg-green-500 text-white shadow hover:bg-green-600"
                        >
                            ➕ Thêm Status
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KanbanBoard;
