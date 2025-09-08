import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { Plus, ChevronRight, ChevronDown, Pencil, Trash, Check, X, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
const DAY_WIDTH = 40;
const DATE_FORMAT = 'YYYY-MM-DD';

const Timeline = () => {
    const dispatch = useDispatch();
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

    // useEffect(() => {
    //     dispatch(fetchAllIssue());
    //     dispatch(fetchAllSprint());
    // }, [dispatch]);

    useEffect(() => {
        if (sprints.length > 0) {
            const startDates = sprints.map((s) => moment(s.startDate));
            const endDates = sprints.map((s) => moment(s.endDate));
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
                    {epics.map((epic) => (
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
                                        <input
                                            className="rounded border border-gray-300 px-2 py-1 text-sm"
                                            value={epicNameDraft}
                                            onChange={(e) => setEpicNameDraft(e.target.value)}
                                            onBlur={() => {
                                                if (epicNameDraft.trim() && epicNameDraft !== epic.name) {
                                                    setUpdatingEpicId(epic._id);
                                                    dispatch(
                                                        updateEpic({
                                                            epicId: epic._id,
                                                            updates: { name: epicNameDraft },
                                                        }),
                                                    ).then(() => setUpdatingEpicId(null));
                                                }
                                                setEditingEpicId(null);
                                            }}
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-700">{epic.name}</h3>
                                            {updatingEpicId === epic._id && (
                                                <span className="text-xs text-gray-400 italic">(Đang cập nhật...)</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAddIssueToEpic(epic._id)}
                                        title="Thêm issue"
                                        className="hover:text-blue-500"
                                    >
                                        <Plus size={16} />
                                    </button>

                                    <button
                                        onClick={() => {
                                            setEditingEpicId(epic._id);
                                            setEpicNameDraft(epic.name);
                                        }}
                                        title="Sửa tên Epic"
                                        className="hover:text-yellow-500"
                                    >
                                        <Pencil size={16} />
                                    </button>

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
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() => setConfirmDeleteEpicId(null)}
                                                title="Hủy"
                                                className="hover:text-gray-500"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmDeleteEpicId(epic._id)}
                                            title="Xóa Epic"
                                            className="hover:text-red-500"
                                        >
                                            <Trash size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {expandedEpicIds.includes(epic._id) && (
                                <div className="pb-2 pl-6">
                                    {issues
                                        .filter((issue) => issue.epicId === epic._id)
                                        .map((issue) => (
                                            <div key={issue._id} className="flex justify-between px-1 py-1 text-sm">
                                                <div className="text-green-700">
                                                    {issue.key} {issue.title}
                                                </div>
                                                <div className="rounded bg-gray-200 px-2 py-0.5 text-xs">
                                                    {issue.status}
                                                </div>
                                            </div>
                                        ))}
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
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateEpic()}
                                    autoFocus
                                />
                                <button
                                    onClick={handleCreateEpic}
                                    className="rounded bg-green-500 px-3 py-2 text-white hover:bg-green-600"
                                    title="Tạo Epic"
                                    disabled={isCreatingLoading}
                                >
                                    {isCreatingLoading ? '⏳' : '✅'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsCreatingEpic(false);
                                        setNewEpicName('');
                                    }}
                                    className="rounded bg-gray-300 px-3 py-2 hover:bg-gray-400"
                                    title="Hủy"
                                >
                                    ❌
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCreatingEpic(true)}
                                className="mt-2 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
                            >
                                ➕ Tạo Epic
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Side: Gantt Chart */}
                <div className="relative">
                    {/* Date Header */}
                    <div className="sticky top-0 z-10 flex border-b bg-white">
                        {dateRange.map((date) => (
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
                    <div className="relative bg-white" style={{ height: epics.length * 50 + 'px' }}>
                        {epics.map((epic, index) => (
                            <div
                                key={epic._id}
                                className="absolute"
                                style={{
                                    top: `${index * 50 + 15}px`,
                                    ...getEpicBarStyle(epic),
                                }}
                            >
                                <span className="ml-1 text-xs text-white">{epic.key}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
