import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useDispatch, useSelector } from 'react-redux';
import { Collapse, IconButton, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import {
    fetchAllIssue,
    fetchIssueById,
    fetchAllSprint,
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
import ProjectMembersBar from '../../components/Project/ProjectMembersBar';
import TaskFilter from '../../components/Backlog/TaskFilter'; // đường dẫn đúng của bạn

const BacklogBoard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { key, id } = useParams();

    const currentProject = useSelector((state) => state.projects.currentProject);
    const { issues, sprints, loading, error } = useSelector((state) => state.backlog);
    const { epics } = useSelector((state) => state.epics);

    // ✅ Đặt toàn bộ useState lên trên
    const [filters, setFilters] = useState({
        epic: '',
        type: '',
    });

    const [menuOpen, setMenuOpen] = useState(null);

    const [showBacklog, setShowBacklog] = useState(true);
    const [expandedSprint, setExpandedSprint] = useState({});

    const [editingSprint, setEditingSprint] = useState(null);
    const [editSprintData, setEditSprintData] = useState({ name: '', startDate: '', endDate: '' });
    const [isStartingSprint, setIsStartingSprint] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    // const [creatingAt, setCreatingAt] = useState(null);
    // const [editingIssueId, setEditingIssueId] = useState(null);
    // const [editedTitle, setEditedTitle] = useState('');
    // const [isCreatingIssue, setIsCreatingIssue] = useState(false);
    // const [newIssue, setNewIssue] = useState({ title: '', type: 'Task' });
    // const [activeSprint, setActiveSprint] = useState(null);

    const selectedIssueId = useSelector((state) => state.backlog.selectedIssue);
    // 🔽 Sau khi khai báo xong toàn bộ hook mới được phép tính toán logic

    useEffect(() => {
        // Fetch lại issue mỗi khi `selectedIssue` thay đổi
        if (selectedIssue) {
            dispatch(fetchIssueById(selectedIssue._id));
        }
    }, [dispatch, selectedIssue]);
    useEffect(() => {
        // Fetch lại issue mỗi khi `selectedIssue` thay đổi
        if (selectedIssueId) {
            dispatch(fetchAllIssue());
        }
    }, [dispatch, selectedIssueId]);

    useEffect(() => {
        if (id) {
            dispatch(fetchProjectById(id)); // ✅ Lấy thông tin dự án
        }
    }, [id, dispatch]);

    useEffect(() => {
        dispatch(fetchAllIssue());
        dispatch(fetchAllSprint());
    }, [dispatch]);

    const toggleSprint = (id) => {
        setExpandedSprint((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
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
        const { source, destination, draggableId } = result;

        if (!destination) return;

        const sourceId = source.droppableId;
        const destId = destination.droppableId;

        // ❗ Ngăn kéo vào sprint đang collapse
        if (destId !== 'backlog' && !expandedSprint[destId]) {
            console.warn('Không thể drop vào sprint đang bị ẩn');
            return;
        }

        // ✅ Di chuyển vào sprint
        if (sourceId === 'backlog' && destId !== 'backlog') {
            dispatch(moveIssueToSprint({ issueId: draggableId, sprintId: destId }))
                .unwrap()
                .then(() => dispatch(fetchAllIssue()))
                .catch((err) => console.error('Lỗi moveIssueToSprint:', err));
        }

        // 🔄 Di chuyển giữa sprint
        else if (sourceId !== destId && sourceId !== 'backlog' && destId !== 'backlog') {
            dispatch(moveIssueToSprint({ issueId: draggableId, sprintId: destId }))
                .unwrap()
                .then(() => dispatch(fetchAllIssue()))
                .catch((err) => console.error('Lỗi moveIssueToSprint:', err));
        }

        // 🔙 Di chuyển về backlog
        else if (sourceId !== 'backlog' && destId === 'backlog') {
            dispatch(moveIssueToBacklog({ issueId: draggableId }))
                .unwrap()
                .then(() => dispatch(fetchAllIssue()))
                .catch((err) => console.error('Lỗi moveIssueToBacklog:', err));
        }
    };

    if (!currentProject || !currentProject._id) {
        return <div>Đang tải dữ liệu dự án...</div>; // hoặc một spinner
    }

    const getIssuesForSprint = (sprintId) =>
        issues?.filter(
            (item) =>
                String(item.sprint) === String(sprintId) &&
                String(item.project) === String(currentProject._id) &&
                !item.status &&
                item.sprint, // thêm dòng này
        );

    const filteredBacklog = issues
        ?.filter((item) => !item.sprint && String(item.project) === String(currentProject._id) && !item.status)
        .filter((task) => {
            const matchEpic = !filters.epic || task.epic === filters.epic;
            const matchType = !filters.type || task.type === filters.type;
            return matchEpic && matchType;
        });

    return (
        <DragDropContext
            onDragEnd={onDragEnd}
            onDragUpdate={(update) => {
                const destination = update?.destination;
                if (!destination) return;

                const sprintId = destination.droppableId;
                const index = destination.index;

                // ✅ Chỉ mở sprint khi thật sự đang hover vào vùng chứa item
                if (sprintId !== 'backlog' && !expandedSprint[sprintId] && index >= 0) {
                    setExpandedSprint((prev) => ({
                        ...prev,
                        [sprintId]: true,
                    }));
                }
            }}
        >
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center">
                    <ProjectMembersBar />
                    <TaskFilter
                        tasks={issues.filter(
                            (item) =>
                                !item.sprint && String(item.project) === String(currentProject._id) && !item.status,
                        )}
                        epics={epics.filter((item) => String(item.projectId) === String(currentProject._id))}
                        filters={filters}
                        handleSetFilters={(newFilters) => {
                            setFilters((prev) => ({ ...prev, ...newFilters }));
                        }}
                    />
                </div>

                {sprints
                    .filter((sprint) => {
                        return (
                            sprint &&
                            String(sprint.project) === String(currentProject._id) &&
                            String(sprint.started) === String(false)
                        );
                    })
                    .map((sprint) => (
                        <div key={sprint._id} className="relative mb-4 rounded-md bg-gray-200 p-4">
                            <div className="flex items-center justify-between border-b p-2">
                                <div className="flex items-center gap-2">
                                    <IconButton onClick={() => toggleSprint(sprint._id)} size="small">
                                        {expandedSprint[sprint._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>

                                    <h2 className="text-xl font-bold">{`${currentProject.key || key} ${sprint?.name}`}</h2>
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
                                        className="cursor-pointer rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                                        onClick={() => {
                                            handleEditSprint(sprint, 'start');
                                            setMenuOpen(null);
                                        }}
                                    >
                                        Bắt đầu Sprint
                                    </button>

                                    <button
                                        className="cursor-pointer rounded-md bg-gray-300 px-3 py-1 hover:bg-gray-400"
                                        onClick={() => setMenuOpen(menuOpen === sprint._id ? null : sprint._id)}
                                    >
                                        ...
                                    </button>

                                    {menuOpen === sprint._id && (
                                        <ul className="absolute top-14 right-4 z-10 w-56 rounded-md bg-white shadow-lg">
                                            <li
                                                className="cursor-pointer p-2 hover:bg-gray-100"
                                                onClick={() => {
                                                    handleEditSprint(sprint);
                                                    setMenuOpen(null);
                                                }}
                                            >
                                                Edit Sprint
                                            </li>

                                            <li
                                                className="cursor-pointer p-2 text-red-500 hover:bg-gray-100"
                                                onClick={() => {
                                                    handleDeleteSprint(sprint._id);
                                                    setMenuOpen(null);
                                                }}
                                            >
                                                Delete Sprint
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <Collapse in={expandedSprint[sprint._id]}>
                                <Droppable droppableId={sprint._id}>
                                    {(provided) => (
                                        <ul ref={provided.innerRef} {...provided.droppableProps}>
                                            {getIssuesForSprint(sprint._id).map((item, index) => (
                                                <Draggable
                                                    key={`sprint-${item._id}`}
                                                    draggableId={String(item._id)}
                                                    index={index}
                                                >
                                                    {(provided) => (
                                                        <li
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="my-2 flex items-center justify-between rounded-md bg-white p-2 shadow"
                                                            onClick={(e) => {
                                                                const allowedArea = e.target.closest('.clickable');
                                                                if (
                                                                    allowedArea &&
                                                                    e.currentTarget.contains(allowedArea)
                                                                ) {
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
                            </Collapse>
                        </div>
                    ))}
                <div className="flex items-start gap-4">
                    <div className="w-full rounded-md bg-gray-200 p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <IconButton onClick={() => setShowBacklog((prev) => !prev)} size="small">
                                {showBacklog ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                <span className="ml-4 text-2xl font-bold text-gray-700">Backlog</span>
                            </IconButton>
                            <Button
                                onClick={handleCreateSprint}
                                variant="contained"
                                color="primary"
                                startIcon={<AddIcon />}
                                sx={{ borderRadius: '8px', fontSize: 12, textTransform: 'none' }}
                            >
                                Tạo Sprint
                            </Button>
                        </div>

                        <Collapse in={showBacklog}>
                            <Droppable droppableId="backlog">
                                {(provided) => (
                                    <ul ref={provided.innerRef} {...provided.droppableProps}>
                                        {filteredBacklog.map((item, index) => (
                                            <Draggable
                                                key={`backlog-${item._id}`}
                                                draggableId={String(item._id)}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <li
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="my-2 flex items-center justify-between rounded-md bg-white p-2 shadow"
                                                        onClick={(e) => {
                                                            const allowedArea = e.target.closest('.clickable');
                                                            if (allowedArea && e.currentTarget.contains(allowedArea)) {
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
                        </Collapse>

                        <CreateIssueBox />
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
            {selectedIssue && (
                <IssueDetailsModal
                    key={selectedIssue._id}
                    issue={selectedIssue}
                    onClose={() => setSelectedIssue(null)}
                />
            )}
        </DragDropContext>
    );
};

export default BacklogBoard;
