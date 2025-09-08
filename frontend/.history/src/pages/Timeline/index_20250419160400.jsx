import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSprint } from '../../redux/features/backlogSlice';
import { fetchAllEpics, updateEpic, deleteEpic, createEpic } from '../../redux/features/epicSlice';
import { updateIssue } from '../../redux/features/backlogSlice';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Gantt from 'frappe-gantt';

const Timeline = () => {
    const dispatch = useDispatch();
    const { issues, sprints } = useSelector((state) => state.backlog);
    const { epics } = useSelector((state) => state.epics);
    const currentProject = useSelector((state) => state.projects.currentProject);

    const [editingEpicId, setEditingEpicId] = useState(null);
    const [newEpicName, setNewEpicName] = useState('');
    const [epicNameDraft, setEpicNameDraft] = useState('');

    const ganttRef = useRef();

    useEffect(() => {
        dispatch(fetchAllSprint());
        dispatch(fetchAllEpics());
    }, [dispatch]);

    useEffect(() => {
        if (epics?.length && ganttRef.current) {
            const tasks = epics.map((epic) => ({
                id: epic._id,
                name: epic.name,
                start: format(new Date(epic.start || new Date()), 'yyyy-MM-dd'),
                end: format(new Date(epic.end || new Date()), 'yyyy-MM-dd'),
                progress: 100,
            }));

            const gantt = new Gantt(ganttRef.current, tasks, {
                view_mode: 'Day',
                date_format: 'YYYY-MM-DD',
                custom_popup_html: null,
            });
        }
    }, [epics]);

    const handleDragEnd = (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;

        const issueId = draggableId;
        const sourceEpicId = source.droppableId;
        const destEpicId = destination.droppableId;

        if (sourceEpicId === destEpicId) {
            dispatch(
                updateIssue({
                    issueId,
                    updates: { order: destination.index },
                }),
            );
        } else {
            dispatch(
                updateIssue({
                    issueId,
                    updates: {
                        epicId: destEpicId,
                        order: destination.index,
                    },
                }),
            );
        }
    };

    const handleCreateEpic = () => {
        if (!newEpicName.trim()) return;
        dispatch(createEpic({ name: newEpicName, projectId: currentProject._id }));
        setNewEpicName('');
    };

    const renderEpic = (epic) => {
        const epicIssues = issues.filter((issue) => issue.epic === epic._id);

        return (
            <Droppable droppableId={epic._id} key={epic._id}>
                {(provided) => (
                    <div className="epic-card" ref={provided.innerRef} {...provided.droppableProps}>
                        <div className="epic-header">
                            {editingEpicId === epic._id ? (
                                <input
                                    value={epicNameDraft}
                                    onChange={(e) => setEpicNameDraft(e.target.value)}
                                    onBlur={() => {
                                        dispatch(updateEpic({ epicId: epic._id, updates: { name: epicNameDraft } }));
                                        setEditingEpicId(null);
                                    }}
                                    autoFocus
                                />
                            ) : (
                                <h3>{epic.name}</h3>
                            )}
                            <div className="epic-actions">
                                <button
                                    onClick={() => {
                                        setEditingEpicId(epic._id);
                                        setEpicNameDraft(epic.name);
                                    }}
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => {
                                        dispatch(deleteEpic(epic._id));
                                        issues
                                            .filter((issue) => issue.epic === epic._id)
                                            .forEach((issue) => {
                                                dispatch(updateIssue({ issueId: issue._id, updates: { epic: null } }));
                                            });
                                    }}
                                >
                                    🗑️
                                </button>
                                <button onClick={() => alert('Hiện modal thêm issue trong Epic')}>➕</button>
                            </div>
                        </div>

                        <div className="epic-issues">
                            {epicIssues.map((issue, index) => (
                                <Draggable draggableId={issue._id} index={index} key={issue._id}>
                                    {(provided) => (
                                        <div
                                            className="issue-card"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            {issue.summary}
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    </div>
                )}
            </Droppable>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold text-gray-800">📆 Timeline View</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {sprints
                        .filter((s) => s.isStarted)
                        .map((s) => (
                            <div key={s._id} className="rounded bg-white px-3 py-1 shadow-sm">
                                <strong className="text-blue-600">{s.name}</strong>:{' '}
                                {format(new Date(s.startDate), 'MMM d')} → {format(new Date(s.endDate), 'MMM d')}
                            </div>
                        ))}
                </div>
            </div>

            {/* Gantt Chart */}
            <div ref={ganttRef} className="relative max-h-[400px] overflow-x-auto rounded-lg bg-white p-4 shadow-md">
                {/* Gantt Chart will render here */}
            </div>

            {/* Epic List + Backlog */}
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="mt-6 flex flex-col gap-6">
                    {epics?.map((epic) => renderEpic(epic))}

                    {/* Backlog */}
                    <Droppable droppableId="null">
                        {(provided) => (
                            <div
                                className="rounded-lg bg-white p-4 shadow-md"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <div className="mb-4 border-b pb-2">
                                    <h3 className="text-lg font-semibold text-gray-700">Backlog</h3>
                                </div>
                                <div className="space-y-2">
                                    {issues
                                        .filter((issue) => !issue.epic)
                                        .map((issue, index) => (
                                            <Draggable draggableId={issue._id} index={index} key={issue._id}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="rounded border-l-4 border-blue-500 bg-gray-100 p-2 text-sm text-gray-800"
                                                    >
                                                        {issue.summary}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>

                    {/* Nút tạo Epic / Form tạo Epic inline */}
                    {isCreatingEpic ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Tên Epic..."
                                value={newEpicName}
                                onChange={(e) => setNewEpicName(e.target.value)}
                                className="rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            />
                            <button
                                onClick={handleCreateEpic}
                                className="rounded bg-green-500 px-3 py-2 text-white hover:bg-green-600"
                                title="Tạo Epic"
                            >
                                ✅
                            </button>
                            <button
                                onClick={() => {
                                    setIsCreatingEpic(false);
                                    setNewEpicName('');
                                }}
                                className="rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600"
                                title="Hủy tạo"
                            >
                                ❌
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCreatingEpic(true)}
                            className="w-fit rounded-md bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
                        >
                            + Tạo Epic
                        </button>
                    )}
                </div>
            </DragDropContext>
        </div>
    );
};

export default Timeline;
