import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../../redux/features/projectSlice';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Divider, Stack, Paper } from '@mui/material';
import ActivityItem from './ActivityItem';
import NotificationItem from './NotificationItem';
import { format, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';

import { fetchActivities, fetchNotifications } from '../../redux/features/notificationSlice';
import { requestJoinProject } from '../../redux/features/projectSlice'; // Import các action từ projectSlice

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { projects } = useSelector((state) => state?.projects);
    const { notifications, activities } = useSelector((state) => state?.notification);
    const { user } = useSelector((state) => state.auth); // Lấy user hiện tại

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    //onWork
    const [viewMode, setViewMode] = useState('activities');

    const projectIds = projects
        .filter((project) => project.owner === user._id || project.members?.some((member) => member.user === user._id))
        .map((p) => String(p._id)); // đảm bảo stringify nếu cần

    const filteredActivities = activities.filter((a) => projectIds.includes(String(a.projectId)));

    const filteredNotifications = notifications?.filter((n) => n.type === 'assign');

    useEffect(() => {
        if (user?._id) {
            dispatch(fetchProjects());
            dispatch(fetchActivities());
            dispatch(fetchNotifications());
        }
    }, [dispatch, user?.id]); // 🟢 chạy lại khi user đã có

    const groupActivitiesByDate = (activities) => {
        return activities.reduce((groups, activity) => {
            const date = new Date(activity.updatedAt);
            let label;

            if (isToday(date)) {
                label = 'Hôm nay';
            } else if (isYesterday(date)) {
                label = 'Hôm qua';
            } else {
                label = format(date, 'dd/MM/yyyy', { locale: vi });
            }

            if (!groups[label]) groups[label] = [];
            groups[label].push(activity);
            return groups;
        }, {});
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setInviteCode('');
    };

    const handleInviteSubmit = async () => {
        try {
            const response = await dispatch(requestJoinProject({ code: inviteCode })).unwrap();
            await dispatch(fetchProjects()); // ⬅️ Đợi fetchProjects hoàn thành đã

            closeModal(); // ⬅️ Đóng modal sau khi mọi thứ xong
            navigate(`/projects/${response.project.key}/boards/${response.project._id}`); // ⬅️ Sau đó mới navigate
        } catch (error) {
            console.error('Lỗi khi tham gia dự án:', error);
        }
    };

    if (!activities || !notifications) {
        return (
            <Typography variant="body2" color="text.secondary">
                Loading...
            </Typography>
        );
    }

    return (
        <div className="mx-auto p-4">
            <h2 className="mb-4 text-2xl font-bold">📌 Danh sách dự án</h2>
            {Array.isArray(projects) &&
            projects.filter(
                (project) => project.owner === user._id || project.members?.some((member) => member.user === user._id),
            ).length === 0 ? (
                <div className="mt-8 flex flex-col items-center gap-4">
                    <p>⚠ Hiện không có dự án nào.</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/projects/create')}
                            className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                        >
                            + Tạo dự án mới
                        </button>
                        <button
                            onClick={openModal}
                            className="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                        >
                            🔎 Vào dự án bằng mã
                        </button>
                    </div>
                </div>
            ) : (
                // Render dự án
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-4">
                    {projects
                        .filter(
                            (project) =>
                                project.owner === user._id ||
                                project.members?.some((member) => member.user === user._id),
                        )
                        ?.map((project, index) => (
                            <div
                                key={project._id}
                                onClick={() => navigate(`/projects/${project.key}/boards/${project._id}`)}
                                className="relative flex cursor-pointer items-center rounded-lg border p-4 shadow-sm transition hover:shadow-md"
                            >
                                {/* Thanh màu bên trái */}
                                <div
                                    className="absolute top-0 left-0 h-full w-8 rounded-l-lg"
                                    style={{ backgroundColor: index % 2 === 0 ? '#FFD9B3' : '#B3D9FF' }}
                                ></div>

                                {/* Ảnh project */}
                                <div className="ml-3">
                                    <img
                                        src={project.image || 'https://via.placeholder.com/40'}
                                        alt={project.name}
                                        className="h-10 w-10 rounded-md"
                                    />
                                </div>

                                {/* Nội dung */}
                                <div className="ml-4 flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                                    <p className="text-lg text-gray-500">Team-managed software</p>

                                    <div className="mt-2">
                                        <p className="text-lg font-semibold text-gray-600">Quick links</p>
                                        <div className="flex items-center justify-between text-lg text-gray-500">
                                            <span>My open issues</span>
                                            <span className="rounded bg-gray-200 px-2 py-1 text-lg">
                                                {project.openIssues || 0}
                                            </span>
                                        </div>
                                        <p className="text-lg text-gray-500">Done issues</p>
                                    </div>

                                    {/* Nút board */}
                                    <div className="mt-3">
                                        <span className="rounded-md border border-transparent bg-gray-100 px-3 py-1 text-xl">
                                            1 board ▾
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            )}
            <Paper elevation={3} sx={{ p: 3, my: 4, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                    Bảng tổng hợp
                </Typography>

                {/* Divider */}
                <Divider sx={{ my: 2 }} />

                {/* Tabs */}
                <Stack direction="row" spacing={2} mb={2}>
                    {[
                        { id: 'activities', label: 'Các hoạt động' },
                        { id: 'assigned', label: 'Việc được giao' },
                    ].map((tab) => (
                        <Button
                            key={tab.id}
                            variant={viewMode === tab.id ? 'contained' : 'outlined'}
                            onClick={() => setViewMode(tab.id)}
                            sx={{ textTransform: 'none', borderRadius: 2, fontSize: '12px', fontWeight: 600 }}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </Stack>

                {/* Nội dung */}
                <Box>
                    {viewMode === 'activities' && (
                        <Stack spacing={2}>
                            {activities.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No activities
                                </Typography>
                            ) : (
                                Object.entries(groupActivitiesByDate(filteredActivities)).map(([label, group]) => (
                                    <Box key={label}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                            color="text.primary"
                                            sx={{ mb: 1 }}
                                        >
                                            {label}
                                        </Typography>
                                        <Stack spacing={1}>
                                            {group.map((a) => (
                                                <ActivityItem key={a._id} activity={a} />
                                            ))}
                                        </Stack>
                                    </Box>
                                ))
                            )}
                        </Stack>
                    )}

                    {viewMode === 'assigned' && (
                        <Stack spacing={2}>
                            {filteredNotifications?.length > 0 ? (
                                filteredNotifications
                                    .filter((notify) => notify.userId === user._id)
                                    .map((item, index) => <NotificationItem key={index} notification={item} />)
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Không có công việc được giao nào gần đây.
                                </Typography>
                            )}
                        </Stack>
                    )}
                </Box>
            </Paper>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs">
                    <div className="w-96 space-y-4 rounded-lg bg-white p-6">
                        <h2 className="text-xl font-semibold">Nhập mã dự án</h2>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            className="w-full rounded border p-2"
                            placeholder="Invite Code..."
                        />
                        <div className="flex justify-end space-x-2">
                            <button onClick={closeModal} className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400">
                                Hủy
                            </button>
                            <button
                                onClick={handleInviteSubmit}
                                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                            >
                                Vào
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
