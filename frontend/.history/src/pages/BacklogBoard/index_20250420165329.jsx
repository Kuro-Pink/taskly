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

import { fetchProjectById } from '../../redux/features/projectSlice';
const BacklogBoard = () => {
    const { key, id } = useParams(); // 🟢 Lấy giá trị từ URL

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { issues, sprints, loading, error } = useSelector((state) => state.backlog);
    const [newIssue, setNewIssue] = useState({ title: '', type: 'Task' });
    const [activeSprint, setActiveSprint] = useState(null);
    const [menuOpen, setMenuOpen] = useState(null);
    const [isCreatingIssue, setIsCreatingIssue] = useState(false);
    // ✅ Lấy ID từ Redux store
    const currentProject = useSelector((state) => state.projects.currentProject);

    const [editingIssueId, setEditingIssueId] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');

    const [editingSprint, setEditingSprint] = useState(null);
    const [editSprintData, setEditSprintData] = useState({ name: '', startDate: '', endDate: '' });

    const [isStartingSprint, setIsStartingSprint] = useState(false);

    const [creatingAt, setCreatingAt] = useState(null); // 'backlog' | sprintId | null

    const [selectedIssue, setSelectedIssue] = useState(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchProjectById(id)); // ✅ Lấy thông tin dự án
        }
    }, [id, dispatch]);

    useEffect(() => {
        dispatch(fetchAllIssue());
        dispatch(fetchAllSprint());
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
                // ✅ Cập nhật xong thì reload backlog
                dispatch(fetchAllIssue());
            })
            .catch((error) => {
                console.error('Lỗi khi cập nhật sprint:', error);
            });
        setEditingIssueId(null);
    };

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

    const handleAddIssue = () => {
        if (!newIssue.title) return;
        dispatch(createIssue({ title: newIssue.title, type: newIssue.type, project: currentProject._id }));
        setNewIssue({ title: '', type: 'Task' });
        setActiveSprint(null);
        setIsCreatingIssue(false);
    };

    const handleDeleteIssue = (id) => {
        if (confirm('Bạn có chắc muốn xóa issue này?')) {
            dispatch(deleteIssue(id))
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

    if (!currentProject) {
        return <div>Loading project...</div>;
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
                                                            onClick={() => setSelectedIssue(item)}
                                                        >
                                                            {editingIssueId === item._id ? (
                                                                <div className="flex w-full items-center gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={editedTitle}
                                                                        onChange={(e) => setEditedTitle(e.target.value)}
                                                                        className="flex-1 rounded border border-gray-300 px-2 py-1"
                                                                        autoFocus
                                                                    />
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSaveEdit(item._id);
                                                                        }}
                                                                        className="text-green-600 hover:text-green-800"
                                                                        title="Lưu"
                                                                    >
                                                                        ✔️
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleCancelEditIssue;
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700"
                                                                        title="Hủy"
                                                                    >
                                                                        ❌
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="flex items-center gap-2">
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
                                                                        <p>{`${currentProject?.key || key} - ${item.number} ${item.title}`}</p>

                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation(); // Ngăn sự kiện nổi bọt lên <li>
                                                                                handleEditIssue(item);
                                                                            }}
                                                                            className="text-gray-500 hover:text-blue-500"
                                                                            title="Sửa"
                                                                        >
                                                                            ✏️
                                                                        </button>
                                                                    </div>

                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteIssue(item._id);
                                                                        }}
                                                                        className="text-gray-400 hover:text-red-500"
                                                                        title="Xóa"
                                                                    >
                                                                        🗑️
                                                                    </button>
                                                                </>
                                                            )}
                                                        </li>
                                                    )}
                                                </Draggable>
                                            ))}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                            {/* <CreateIssueBox
                                contextId="backlog"
                                creatingAt={creatingAt}
                                setCreatingAt={setCreatingAt}
                                onAdd={handleAddIssue}
                            /> */}
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
                                                        onClick={() => setSelectedIssue(item)}
                                                    >
                                                        {editingIssueId === item._id ? (
                                                            <div className="flex w-full items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={editedTitle}
                                                                    onChange={(e) => setEditedTitle(e.target.value)}
                                                                    className="flex-1 rounded border border-gray-300 px-2 py-1"
                                                                    autoFocus
                                                                />
                                                                <button
                                                                    onClick={() => handleSaveEdit(item._id)}
                                                                    className="text-green-600 hover:text-green-800"
                                                                    title="Lưu"
                                                                >
                                                                    ✔️
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEditIssue}
                                                                    className="text-red-500 hover:text-red-700"
                                                                    title="Hủy"
                                                                >
                                                                    ❌
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex items-center gap-2">
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
                                                                    <p>{`${currentProject?.key || key} - ${item.number} ${item.title}`}</p>

                                                                    <button
                                                                        onClick={() => handleEditIssue(item)}
                                                                        className="text-gray-500 hover:text-blue-500"
                                                                        title="Sửa"
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                </div>

                                                                <button
                                                                    onClick={() => handleDeleteIssue(item._id)}
                                                                    className="text-gray-400 hover:text-red-500"
                                                                    title="Xóa"
                                                                >
                                                                    🗑️
                                                                </button>
                                                            </>
                                                        )}
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))}

                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                        {/* <CreateIssueBox
                            contextId="backlog"
                            creatingAt={creatingAt}
                            setCreatingAt={setCreatingAt}
                            onAdd={handleAddIssue}
                        /> */}
                        {isCreatingIssue ? (
                            <div className="my-2 rounded-md bg-white p-2 shadow">
                                <input
                                    type="text"
                                    value={newIssue.title}
                                    onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                                    className="w-full rounded-md border p-1"
                                    placeholder="Issue title"
                                />
                                <select
                                    value={newIssue.type}
                                    onChange={(e) => setNewIssue({ ...newIssue, type: e.target.value })}
                                    className="mt-2 w-full rounded-md border p-1"
                                >
                                    <option value="Task">Task</option>
                                    <option value="Bug">Bug</option>
                                    <option value="Story">Story</option>
                                </select>
                                <button
                                    onClick={() => handleAddIssue(null)}
                                    className="mt-2 w-full rounded-md bg-blue-500 p-1 text-white"
                                >
                                    Add Issue
                                </button>
                                <button
                                    onClick={() => setIsCreatingIssue(false)}
                                    className="mt-2 w-full rounded-md bg-gray-300 p-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCreatingIssue(true)}
                                className="mt-2 w-full rounded-md bg-gray-300 p-2"
                            >
                                + Create Issue
                            </button>
                        )}
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
            <IssueDetailsModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
        </DragDropContext>
    );
};

export default BacklogBoard;
