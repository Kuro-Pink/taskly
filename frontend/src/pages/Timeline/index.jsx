import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import gantt from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { updateIssue, fetchAllIssue, fetchAllSprint, deleteIssue } from '../../redux/features/backlogSlice';
import { fetchAllEpics, deleteEpic } from '../../redux/features/epicSlice';
import { fetchStatuses } from '../../redux/features/statusSlice';
import { openModal } from '../../redux/features/modalSlice';
import { useParams } from 'react-router-dom';
import TaskModal from '../../components/modal/TaskModal';

const ConfirmDeleteModal = ({ taskId, onClose }) => {
    const dispatch = useDispatch();
    const { epics } = useSelector((state) => state.epics);
    if (!taskId) return null;

    const isEpic = epics.find((e) => e._id === taskId);

    const handleDelete = () => {
        if (isEpic) {
            dispatch(deleteEpic(taskId)).then(() => dispatch(fetchAllEpics()));
        } else {
            dispatch(deleteIssue(taskId)).then(() => dispatch(fetchAllIssue()));
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-96 rounded bg-white p-6 shadow-lg">
                <p className="mb-4">Bạn có chắc chắn muốn xoá phần tử này không?</p>
                <div className="flex justify-end space-x-4">
                    <button className="rounded bg-gray-300 px-4 py-2" onClick={onClose}>
                        Huỷ
                    </button>
                    <button className="rounded bg-red-600 px-4 py-2 text-white" onClick={handleDelete}>
                        Xoá
                    </button>
                </div>
            </div>
        </div>
    );
};

const GanttChart = () => {
    const ganttContainer = useRef(null);
    const { key } = useParams();
    const dispatch = useDispatch();

    const currentProject = useSelector((state) => state.projects.currentProject);
    const { sprints, issues } = useSelector((state) => state.backlog);
    const { epics } = useSelector((state) => state.epics);
    const [deleteTaskId, setDeleteTaskId] = useState(null);

    useEffect(() => {
        dispatch(fetchAllIssue());
        dispatch(fetchAllSprint());
        dispatch(fetchAllEpics());
        dispatch(fetchStatuses());
    }, [dispatch]);

    const formatDate = (date) => {
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const formatGanttData = () => {
        const tasks = [];
        epics
            .filter((e) => e.projectId === currentProject?._id)
            .forEach((epic) => {
                const epicItem = {
                    id: epic._id,
                    text: epic.name,
                    start_date: formatDate(epic.startDate),
                    end_date: formatDate(epic.endDate),
                    type: gantt.config.types.project,
                    open: true,
                };

                const issueChildren = issues.filter((i) => i.epic === epic._id && !i.parent);
                issueChildren.forEach((issue) => {
                    const issueItem = {
                        id: issue._id,
                        text: `${key} - ${issue.number} ${issue.title}`,
                        start_date: formatDate(issue.startDate),
                        end_date: formatDate(issue.endDate),
                        parent: epic._id,
                        type: gantt.config.types.project,
                    };

                    const subIssues = issues.filter((sub) => sub.parent === issue._id);
                    subIssues.forEach((sub) => {
                        tasks.push({
                            id: sub._id,
                            text: `${key} - ${issue.number} ${sub.title}`,
                            start_date: formatDate(sub.startDate),
                            end_date: formatDate(sub.endDate),
                            parent: issue._id,
                        });
                    });

                    tasks.push(issueItem);
                });

                tasks.push(epicItem);
            });

        return { data: tasks };
    };

    useEffect(() => {
        try {
            gantt.plugins({ marker: true });

            gantt.config.xml_date = '%Y-%m-%dT%H:%i:%s.%uZ';
            gantt.config.order_branch = true;
            gantt.config.order_branch_free = true;
            gantt.config.open_tree_initially = true;
            gantt.config.readonly = false;
            gantt.config.smart_rendering = true;
            gantt.config.drag_move = true;
            gantt.config.drag_resize = true;
            gantt.config.drag_progress = false;
            gantt.config.drag_project = true;
            gantt.config.fit_tasks = true;
            gantt.config.autoscroll = true;
            gantt.config.show_task_buttons = true;
            gantt.config.show_add = true;

            gantt.config.start_date = gantt.date.add(new Date(), -30, 'day'); // Trước 7 ngày
            gantt.config.end_date = gantt.date.add(new Date(), 30, 'day'); // Sau 30 ngày

            gantt.init(ganttContainer.current);
            gantt.clearAll();
            gantt.parse(formatGanttData());

            // 🎯 Highlight hôm nay
            gantt.addMarker({
                start_date: new Date(),
                css: 'today',
                text: 'Hôm nay',
                title: 'Ngày hiện tại',
            });

            // 🔗 Cho phép kéo để tạo liên kết
            gantt.config.drag_links = true;

            gantt.attachEvent('onAfterTaskDrag', (id) => {
                const task = gantt.getTask(id);
                dispatch(
                    updateIssue({
                        issueId: id,
                        updates: {
                            startDate: task.start_date,
                            endDate: task.end_date,
                        },
                    }),
                ).then(() => dispatch(fetchAllIssue()));
            });

            gantt.attachEvent('onTaskDblClick', (id) => {
                if (!gantt.isTaskExists(id)) return false;
                const task = gantt.getTask(id);
                const safeTask = {
                    ...task,
                    start_date: task.start_date?.toISOString?.() || null,
                    end_date: task.end_date?.toISOString?.() || null,
                };

                let type = 'epic';
                if (task.parent && gantt.isTaskExists(task.parent)) {
                    const parent = gantt.getTask(task.parent);
                    const isSubIssue = !!parent?.parent;
                    type = isSubIssue ? 'subIssue' : 'issue';
                }

                dispatch(openModal({ mode: 'edit', type, data: safeTask }));
                return false;
            });

            gantt.attachEvent('onTaskCreated', (task) => {
                const parentId = task.parent && task.parent !== 0 ? task.parent : null;
                let parent = null;
                if (parentId && gantt.isTaskExists(parentId)) {
                    parent = gantt.getTask(parentId);
                }

                let type = 'epic',
                    parentIdForData = null,
                    epicId = null;
                if (parent) {
                    const isSubIssue = !!parent.parent && gantt.isTaskExists(parent.parent);
                    type = isSubIssue ? 'subIssue' : 'issue';
                    parentIdForData = parent.id;
                    epicId = isSubIssue ? parent.parent : parent.id;
                }

                dispatch(
                    openModal({
                        mode: 'create',
                        type,
                        data: { parentId: parentIdForData, epicId },
                    }),
                );

                if (gantt.isTaskExists(task.id)) gantt.deleteTask(task.id);
                return false;
            });

            gantt.attachEvent('onContextMenu', (taskId, linkId, event) => {
                event.preventDefault();
                event.stopPropagation();
                setDeleteTaskId(taskId);
                return false;
            });

            sprints
                .filter((s) => s.project === currentProject?._id)
                .forEach((sprint) => {
                    gantt.addMarker({
                        start_date: formatDate(sprint.startDate),
                        end_date: formatDate(sprint.endDate),
                        text: sprint.name,
                        css: 'gantt_sprint_marker',
                    });
                });

            return () => gantt.clearAll();
        } catch (error) {
            console.error('💥 Error in GanttChart useEffect:', error);
        }
    }, [epics, sprints, issues, currentProject, dispatch]);

    const scrollToToday = () => {
        gantt.showDate(new Date());
    };

    return (
        <div className="h-[600px] w-full">
            <style>{`
                .gantt_sprint_marker {
                    background: rgba(0, 128, 255, 0.1);
                    border: none;
                    z-index: 0;
                }
                .gantt_marker.today {
                    background-color: red;
                    width: 2px;
                }
                .gantt_task_line {
                    cursor: grab !important;
                }
                .gantt_task_line:active {
                    cursor: grabbing !important;
                }
            `}</style>
            <div className="mb-2 flex justify-end">
                <button
                    onClick={scrollToToday}
                    className="rounded bg-blue-600 px-3 py-1 text-white transition hover:bg-blue-700"
                >
                    Về hôm nay
                </button>
            </div>
            <div ref={ganttContainer} className="h-full w-full" />
            <TaskModal />
            <ConfirmDeleteModal taskId={deleteTaskId} onClose={() => setDeleteTaskId(null)} />
        </div>
    );
};

export default GanttChart;
