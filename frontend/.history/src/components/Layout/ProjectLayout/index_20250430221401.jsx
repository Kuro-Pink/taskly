// components/Layout/ProjectLayout.jsx
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import classNames from 'classnames/bind';
import Header from '../components/Header';
import Sitebar from '../DefaultLayout/Sitebar';
import styles from './DefaultLayout.module.scss';
import { socket } from '../../../utils/webSocket'; // Đảm bảo bạn đã export socket từ file webSocket.js
const cx = classNames.bind(styles);

const ProjectLayout = ({ children }) => {
    const { id } = useParams(); // id là projectId (trong URL /projects/:id/...)

    useEffect(() => {
        if (!id || !socket) return; // Không làm gì nếu không có id

        socket.emit('joinProject', id);
        return () => {
            socket.emit('leaveProject', id);
        };
    }, [id]);

    if (!id) {
        console.log('⚠ Không tìm thấy project ID trong URL');

        return <div>⚠ Không tìm thấy project ID</div>; // hoặc redirect tới trang khác
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
