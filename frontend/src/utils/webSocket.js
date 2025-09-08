// src/utils/webSocket.js
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

import { SOCKET_EVENTS } from '../constants/socketEvents';

import { saveActivity, saveNotification } from '../redux/features/notificationSlice';
import { fetchAllIssue, fetchAllSprint, fetchIssueById } from '../redux/features/backlogSlice';
import { fetchAllEpics } from '../redux/features/epicSlice';
import { fetchStatuses } from '../redux/features/statusSlice';
import getCommentsByIssue from '../redux/features/commentSlice';

let socket = null; // Biến socket được khai báo ở ngoài để có thể giữ lại kết nối.

export const initWebSocket = (user, projectId, dispatch) => {
    if (socket && socket.connected) {
        console.log('🔌 Socket is already connected');
        return; // Tránh khởi tạo lại socket nếu đã có kết nối
    }

    socket = io('http://localhost:5000', { query: { userId: user.id, projectId } });

    socket.on('connect', () => {
        console.log('🔌 Connected to Socket.IO');
    });

    socket.on('connect_error', (err) => {
        console.error('Socket error:', err?.message || err);
    });

    socket.on('disconnect', () => {
        console.warn('❌ Disconnected from Socket.IO');
    });

    socket.on(SOCKET_EVENTS.RECEIVE_NOTIFICATION, (data) => {
        const enhancedData = {
            ...data,
            projectId, // Gắn projectId vào thông báo
        };
        console.log('📥 Received notification:', data);
        dispatch(saveNotification(enhancedData));

        // Đồng bộ UI theo loại thông báo
        switch (enhancedData.type) {
            case 'assign':
                break;
            case 'comment':
                dispatch(getCommentsByIssue(enhancedData.issueId));
                dispatch(fetchIssueById(enhancedData.issueId));
                dispatch(fetchAllIssue());
                break;
            default:
                console.warn('⚠️ Không xác định type:', enhancedData.type);
                break;
        }
    });

    socket.on(SOCKET_EVENTS.RECEIVE_ACTIVITY, (data) => {
        const enhancedData = {
            ...data,
            projectId, // Gắn projectId vào activity
        };
        const type = enhancedData.target.split(' ')[0]; // Lấy type từ target
        if (!type) return;

        if (user && enhancedData.username === user.name) {
            console.log('📥 Received activity:', data);
            dispatch(saveActivity(enhancedData));
        } else {
            console.log('📥 Activity không được xử lý:', enhancedData);
        }

        // Đồng bộ UI theo loại activity
        switch (type) {
            case 'Issue':
                dispatch(fetchAllIssue());
                break;
            case 'Sprint':
                dispatch(fetchAllSprint());
                break;
            case 'Epic':
                dispatch(fetchAllEpics());
                break;
            case 'Comment':
                dispatch(getCommentsByIssue(enhancedData.issueId));
                dispatch(fetchIssueById(enhancedData.issueId));
                dispatch(fetchAllIssue());
                break;
            case 'Status':
                dispatch(fetchStatuses());
                break;
            default:
                console.warn('⚠️ Không xác định type:', type);
                break;
        }
    });
};

// Gửi sự kiện WebSocket từ client
export const sendMessage = (event, data) => {
    if (socket && socket.connected) {
        socket.emit(event, data);
        console.log('📤 Sent socket event:', event, data);
    } else {
        console.warn('❌ Không thể gửi sự kiện, socket chưa kết nối');
    }
};

// Tự động xử lý khi không còn kết nối
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        console.log('❌ Đã ngắt kết nối socket');
    }
};

export { socket }; // Export socket ra ngoài để sử dụng ở các file khác
