import { useState, useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBell,
    faCircleQuestion,
    faCircleXmark,
    faMagnifyingGlass,
    faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../../redux/features/authSlice';
import { fetchProjects, deleteProject } from '../../../../redux/features/projectSlice';

import Tippy from '@tippyjs/react/headless';
import 'tippy.js/dist/tippy.css';

import Button from '../../../Button';
import NavItem from '../../../NavItem';
import { Wrapper as PopperWrapper } from '../../../Popper';
import Dropdown from '../../../Dropdown';
import styles from './Header.module.scss';

const cx = classNames.bind(styles);

function Header() {
    const dispatch = useDispatch();
    const { projects, loading, error } = useSelector((state) => state.projects);

    useEffect(() => {
        dispatch(fetchProjects());
    }, [dispatch]);

    const projectItems = [
        // Lấy 3 project đầu tiên
        ...projects.slice(0, 3).map((project) => ({
            label: project.key,
            path: `/projects/${project.key}/boards/${project._id}`,
            icon: '/project-icon.png',
        })),
        // Thêm các item cố định bên dưới
        { label: 'View all projects', path: '/projects' },
        { label: 'Create project', path: '/projects/create' },
    ];

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Lấy user và token từ Redux
    const user = useSelector((state) => state.auth.user);
    const token = useSelector((state) => state.auth.token);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
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
                    <a href="/dashboard">Taskly</a>
                </div>
                <ul className="flex items-center justify-between font-bold">
                    <Dropdown title="Projects" items={projectItems} />
                    <NavItem>Bộ lọc</NavItem>
                    <NavItem>Đội nhóm</NavItem>
                </ul>

                <Tippy
                    interactive
                    visible={false}
                    render={(attrs) => (
                        <div className={cx('search-result')} tabIndex="-1" {...attrs}>
                            <PopperWrapper></PopperWrapper>
                        </div>
                    )}
                >
                    <div className={cx('search')}>
                        <input placeholder="Search your project..." spellCheck={false} />
                        <button className={cx('clear')}>
                            <FontAwesomeIcon icon={faCircleXmark || undefined} />
                        </button>
                        <button className={cx('search-btn')}>
                            <FontAwesomeIcon icon={faMagnifyingGlass || undefined} />
                        </button>
                    </div>
                </Tippy>

                {/* Kiểm tra token để hiển thị giao diện phù hợp */}
                {token ? (
                    <ul className="flex items-center justify-between text-[20px] font-bold text-gray-600">
                        <li className={cx('icon-item')}>
                            <FontAwesomeIcon icon={faBell || undefined} />
                        </li>
                        <li className={cx('icon-item')}>
                            <FontAwesomeIcon icon={faCircleQuestion || undefined} />
                        </li>

                        {/* Avatar + Dropdown */}
                        <li ref={dropdownRef} className={cx('relative ml-8')}>
                            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                                    {user ? (
                                        user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt="Avatar"
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            user.name?.charAt(0).toUpperCase() || 'U'
                                        )
                                    ) : (
                                        'U'
                                    )}
                                </div>
                            </button>

                            {isOpen && (
                                <div className="absolute right-0 mt-2 w-86 rounded-lg border bg-white p-3 shadow-lg">
                                    <div className="border-b p-3">
                                        <div className="font-bold">{user?.name || 'User'}</div>
                                        <div className="text-sm text-gray-500">{user?.email || 'user@example.com'}</div>
                                    </div>
                                    <ul className="py-2">
                                        <li className="cursor-pointer px-3 py-2 text-2xl hover:bg-gray-100">
                                            Manage account
                                        </li>
                                        <li className="cursor-pointer px-3 py-2 text-2xl hover:bg-gray-100">
                                            Settings
                                        </li>
                                    </ul>
                                    <button
                                        onClick={handleLogout}
                                        className="mt-2 flex w-full items-center justify-center py-2 text-red-500 hover:bg-gray-100"
                                    >
                                        <FontAwesomeIcon icon={faRightFromBracket || undefined} className="mr-2" />
                                        Log out
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
            </header>
        </div>
    );
}

export default Header;
