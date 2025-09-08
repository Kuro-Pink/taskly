// components/Layout/ProjectLayout.jsx
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import classNames from 'classnames/bind';
import Header from '../components/Header';
import Sitebar from '../DefaultLayout/Sitebar';
import styles from './DefaultLayout.module.scss';

const cx = classNames.bind(styles);

const ProjectLayout = ({ children }) => {
    const { id } = useParams(); // id là projectId (trong URL /projects/:id/...)
    console.log('id:', id); // Kiểm tra xem id có đúng không
    console.log('socket:', socket); // Kiểm tra xem socket có đúng không

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
