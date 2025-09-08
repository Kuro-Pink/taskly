// components/Layout/ProjectLayout.jsx
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import socket from '../../utils/socket'; // chỉnh lại nếu cần

const ProjectLayout = ({ children }) => {
    const { key } = useParams(); // key là projectId (trong URL /projects/:key/...)

    useEffect(() => {
        if (key) {
            socket.emit('joinProject', key);
            return () => {
                socket.emit('leaveProject', key);
            };
        }
    }, [key]);

    return <div className="project-layout">{children}</div>;
};

export default ProjectLayout;
