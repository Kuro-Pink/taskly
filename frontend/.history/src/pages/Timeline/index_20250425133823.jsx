import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Plus, ChevronRight, ChevronDown, Pencil, Trash, Check, X, Loader2, Zap } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { fetchAllIssue, fetchAllSprint, updateIssue, createIssue } from '../../redux/features/backlogSlice';
import { fetchAllEpics, createEpic, deleteEpic, updateEpic } from '../../redux/features/epicSlice';
import { fetchProjectById } from '../../redux/features/projectSlice';
import { fetchStatuses } from '../../redux/features/statusSlice';

const DAY_WIDTH = 40;
const DATE_FORMAT = 'YYYY-MM-DD';

const Timeline = () => {
    const { key, id } = useParams(); // 🟢 Lấy giá trị từ URL
    const dispatch = useDispatch();
    const currentProject = useSelector((state) => state.projects.currentProject);
    const { issues, sprints } = useSelector((state) => state.backlog);
    const { statuses } = useSelector((state) => state.statuses);
    const { epics } = useSelector((state) => state.epics);

    const [expandedEpicIds, setExpandedEpicIds] = useState([]);
    const [dateRange, setDateRange] = useState([]);

    const [isCreatingEpic, setIsCreatingEpic] = useState(false);
    const [newEpicName, setNewEpicName] = useState('');
    const [isCreatingLoading, setIsCreatingLoading] = useState(false);
    const [editingEpicId, setEditingEpicId] = useState(null);
    const [epicNameDraft, setEpicNameDraft] = useState('');
    const [updatingEpicId, setUpdatingEpicId] = useState(null);
    const [confirmDeleteEpicId, setConfirmDeleteEpicId] = useState(null);

    const [addingIssueEpicId, setAddingIssueEpicId] = useState(null);
    const [newIssueTitle, setNewIssueTitle] = useState('');
    const [newIssue, setNewIssue] = useState({ title: '', type: 'Task' });

    useEffect(() => {
        if (id) {
            dispatch(fetchProjectById(id)); // ✅ Lấy thông tin dự án
        }
    }, [id, dispatch]);

    useEffect(() => {
        dispatch(fetchAllIssue());
        dispatch(fetchAllSprint());
        dispatch(fetchAllEpics());
        dispatch(fetchStatuses());
    }, [dispatch]);

    useEffect(() => {
        if (sprints.length > 0) {
            const startDates = sprints?.map((s) => moment(s.startDate));
            const endDates = sprints?.map((s) => moment(s.endDate));
            const minDate = moment.min(startDates);
            const maxDate = moment.max(endDates);
            const range = [];
            let current = moment(minDate);
            while (current <= maxDate) {
                range.push(current.clone());
                current.add(1, 'days');
            }
            setDateRange(range);
        }
    }, [sprints]);

    const toDoStatus = statuses.find((s) => s.name === 'Phải làm' && s.project === currentProject?._id);

    const toggleEpic = (epicId) => {
        setExpandedEpicIds((prev) => (prev.includes(epicId) ? prev.filter((id) => id !== epicId) : [...prev, epicId]));
    };

    const handleCreateEpic = async () => {
        if (!newEpicName.trim()) return;
        setIsCreatingLoading(true);
        await dispatch(createEpic({ name: newEpicName, projectId: currentProject._id }));
        setIsCreatingLoading(false);
        setNewEpicName('');
        setIsCreatingEpic(false);
    };

    // Hàm xử lý bật chế độ sửa
    const handleUpdateEpic = (epic) => {
        setEditingEpicId(epic._id);
        setEpicNameDraft(epic.name);
    };

    // Hàm xử lý lưu tên Epic
    const handleSaveEpicName = async (epicId) => {
        if (!epicNameDraft.trim()) {
            alert('Tên Epic không thể để trống!');
            return;
        }

        try {
            setUpdatingEpicId(epicId);
            await dispatch(updateEpic({ epicId, updates: { name: epicNameDraft } }));
        } finally {
            setUpdatingEpicId(null);
            setEditingEpicId(null);
        }
    };

    // Hàm xử lý xóa Epic
    const handleDeleteEpic = (epic) => {
        dispatch(deleteEpic(epic._id));
        setConfirmDeleteEpicId(null); // Đóng xác nhận xóa
    };

    const handleAddIssueToEpic = (epicId) => {
        if (!newIssue.title.trim()) return;
        dispatch(
            createIssue({
                title: newIssue.title,
                type: newIssue.type,
                project: currentProject._id,
                status: toDoStatus,
                epic: epicId,
            }),
        );
        setNewIssue({ title: '', type: 'Task' });
        setAddingIssueEpicId(null);
    };

    // Thêm hàm này trong component
    const handleDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;

        // Nếu thả lại đúng chỗ cũ thì không làm gì
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        try {
            // Gọi API để update issue
            await updateIssueEpic(draggableId, destination.droppableId);

            // TODO: Dispatch Redux hoặc setState local để cập nhật UI ngay lập tức
            // Ví dụ:
            // dispatch(updateIssueEpicSuccess(draggableId, destination.droppableId));
        } catch (error) {
            console.error('Update issue epic failed', error);
        }
    };

    // Hàm gọi API để update Epic của Issue
    const updateIssueEpic = async (issueId, newEpicId) => {
        await api.patch(`/issues/${issueId}`, {
            epic: newEpicId,
        });
    };

    const getEpicBarStyle = (epic) => {
        const startIndex = dateRange.findIndex((d) => d.isSame(moment(epic.startDate), 'day'));
        const duration = moment(epic.endDate).diff(moment(epic.startDate), 'days') + 1;
        return {
            left: `${startIndex * DAY_WIDTH}px`,
            width: `${duration * DAY_WIDTH}px`,
            backgroundColor: '#d1a8f5',
            height: '20px',
            borderRadius: '4px',
            position: 'absolute',
        };
    };

    if (!currentProject || !currentProject._id) {
        return null;
    }

    return (
        <div className="h-full w-full overflow-x-auto rounded-lg border bg-white shadow">
            <div className="grid grid-cols-[300px_1fr]">
                {/* Left Side: Epic & Issue List */}
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="border-r bg-gray-50">
                        <div className="border-b bg-white p-2 font-semibold">Sprint</div>
                        {epics
                            .filter((epic) => epic.projectId === currentProject._id)
                            ?.map((epic) => (
                                <Droppable key={epic._id} droppableId={epic._id}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className="border-b bg-white"
                                        >
                                            {/* Epic Header */}
                                            <div
                                                className="flex cursor-pointer items-center justify-between px-2 py-1 hover:bg-gray-100"
                                                onClick={() => toggleEpic(epic._id)}
                                            >
                                                {/* ... Giữ nguyên phần toggle Epic, sửa tên, xóa Epic, thêm Issue như bạn đã có ... */}
                                            </div>

                                            {/* Nếu đang thêm issue mới */}
                                            {epic && addingIssueEpicId === epic._id && (
                                                <div className="mt-2 mr-4 ml-6 flex items-center gap-2 rounded-md bg-white p-2 shadow">
                                                    {/* ... Giữ nguyên phần input thêm Issue như cũ ... */}
                                                </div>
                                            )}

                                            {/* List các Issue trong Epic */}
                                            {expandedEpicIds.includes(epic._id) && (
                                                <div className="pb-2 pl-6">
                                                    {issues
                                                        .filter((issue) => String(issue.epic) === String(epic._id))
                                                        .map((issue, index) => {
                                                            const getTypeColor = (type) => {
                                                                switch (type) {
                                                                    case 'Task':
                                                                        return 'text-green-500';
                                                                    case 'Bug':
                                                                        return 'text-red-500';
                                                                    case 'Story':
                                                                        return 'text-blue-500';
                                                                    default:
                                                                        return 'text-gray-500';
                                                                }
                                                            };
                                                            const statusObj = statuses.find(
                                                                (s) => String(s._id) === String(issue.status),
                                                            );

                                                            return (
                                                                <Draggable
                                                                    key={issue._id}
                                                                    draggableId={issue._id}
                                                                    index={index}
                                                                >
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className={`flex items-center justify-between border-b px-2 py-1 text-xl ${
                                                                                snapshot.isDragging ? 'bg-gray-100' : ''
                                                                            }`}
                                                                        >
                                                                            <div className="flex flex-col">
                                                                                <span
                                                                                    className={`font-bold ${getTypeColor(issue.type)}`}
                                                                                >
                                                                                    {issue.type}
                                                                                </span>
                                                                                <p>{`${currentProject.key || key} - ${issue.title}`}</p>
                                                                            </div>
                                                                            <div
                                                                                className={`rounded px-2 py-0.5 text-sm text-white ${
                                                                                    statusObj?.name === 'Phải làm'
                                                                                        ? 'bg-gray-500'
                                                                                        : statusObj?.name === 'Đang làm'
                                                                                          ? 'bg-blue-400'
                                                                                          : statusObj?.name ===
                                                                                              'Hoàn thành'
                                                                                            ? 'bg-green-400'
                                                                                            : 'bg-gray-400 text-gray-700'
                                                                                }`}
                                                                            >
                                                                                {statusObj?.name || 'No Status'}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            );
                                                        })}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            ))}

                        {/* Phần tạo Epic mới (không cần sửa) */}
                        <div className="mt-4 px-2">
                            {isCreatingEpic ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        className="rounded border border-gray-300 px-2 py-1 text-sm"
                                        placeholder="Tên Epic..."
                                        value={newEpicName}
                                        onChange={(e) => setNewEpicName(e.target.value)}
                                        onKeyDown={async (e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                await handleCreateEpic();
                                            }
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleCreateEpic}
                                        className="rounded bg-green-500 px-3 py-2 text-white hover:bg-green-600"
                                        title="Tạo Epic"
                                        disabled={isCreatingLoading}
                                    >
                                        {isCreatingLoading ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <Check size={16} />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsCreatingEpic(false);
                                            setNewEpicName('');
                                        }}
                                        className="rounded bg-gray-300 px-3 py-2 hover:bg-gray-400"
                                        title="Hủy"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsCreatingEpic(true)}
                                    className="mt-2 flex items-center gap-1 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
                                >
                                    <Plus size={16} /> Tạo Epic
                                </button>
                            )}
                        </div>
                    </div>
                </DragDropContext>
                {/* Right Side: Gantt Chart */}
                <div className="relative">
                    {/* Gantt Chart Container */}
                    <div className="relative">
                        {/* Date Header */}
                        <div className="sticky top-0 z-10 bg-white">
                            {/* 1. Date Row */}
                            <div className="flex border-b">
                                {dateRange.map((date) => (
                                    <div
                                        key={date.format(DATE_FORMAT)}
                                        className={`w-[${DAY_WIDTH}px] border-r px-2 py-1 text-center text-sm ${
                                            date.isSame(moment(), 'day')
                                                ? 'bg-blue-600 font-semibold text-white'
                                                : 'text-gray-600'
                                        }`}
                                    >
                                        {date.date()}
                                    </div>
                                ))}
                            </div>

                            {/* 2. Sprint Inline Row */}
                            <div className="flex border-b px-2 py-1 text-xl whitespace-nowrap text-gray-700">
                                <span className="mr-2 font-semibold">Started Sprints:</span>
                                <span className="text-purple-600">
                                    {sprints
                                        .filter((sprint) => sprint.started && sprint.project === currentProject._id)
                                        .map((s) => s.name || s.key)
                                        .join(', ')}
                                </span>
                            </div>
                        </div>

                        {/* Gantt Bars per Epic Row */}
                        <div className="relative bg-white" style={{ height: epics.length * 50 + 'px' }}>
                            {epics.map((epic, epicIndex) => {
                                return sprints
                                    .filter((sprint) => sprint.started && sprint.project === currentProject._id)
                                    .map((sprint) => {
                                        const hasIssueInEpicAndSprint = issues.some(
                                            (issue) =>
                                                String(issue.epic) === String(epic._id) &&
                                                String(issue.sprint) === String(sprint._id),
                                        );

                                        if (!hasIssueInEpicAndSprint) return null;

                                        return (
                                            <div
                                                key={`${sprint._id}-${epic._id}`}
                                                className="absolute rounded bg-purple-400 opacity-90"
                                                style={{
                                                    top: `${epicIndex * 50 + 15}px`,
                                                    ...getEpicBarStyle(sprint),
                                                }}
                                            >
                                                <span className="ml-1 text-xs text-white">{sprint.key}</span>
                                            </div>
                                        );
                                    });
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
