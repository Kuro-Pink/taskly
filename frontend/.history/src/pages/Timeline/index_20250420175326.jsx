import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Plus, ChevronRight, ChevronDown, Pencil, Trash, Check, X, Loader2, Zap } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { fetchAllIssue, fetchAllSprint, updateIssue, createIssue } from '../../redux/features/backlogSlice';
import { fetchAllEpics, createEpic, deleteEpic, updateEpic } from '../../redux/features/epicSlice';
import { fetchProjectById } from '../../redux/features/projectSlice';

const DAY_WIDTH = 40;
const DATE_FORMAT = 'YYYY-MM-DD';

const Timeline = () => {
    const { key, id } = useParams(); // 🟢 Lấy giá trị từ URL
    const dispatch = useDispatch();
    const currentProject = useSelector((state) => state.projects.currentProject);
    const { issues, sprints } = useSelector((state) => state.backlog);
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

    const handleAddIssueToEpic = (epicId) => {
        if (!newIssue.title.trim()) return;
        dispatch(
            createIssue({
                title: newIssue.title,
                type: newIssue.type,
                project: currentProject._id,
                epic: epicId,
            }),
        );
        setNewIssue({ title: '', type: 'Task' });
        setAddingIssueEpicId(null);
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

    return (
        <div className="h-full w-full overflow-x-auto rounded-lg border bg-white shadow">
            <div className="grid grid-cols-[300px_1fr]">
                {/* Left Side: Epic & Issue List */}
                <div className="border-r bg-gray-50">
                    <div className="border-b bg-white p-2 font-semibold">Epics</div>
                    {epics
                        .filter((epic) => epic.projectId === currentProject._id)
                        ?.map((epic) => (
                            <div key={epic._id} className="border-b bg-white">
                                <div
                                    className="flex cursor-pointer items-center justify-between px-2 py-1 hover:bg-gray-100"
                                    onClick={() => toggleEpic(epic._id)}
                                >
                                    <div className="flex items-center gap-2">
                                        {expandedEpicIds.includes(epic._id) ? (
                                            <ChevronDown size={16} />
                                        ) : (
                                            <ChevronRight size={16} />
                                        )}
                                        {editingEpicId === epic._id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    className="rounded border border-gray-300 px-2 py-1 text-sm"
                                                    placeholder="Tên Epic..."
                                                    value={epicNameDraft}
                                                    onChange={(e) => setEpicNameDraft(e.target.value)}
                                                    onKeyDown={async (e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            if (epicNameDraft.trim()) {
                                                                setUpdatingEpicId(epic._id);
                                                                await dispatch(
                                                                    updateEpic({
                                                                        id: epic._id,
                                                                        updates: { name: epicNameDraft },
                                                                    }),
                                                                );
                                                                setUpdatingEpicId(null);
                                                                setEditingEpicId(null);
                                                            }
                                                        }
                                                    }}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={async () => {
                                                        if (epicNameDraft.trim()) {
                                                            setUpdatingEpicId(epic._id);
                                                            await dispatch(
                                                                updateEpic({
                                                                    id: epic._id,
                                                                    updates: { name: epicNameDraft },
                                                                }),
                                                            );
                                                            setUpdatingEpicId(null);
                                                            setEditingEpicId(null);
                                                        }
                                                    }}
                                                    className="rounded bg-green-500 px-3 py-2 text-white hover:bg-green-600"
                                                    title="Lưu"
                                                >
                                                    {updatingEpicId === epic._id ? (
                                                        <Loader2 className="animate-spin" size={16} />
                                                    ) : (
                                                        <Check size={16} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingEpicId(null);
                                                        setEpicNameDraft('');
                                                    }}
                                                    className="rounded bg-gray-300 px-3 py-2 hover:bg-gray-400"
                                                    title="Hủy"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <h3 className="inline-flex items-center font-semibold text-gray-700">
                                                    <Zap size={18} className="mr-2 text-yellow-500" />
                                                    {currentProject?.key || key} - {epic.name}
                                                </h3>
                                                {updatingEpicId === epic._id && (
                                                    <span className="text-xs text-gray-400 italic">
                                                        (Đang cập nhật...)
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {editingEpicId !== epic._id && (
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            {confirmDeleteEpicId === epic._id ? (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            dispatch(deleteEpic(epic._id));
                                                            epicIssues.forEach((issue) => {
                                                                dispatch(
                                                                    updateIssue({
                                                                        issueId: issue._id,
                                                                        updates: { epic: null },
                                                                    }),
                                                                );
                                                            });
                                                            setConfirmDeleteEpicId(null);
                                                        }}
                                                        title="Xác nhận xóa"
                                                        className="hover:text-green-500"
                                                    >
                                                        <Check className="text-green-500" size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteEpicId(null)}
                                                        title="Hủy"
                                                        className="text-red-500 hover:text-gray-500"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    {addingIssueEpicId === epic._id ? (
                                                        <ChevronDown className="text-blue-500" size={16} />
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                setAddingIssueEpicId(epic._id);
                                                                setExpandedEpicIds((prev) => [
                                                                    ...new Set([...prev, epic._id]),
                                                                ]); // Đảm bảo Epic được mở
                                                            }}
                                                            title="Thêm issue"
                                                            className="hover:opacity-50"
                                                        >
                                                            <Plus className="text-blue-500" size={16} />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            setEditingEpicId(epic._id);
                                                            setEpicNameDraft(epic.name);
                                                        }}
                                                        title="Sửa tên Epic"
                                                        className="hover:opacity-50"
                                                    >
                                                        <Pencil className="text-yellow-500" size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDeleteEpicId(epic._id)}
                                                        title="Xóa Epic"
                                                        className="hover:opacity-50"
                                                    >
                                                        <Trash className="text-red-500" size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {epic && addingIssueEpicId === epic._id && (
                                    <div className="mt-2 mr-4 ml-6 flex items-center gap-2 rounded-md bg-white p-2 shadow">
                                        <select
                                            value={newIssue.type}
                                            onChange={(e) => setNewIssue({ ...newIssue, type: e.target.value })}
                                            className={`w-1/4 rounded-md border p-1 text-sm font-semibold ${
                                                newIssue.type === 'Task'
                                                    ? 'text-green-600'
                                                    : newIssue.type === 'Bug'
                                                      ? 'text-red-600'
                                                      : 'text-blue-600'
                                            }`}
                                        >
                                            <option value="Task">Task</option>
                                            <option value="Bug">Bug</option>
                                            <option value="Story">Story</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={newIssue.title}
                                            onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                                            className="w-full flex-1 rounded-md border p-1 text-sm"
                                            placeholder="Nhập tiêu đề issue..."
                                        />
                                        <button
                                            onClick={() => handleAddIssueToEpic(epic._id)}
                                            className="rounded-md bg-green-500 p-1 text-white hover:bg-green-600"
                                            title="Thêm Issue"
                                        >
                                            ✅
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAddingIssueEpicId(null);
                                                setNewIssue({ title: '', type: 'Task' });
                                            }}
                                            className="rounded-md bg-gray-300 p-1 hover:bg-gray-400"
                                            title="Hủy"
                                        >
                                            ❌
                                        </button>
                                    </div>
                                )}

                                {expandedEpicIds.includes(epic._id) && (
                                    <div className="pb-2 pl-6">
                                        {issues
                                            .filter((issue) => {
                                                return String(issue.epic) === String(epic._id);
                                            })
                                            ?.map((issue) => {
                                                return (
                                                    <div
                                                        key={issue._id}
                                                        className="flex justify-between px-1 py-1 text-sm"
                                                    >
                                                        <div className="text-green-700">
                                                            {issue.key} - {issue.title}
                                                        </div>
                                                        <div className="rounded bg-gray-200 px-2 py-0.5 text-xs">
                                                            {issue.status}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        ))}

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

                {/* Right Side: Gantt Chart */}
                <div className="relative">
                    {/* Date Header */}
                    <div className="sticky top-0 z-10 flex border-b bg-white">
                        {dateRange?.map((date) => (
                            <div
                                key={date.format(DATE_FORMAT)}
                                className={`w-[${DAY_WIDTH}px] border-r px-2 py-1 text-center text-xs ${
                                    date.isSame(moment(), 'day') ? 'font-semibold text-blue-500' : 'text-gray-500'
                                }`}
                            >
                                {date.date()}
                            </div>
                        ))}
                    </div>

                    {/* Gantt Bars */}
                    <div className="relative bg-white" style={{ height: sprints.length * 50 + 'px' }}>
                        {sprints
                            .filter((sprint) => sprint.started && sprint.project === currentProject._id)
                            ?.map((sprint, index) => (
                                <div
                                    key={sprint._id}
                                    className="absolute"
                                    style={{
                                        top: `${index * 50 + 15}px`,
                                        ...getEpicBarStyle(sprint),
                                    }}
                                >
                                    <span className="ml-1 text-xs text-white">{sprint.key}</span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
