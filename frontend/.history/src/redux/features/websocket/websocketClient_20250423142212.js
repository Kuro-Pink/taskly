import io from 'socket.io-client';
import { receiveMessage } from './webSocketSlice';

let socket;

export const initSocket = (userId, dispatch) => {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

    socket.on('connect', () => {
        console.log('Connected to socket');
        socket.emit('join', userId); // Gửi userId khi join room
    });

    socket.on('newComment', (data) => {
        dispatch(receiveMessage({ type: 'comment', data }));
    });

    socket.on('issueUpdated', (data) => {
        dispatch(receiveMessage({ type: 'issue', data }));
    });

    socket.on('sprintUpdated', (data) => {
        dispatch(receiveMessage({ type: 'sprint', data }));
    });

    socket.on('epicUpdated', (data) => {
        dispatch(receiveMessage({ type: 'epic', data }));
    });
};
