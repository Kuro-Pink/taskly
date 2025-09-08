import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../../redux/features/projectSlice';
import { useNavigate } from 'react-router-dom';

import {
    requestJoinProject,
    respondJoinRequest,
    updateMemberRole,
    getProjectMembers,
    removeMember,
} from '../../redux/features/backlogSlice'; // Import các action từ projectSlice

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { projects, loading, error } = useSelector((state) => state.projects);
    const { user } = useSelector((state) => state.auth); // Lấy user hiện tại

    const [viewMode, setViewMode] = useState('workedOn'); // Thêm useState để quản lý tab

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inviteCode, setInviteCode] = useState('');

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setInviteCode('');
    };

    const handleInviteSubmit = () => {
        dispatch(requestJoinProject({ inviteCode })) // Gửi yêu cầu tham gia với inviteCode
            .then((response) => {
                console.log('Dự án đã được tham gia:', response); // Kiểm tra nếu cần
                closeModal(); // Đóng modal sau khi yêu cầu được gửi
            })
            .catch((error) => {
                console.error('Lỗi khi tham gia dự án:', error); // Xử lý lỗi nếu có
            });
    };

    useEffect(() => {
        dispatch(fetchProjects());
    }, [dispatch]);

    return (
        <div className="mx-auto p-4">
            <h2 className="mb-4 text-2xl font-bold">📌 Danh sách dự án</h2>

            {loading && <p>🔄 Đang tải...</p>}
            {error && <p className="text-red-500">❌ {error}</p>}

            {Array.isArray(projects) &&
            projects.filter(
                (project) => project.owner === user.id || project.members?.some((member) => member.user === user.id),
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
                                project.owner === user.id || project.members?.some((member) => member.user === user.id),
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

            {/* Thanh ngang ngăn cách */}
            <div className="my-4 w-full border-t-2 border-gray-300"></div>

            {/* Nút chuyển đổi */}
            <div className="mt-6 flex w-full space-x-4 pt-4">
                {[
                    { id: 'workedOn', label: 'Nơi làm việc' },
                    { id: 'viewed', label: 'Đã xem' },
                    { id: 'assigned', label: 'Được giao cho' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                            viewMode === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-100'
                        }`}
                        onClick={() => setViewMode(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
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
