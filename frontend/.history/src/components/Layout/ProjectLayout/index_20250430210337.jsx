// components/Layout/ProjectLayout.jsx
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import socket from '../../utils/socket'; // chỉnh lại nếu cần

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

    return <div className="project-layout">{children}</div>;
};

export default ProjectLayout;
