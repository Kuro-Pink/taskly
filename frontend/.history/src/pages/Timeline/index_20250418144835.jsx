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
        <div className="timeline-container">
            <div className="timeline-header">
                <h2>📆 Timeline View</h2>
                <div className="sprint-bar">
                    {sprints
                        .filter((s) => s.isStarted)
                        .map((s) => (
                            <div key={s._id} className="sprint-info">
                                <strong>{s.name}</strong>: {format(new Date(s.startDate), 'MMM d')} →{' '}
                                {format(new Date(s.endDate), 'MMM d')}
                            </div>
                        ))}
                </div>
            </div>

            {/* Gantt view */}
            <div className="gantt-view" ref={ganttRef} style={{ overflowX: 'auto' }}></div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="epic-list">
                    {epics?.map((epic) => renderEpic(epic))}

                    <Droppable droppableId="null">
                        {(provided) => (
                            <div
                                className="epic-card backlog-card"
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                <div className="epic-header">
                                    <h3>Backlog</h3>
                                </div>
                                <div className="epic-issues">
                                    {issues
                                        .filter((issue) => !issue.epic)
                                        .map((issue, index) => (
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

                    <div className="create-epic">
                        <input
                            placeholder="Tạo Epic mới..."
                            value={newEpicName}
                            onChange={(e) => setNewEpicName(e.target.value)}
                        />
                        <button onClick={handleCreateEpic}>Tạo</button>
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
};

export default Timeline;
