import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircleQuestion, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../../redux/features/authSlice';
import { fetchProjects } from '../../../../redux/features/projectSlice';
import { fetchNotifications } from '../../../../redux/features/notificationSlice';
import { Badge } from '@mui/material';

import Button from '../../../Button';
import NavItem from '../../../NavItem';
import SearchBox from '../../../Search/SearchBox';

import Dropdown from '../../../Dropdown';
import styles from './Header.module.scss';

import {
    requestJoinProject,
    updateMemberRole,
    getProjectMembers,
    removeMember,
} from '../../../../redux/features/projectSlice'; // Import các action từ projectSlice

import NotificationCenter from '../../../Notification/NotificationCenter';
import IssueDetailsModal from '../../../Backlog/IssueDetailsModal';

const cx = classNames.bind(styles);

function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token } = useSelector((state) => state?.auth); // Lấy user hiện tại
    const { projects } = useSelector((state) => state.projects);
    const { notifications } = useSelector((state) => state?.notification);
    // if (!user) {
    //     return <Navigate to="/auth/login" state={{ from: location }} replace />;
    // }
    const projectIds = projects
        .filter((project) => project.members?.some((member) => member.user === user.id))
        .map((p) => String(p._id)); // đảm bảo stringify nếu cần
    const unreadCount =
        notifications.filter((n) => !n.isRead && n.userId === user?.id && projectIds.includes(String(n.projectId)))
            .length || 0;
    // Lấy user và token từ Redux

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inviteCode, setInviteCode] = useState('');

    const [selectedIssue, setSelectedIssue] = useState(null);

    useEffect(() => {
        dispatch(fetchProjects());
        dispatch(fetchNotifications());
    }, [dispatch]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setInviteCode('');
    };

    const handleInviteSubmit = async () => {
        try {
            const response = await dispatch(requestJoinProject({ inviteCode })).unwrap();
            await dispatch(fetchProjects()); // ⬅️ Đợi fetchProjects hoàn thành đã

            closeModal(); // ⬅️ Đóng modal sau khi mọi thứ xong
            navigate(`/projects/${response.project.key}/boards/${response.project._id}`); // ⬅️ Sau đó mới navigate
        } catch (error) {
            console.error('Lỗi khi tham gia dự án:', error);
        }
    };

    const projectItems = [
        // Lấy 3 project đầu tiên
        ...projects
            .filter(
                (project) => project.owner === user.id || project.members?.some((member) => member.user === user.id),
            )
            .map((project) => ({
                label: project.key,
                path: `/projects/${project.key}/boards/${project._id}`,
                icon: '/project-icon.png',
            })),
        // Thêm các item cố định bên dưới
        { label: 'Danh sách dự án', path: '/projects' },
        { label: 'Tạo dự án', path: '/projects/create' },
        { label: 'Vào dự án' },
    ];

    const [isOpen, setIsOpen] = useState(false);
    const [isPopup, setIsPopup] = useState(false);
    const dropdownRef = useRef(null);
    const popupRef = useRef(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setIsPopup(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Xử lý đăng xuất
    const handleLogout = () => {
        dispatch(logout()); // Xóa token trong Redux
        window.location.href = '/auth/login'; // Chuyển hướng về trang đăng nhập
    };

    return (
        <div className={cx('wrapper')}>
            <header className={cx('inner')}>
                <div className={cx('logo')}>
                    <Link to="/dashboard">Taskly</Link>
                </div>
                <ul className="flex items-center justify-between font-bold">
                    <Dropdown title="Dự án" items={projectItems} />
                    <Button btn onClick={openModal}>
                        + Vào dự án
                    </Button>
                </ul>
                <SearchBox onSelectItem={(issue) => setSelectedIssue(issue)} />
                {selectedIssue && (
                    <IssueDetailsModal
                        key={selectedIssue._id}
                        issue={selectedIssue}
                        onClose={() => setSelectedIssue(null)}
                    />
                )}

                {/* Kiểm tra token để hiển thị giao diện phù hợp */}
                {token ? (
                    <ul className="flex items-center justify-between text-[20px] font-bold text-gray-600">
                        <div ref={popupRef} style={{ position: 'relative' }}>
                            <li className={cx('icon-item relative')} onClick={() => setIsPopup(!isPopup)}>
                                <Badge badgeContent={unreadCount} color="error">
                                    <FontAwesomeIcon icon={faBell} />
                                </Badge>
                            </li>

                            {isPopup && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: -20,
                                        zIndex: 1000,
                                        background: 'white',
                                        border: '1px solid #ccc',
                                        borderRadius: 8,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
                                >
                                    <NotificationCenter />
                                </div>
                            )}
                        </div>
                        <li className={cx('icon-item')}>
                            <FontAwesomeIcon icon={faCircleQuestion || undefined} />
                        </li>

                        {/* Avatar + Dropdown */}
                        <li ref={dropdownRef} className={cx('relative ml-8')}>
                            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                                    {user?.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Avatar"
                                            className="h-full w-full rounded-full object-cover"
                                        />
                                    ) : (
                                        user?.name?.charAt(0).toUpperCase() || 'U'
                                    )}
                                </div>
                            </button>

                            {isOpen && (
                                <div className="absolute right-0 z-40 mt-2 w-86 rounded-lg border bg-white p-3 shadow-lg">
                                    <div className="border-b p-3">
                                        <div className="font-bold">{user?.name || 'User'}</div>
                                    </div>
                                    <ul className="py-2">
                                        <li className="cursor-pointer px-3 py-2 text-2xl hover:bg-gray-100">
                                            Quản lý tài khoản
                                        </li>
                                        <li className="cursor-pointer px-3 py-2 text-2xl hover:bg-gray-100">Cài đặt</li>
                                    </ul>
                                    <button
                                        onClick={handleLogout}
                                        className="mt-2 flex w-full items-center justify-center py-2 text-red-500 hover:bg-gray-100"
                                    >
                                        <FontAwesomeIcon icon={faRightFromBracket || undefined} className="mr-2" />
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </li>
                    </ul>
                ) : (
                    <div className="flex items-center space-x-4">
                        <Button className="text-sm" btn onClick={() => (window.location.href = '/auth/register')}>
                            Đăng ký
                        </Button>
                        <Button className="text-sm" primary onClick={() => (window.location.href = '/auth/login')}>
                            Đăng nhập
                        </Button>
                    </div>
                )}
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
                                <button
                                    onClick={closeModal}
                                    className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                                >
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
            </header>
        </div>
    );
}

export default Header;
