// components/Layout/ProjectLayout.jsx
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import socket from '../../../utils/webSocket'; // chỉnh lại nếu cần
import classNames from 'classnames/bind';
import Header from '../DefaultLayout/Header';
import Sitebar from '../DefaultLayout/Sitebar';
import styles from '../DefaultLayout/DefaultLayout.module.scss';

const cx = classNames.bind(styles);

const ProjectLayout = ({ children }) => {
    const { id } = useParams(); // id là projectId (trong URL /projects/:id/...)

    useEffect(() => {
        if (id) {
            socket.emit('joinProject', id);
            return () => {
                socket.emit('leaveProject', id);
            };
        }
    }, [id]);

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
