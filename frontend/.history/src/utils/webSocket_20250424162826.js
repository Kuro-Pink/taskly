// src/utils/webSocket.js
import { io } from 'socket.io-client';
import { receiveMessage, connect, disconnect } from '../redux/features/websocket/webSocketSlice';
import { createComment, updateComment, deleteComment } from '../redux/features/commentSlice';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import toast from 'react-hot-toast';

let socket;

export const initWebSocket = (dispatch) => {
    socket = io('http://localhost:5000');

    socket.on('connect', () => {
        console.log('🔌 Connected to Socket.IO');
        dispatch(connect());
    });

    socket.on('disconnect', () => {
        console.warn('❌ Disconnected from Socket.IO');
        dispatch(disconnect());
    });

    // ====== SỰ KIỆN REALTIME ======

    socket.on(SOCKET_EVENTS.CREATE_ISSUE, (data) => {
        dispatch({ type: 'backlog/createIssue/fulfilled', payload: data });
        toast.success(`🆕 Issue "${data.title}" đã được tạo`);
    });

    socket.on(SOCKET_EVENTS.UPDATE_ISSUE, (data) => {
        dispatch({ type: 'backlog/updateIssue/fulfilled', payload: data });
        toast(`✏️ Issue "${data.title}" đã được cập nhật`);
    });

    socket.on(SOCKET_EVENTS.DELETE_ISSUE, (data) => {
        dispatch({ type: 'backlog/deleteIssue/fulfilled', payload: data });
        toast(`🗑️ Issue "${data.title}" đã bị xóa`);
    });

    socket.on(SOCKET_EVENTS.CREATE_COMMENT, (data) => {
        dispatch(receiveMessage(data));
        toast(`💬 Bình luận mới trong issue "${data.issueTitle}"`);
    });

    // Các sự kiện khác như CREATE_SPRINT, UPDATE_EPIC, DELETE_SPRINT, v.v. có thể được thêm vào đây nếu cần

    socket.on(SOCKET_EVENTS.CREATE_COMMENT, (data) => {
        dispatch(createComment.fulfilled(data)); // gọi action creator theo redux-style
    });

    socket.on(SOCKET_EVENTS.UPDATE_COMMENT, (data) => {
        dispatch(updateComment.fulfilled(data));
    });

    socket.on(SOCKET_EVENTS.DELETE_COMMENT, (id) => {
        dispatch(deleteComment.fulfilled(id));
    });
};

export const sendMessage = (event, data) => {
    if (socket) {
        socket.emit(event, data);
        console.log('📤 Sent socket event:', event, data);
    }
};
