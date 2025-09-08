import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSprints } from '../../redux/features/sprintSlice';
import { fetchEpicsByProject, updateEpic, deleteEpic, createEpic } from '../../redux/features/epicSlice';
import { updateIssue } from '../../redux/features/backlogSlice';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const Timeline = () => {
    const dispatch = useDispatch();
    const { sprints } = useSelector((state) => state.backlog);
    const { epics } = useSelector((state) => state.epics);
    const { issues } = useSelector((state) => state.backlog);
    const [editingEpicId, setEditingEpicId] = useState(null);
    const [newEpicName, setNewEpicName] = useState('');
    const [epicNameDraft, setEpicNameDraft] = useState('');

    useEffect(() => {
        dispatch(fetchSprints());
        dispatch(fetchEpicsByProject());
    }, [dispatch]);

    const handleDragEnd = (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;

        const issueId = draggableId;
        const sourceEpicId = source.droppableId;
        const destEpicId = destination.droppableId;

        // Nếu reorder trong cùng một Epic (thay đổi thứ tự)
        if (sourceEpicId === destEpicId) {
            // Optional nếu bạn lưu `order` để sắp xếp
            dispatch(
                updateIssue({
                    issueId,
                    updates: { order: destination.index },
                }),
            );
        } else {
            // Kéo issue sang Epic khác → cần cập nhật epicId
            dispatch(
                updateIssue({
                    issueId,
                    updates: {
                        epicId: destEpicId,
                        order: destination.index, // nếu muốn sắp xếp trong Epic mới
                    },
                }),
            );
        }
    };

    const handleCreateEpic = () => {
        if (!newEpicName.trim()) return;
        dispatch(createEpic({ name: newEpicName }));
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

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="epic-list">
                    {epics.map((epic) => renderEpic(epic))}

                    {/* Vùng backlog - không epic */}
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

                    {/* Tạo epic */}
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
