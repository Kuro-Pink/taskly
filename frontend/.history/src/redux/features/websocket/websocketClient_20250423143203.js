import io from 'socket.io-client';
import { receiveMessage } from './webSocketSlice';
import { addNotification } from '../notification/notificationSlice';
import toast from 'react-hot-toast';

let socket;

export const initSocket = (userId, dispatch) => {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

    socket.on('connect', () => {
        console.log('Connected to socket');
        socket.emit('join', userId); // Gửi userId khi join room
    });

    socket.on('CREATE_COMMENT', (data) => {
        dispatch(receiveMessage(data));
        dispatch(addNotification({ type: 'comment', data }));
        toast.success(`💬 Bình luận mới trong issue ${data.issueTitle}`);
    });

    socket.on('CREATE_ISSUE', (data) => {
        dispatch({ type: 'backlog/createIssue/fulfilled', payload: data });
        dispatch(addNotification({ type: 'issue_created', data }));
        toast.success(`🆕 Issue "${data.title}" đã được tạo`);
    });
};
