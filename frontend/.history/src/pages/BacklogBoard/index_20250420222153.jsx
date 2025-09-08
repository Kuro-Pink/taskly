import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllIssue,
    fetchIssueById,
    fetchAllSprint,
    fetchSprintById,
    createIssue,
    updateIssue,
    deleteIssue,
    createSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    moveIssueToSprint,
    moveIssueToBacklog,
} from '../../redux/features/backlogSlice';
import { useParams, useNavigate } from 'react-router-dom';

import CreateIssueBox from '../../components/IssueBox/CreateIssueBox';
import IssueDetailsModal from '../../components/Backlog/IssueDetailsModal';
import IssueItem from '../../components/Backlog/IssueItem';

import { fetchProjectById } from '../../redux/features/projectSlice';

const BacklogBoard = () => {
    const { key, id } = useParams(); // 🟢 Lấy giá trị từ URL
    const currentProject = useSelector((state) => state.projects.currentProject);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { issues, sprints, loading, error } = useSelector((state) => state.backlog);
    const [newIssue, setNewIssue] = useState({ title: '', type: 'Task' });
    const [activeSprint, setActiveSprint] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null);
    const [isCreatingIssue, setIsCreatingIssue] = useState(false);
    // ✅ Lấy ID từ Redux store

    const [editingIssueId, setEditingIssueId] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');

    const [editingSprint, setEditingSprint] = useState(null);
    const [editSprintData, setEditSprintData] = useState({ name: '', startDate: '', endDate: '' });

    const [isStartingSprint, setIsStartingSprint] = useState(false);

    const [creatingAt, setCreatingAt] = useState(null); // 'backlog' | sprintId | null

    const [selectedIssueId, setSelectedIssueId] = useState(null);
    const selectedIssue = issues.find((issue) => issue._id === selectedIssueId);

    useEffect(() => {
        if (id) {
            dispatch(fetchProjectById(id)); // ✅ Lấy thông tin dự án
        }
    }, [id, dispatch]);

    useEffect(() => {
        dispatch(fetchAllIssue());
        dispatch(fetchAllSprint());
    }, [dispatch]);

    const handleEditSprint = (sprint, mode = 'edit') => {
        if (!sprint) return;

        setEditingSprint(sprint);
        setIsStartingSprint(mode === 'start');

        setEditSprintData({
            name: sprint.name || '',
            startDate: sprint.startDate?.slice(0, 10) || '',
            endDate: sprint.endDate?.slice(0, 10) || '',
        });
    };

    const handleSaveSprint = () => {
        if (!editingSprint) return;

        const updates = {
            ...editSprintData,
            ...(isStartingSprint && { status: 'active' }), // giả sử status = active là sprint đã bắt đầu
        };

        dispatch(
            updateSprint({
                sprintId: editingSprint._id,
                updates,
            }),
        )
            .unwrap()
            .then(() => {
                dispatch(fetchAllSprint());
            })
            .catch((error) => {
                console.error('Lỗi khi cập nhật sprint:', error);
            });

        setEditingSprint(null);
        setIsStartingSprint(false);
    };

    const handleCancelEdit = () => {
        setEditingSprint(null);
    };

    const getNextSprintNumber = () => {
        const existingNumbers = sprints
            .filter((s) => String(s.project) === String(currentProject._id)) // Lọc theo project hiện tại
            .map((s) => parseInt(s.name?.replace('Sprint ', '')))
            .filter((n) => !isNaN(n));

        const max = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
        return max + 1;
    };

    const handleCreateSprint = () => {
        const nextNumber = getNextSprintNumber();
        dispatch(createSprint({ name: `Sprint ${nextNumber}`, project: currentProject._id }));
    };

    const handleDeleteSprint = async (sprintId) => {
        await dispatch(deleteSprint(sprintId))
            .unwrap()
            .then(() => {
                // ✅ Cập nhật xong thì reload backlog
                dispatch(fetchAllIssue());
            })
            .catch((error) => {
                console.error('Lỗi khi cập nhật sprint:', error);
            });
        dispatch(fetchAllSprint()); // Fetch lại danh sách sprint ngay sau khi xóa
    };

    const handleStartSprint = (sprint) => {
        if (!sprint) return;

        dispatch(startSprint(sprint._id))
            .unwrap()
            .then(() => {
                // ✅ Cập nhật xong thì reload backlog
                dispatch(fetchAllSprint());
                navigate(`/projects/${currentProject.key || key}/boards/${sprint.project}`); // hoặc tùy đường dẫn trang Board của bạn
            })
            .catch((error) => {
                console.error('Lỗi khi bắt đầu sprint:', error);
            });
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        const sourceId = source.droppableId;
        const destId = destination.droppableId;

        if (sourceId === 'backlog' && destId !== 'backlog') {
            // 🟢 Kéo từ backlog vào sprint
            dispatch(moveIssueToSprint({ issueId: draggableId, sprintId: destId }))
                .unwrap()
                .then(() => {
                    // ✅ Cập nhật xong thì reload backlog
                    dispatch(fetchAllIssue());
                })
                .catch((error) => {
                    console.error('Lỗi khi cập nhật sprint:', error);
                });
        } else if (sourceId !== 'backlog' && destId === 'backlog') {
            // 🔴 Kéo từ sprint về backlog
            dispatch(moveIssueToBacklog({ issueId: draggableId }))
                .unwrap()
                .then(() => {
                    // ✅ Cập nhật xong thì reload backlog
                    dispatch(fetchAllIssue());
                })
                .catch((error) => {
                    console.error('Lỗi khi cập nhật sprint:', error);
                });
        } else if (sourceId !== destId) {
            // 🔄 Kéo từ sprint này sang sprint khác
            dispatch(moveIssueToSprint({ issueId: draggableId, sprintId: destId }))
                .unwrap()
                .then(() => {
                    // ✅ Cập nhật xong thì reload backlog
                    dispatch(fetchAllIssue());
                })
                .catch((error) => {
                    console.error('Lỗi khi cập nhật sprint:', error);
                });
        }
    };

    if (!currentProject || !currentProject._id) {
        return null;
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col gap-4 p-4">
                {sprints
                    .filter((sprint) => {
                        if (!sprint) return false;
                        return (
                            String(sprint.project) === String(currentProject._id) &&
                            String(sprint.started) === String(false)
                        );
                    })
                    .map((sprint) => (
                        <div key={sprint._id} className="rounded-md bg-gray-200 p-4">
                            <div className="flex items-center justify-between border-b p-2">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-bold">{`${currentProject.key || key} ${sprint?.name}`}</h2>
                                    <span className="text-sm text-gray-500">
                                        {new Date(sprint?.startDate).toLocaleDateString()} -{' '}
                                        {new Date(sprint?.endDate).toLocaleDateString()}
                                    </span>
                                    <span className="rounded-md bg-blue-200 px-2 py-1 text-sm">
                                        {issues?.filter((issue) => String(issue.sprint) === String(sprint._id))
                                            .length || 0}{' '}
                                        issues
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="rounded-md bg-blue-500 px-3 py-1 text-white"
                                        onClick={() => {
                                            handleEditSprint(sprint, 'start');
                                            setMenuOpen(null);
                                        }}
                                    >
                                        Start sprint
                                    </button>
                                    <button
                                        className="rounded-md bg-gray-300 px-3 py-1"
                                        onClick={() => setMenuOpen(menuOpen === sprint._id ? null : sprint._id)}
                                    >
                                        ...
                                    </button>
                                    {menuOpen === sprint._id && (
                                        <ul className="absolute right-auto mt-12 w-56 rounded-md bg-white shadow-lg">
                                            <li
                                                className="cursor-pointer p-2 hover:bg-gray-100"
                                                onClick={() => {
                                                    handleEditSprint(sprint);
                                                    setMenuOpen(null); // Đóng menu sau khi chọn
                                                }}
                                            >
                                                Edit Sprint
                                            </li>

                                            <li
                                                className="cursor-pointer p-2 text-red-500 hover:bg-gray-100"
                                                onClick={() => {
                                                    handleDeleteSprint(sprint._id);
                                                    setMenuOpen(null); // Đóng menu sau khi chọn
                                                }}
                                            >
                                                Delete Sprint
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <Droppable droppableId={sprint._id}>
                                {(provided) => (
                                    <ul ref={provided.innerRef} {...provided.droppableProps}>
                                        {issues
                                            .filter((item) => {
                                                if (!item.sprint) return false;
                                                return (
                                                    String(item.sprint) === String(sprint._id) &&
                                                    String(item.project) === String(currentProject._id)
                                                );
                                            })
                                            .map((item, index) => (
                                                <Draggable key={item._id} draggableId={item._id} index={index}>
                                                    {(provided) => (
                                                        <li
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="my-2 flex items-center justify-between rounded-md bg-white p-2 shadow"
                                                            onClick={(e) => {
                                                                if (e.target === e.currentTarget) {
                                                                    setSelectedIssue(item);
                                                                }
                                                            }}
                                                        >
                                                            <IssueItem
                                                                key={item._id}
                                                                item={item}
                                                                projectKey={currentProject?.key}
                                                            />
                                                        </li>
                                                    )}
                                                </Draggable>
                                            ))}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                            <CreateIssueBox sprintId={sprint._id} />
                        </div>
                    ))}
                <div className="flex items-start gap-4">
                    <div className="w-full rounded-md bg-gray-200 p-4">
                        <h2 className="text-lg font-bold">Backlog</h2>
                        <Droppable droppableId="backlog">
                            {(provided) => (
                                <ul ref={provided.innerRef} {...provided.droppableProps}>
                                    {issues
                                        ?.filter((item) => {
                                            return (
                                                !item.sprint &&
                                                String(item.project) === String(currentProject._id) &&
                                                !item.status
                                            );
                                        })

                                        .map((item, index) => (
                                            <Draggable key={item._id} draggableId={item._id} index={index}>
                                                {(provided) => (
                                                    <li
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="my-2 flex items-center justify-between rounded-md bg-white p-2 shadow"
                                                        onClick={(e) => {
                                                            if (e.target === e.currentTarget) {
                                                                setSelectedIssue(item);
                                                            }
                                                        }}
                                                    >
                                                        <IssueItem
                                                            key={item._id}
                                                            item={item}
                                                            projectKey={currentProject?.key}
                                                        />
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))}

                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                        <CreateIssueBox />
                        <button onClick={handleCreateSprint} className="rounded-md bg-blue-500 p-2 text-white">
                            + Create Sprint
                        </button>
                    </div>
                </div>
            </div>
            {editingSprint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Overlay mờ */}
                    <div className="absolute inset-0 bg-black opacity-50"></div>

                    {/* Form edit sprint */}
                    <div className="relative z-10 w-auto rounded-md bg-white p-6 p-12 shadow-lg">
                        <h2 className="mb-4 text-lg font-bold">Edit Sprint</h2>
                        <input
                            type="text"
                            className="w-full rounded border p-2"
                            value={editSprintData.name}
                            onChange={(e) => setEditSprintData({ ...editSprintData, name: e.target.value })}
                        />
                        <input
                            type="date"
                            className="mt-2 w-full rounded border p-2"
                            value={editSprintData.startDate}
                            onChange={(e) => setEditSprintData({ ...editSprintData, startDate: e.target.value })}
                        />
                        <input
                            type="date"
                            className="mt-2 w-full rounded border p-2"
                            value={editSprintData.endDate}
                            onChange={(e) => setEditSprintData({ ...editSprintData, endDate: e.target.value })}
                        />
                        <div className="mt-4 flex gap-2">
                            {isStartingSprint ? (
                                <>
                                    <button
                                        className="rounded bg-green-500 px-4 py-2 text-white"
                                        onClick={() => handleStartSprint(editingSprint)}
                                    >
                                        Start
                                    </button>
                                    <button className="rounded bg-gray-300 px-4 py-2" onClick={handleCancelEdit}>
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="rounded bg-blue-500 px-4 py-2 text-white"
                                        onClick={handleSaveSprint}
                                    >
                                        Save
                                    </button>
                                    <button className="rounded bg-gray-300 px-4 py-2" onClick={handleCancelEdit}>
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <IssueDetailsModal issue={selectedIssue} onClose={() => setSelectedIssueId(null)} />
        </DragDropContext>
    );
};

export default BacklogBoard;
