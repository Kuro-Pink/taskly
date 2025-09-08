import { useParams } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import classNames from 'classnames/bind';
import Header from '../components/Header';
import Sitebar from '../DefaultLayout/Sitebar';
import styles from './DefaultLayout.module.scss';
import { socket, initWebSocket } from '../../../utils/webSocket'; // Đảm bảo bạn đã export socket từ file webSocket.js
const cx = classNames.bind(styles);

import { useSelector, useDispatch } from 'react-redux';
import { getUserInfo } from '../../../redux/features/authSlice';

const ProjectLayout = ({ children }) => {
    const { id } = useParams(); // id là projectId (trong URL /projects/:id/...)
    const { user, token, loading, error } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const isSocketInitialized = useRef(false); // Sử dụng useRef để đảm bảo initWebSocket chỉ chạy 1 lần

    useEffect(() => {
        if (!id || !user) return;

        // Chỉ gọi initWebSocket một lần khi chưa khởi tạo socket
        if (!isSocketInitialized.current) {
            initWebSocket(user, id, dispatch);
            isSocketInitialized.current = true; // Đánh dấu đã khởi tạo socket
        }

        // Join phòng khi vào dự án
        socket.emit('joinProject', id); // Tham gia phòng của dự án
        socket.emit('join', user.id); // Tham gia phòng của user

        return () => {
            // Khi người dùng rời trang, rời phòng để giảm kết nối
            socket.emit('leaveProject', id);
            socket.emit('leave', user.id);
        };
    }, [id, user, dispatch]); // Chạy lại khi id hoặc user thay đổi

    useEffect(() => {
        if (token) {
            dispatch(getUserInfo(token)); // Gọi API để lấy thông tin người dùng nếu có token
        }
    }, [token, dispatch]);

    if (loading) {
        return <div>Đang tải...</div>;
    }

    return (
        <div className={cx('wrapper')}>
            <Header />
            <div className={cx('container')}>
                <Sitebar />
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
};

export default ProjectLayout;
