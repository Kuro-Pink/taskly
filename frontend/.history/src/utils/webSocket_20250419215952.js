import { io } from 'socket.io-client';
import { receiveMessage } from '../redux/features/webSocketSlice';

let socket;

export const initWebSocket = (dispatch) => {
    socket = io('http://localhost:5000');

    socket.on('connect', () => {
        console.log('🔌 Connected to Socket.IO');
        dispatch({ type: 'websocket/connect' });
    });

    socket.on('disconnect', () => {
        console.warn('❌ Disconnected from Socket.IO');
        dispatch({ type: 'websocket/disconnect' });
    });

    // Lắng nghe sự kiện realtime từ server
    socket.on('CREATE_ISSUE', (data) => {
        dispatch({ type: 'backlog/createIssue/fulfilled', payload: data });
    });

    socket.on('UPDATE_ISSUE', (data) => {
        dispatch({ type: 'backlog/updateIssue/fulfilled', payload: data });
    });

    socket.on('DELETE_ISSUE', (data) => {
        dispatch({ type: 'backlog/deleteIssue/fulfilled', payload: data });
    });

    // ... Tương tự cho các sự kiện khác như CREATE_SPRINT, DELETE_EPIC, v.v.
};

export const sendMessage = (event, data) => {
    if (socket) {
        socket.emit(event, data);
        console.log('📤 Sent socket event:', event, data);
    }
};
