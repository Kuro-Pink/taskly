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
    const currentProject = useSelector((state) => state.projects.currentProject);

    useEffect(() => {
        if (id || currentProject?._id) {
            socket.emit('joinProject', id);
            return () => {
                socket.emit('leaveProject', id);
            };
        }
    }, [id || currentProject?._id]); // Chỉ join khi có id hoặc currentProject

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
