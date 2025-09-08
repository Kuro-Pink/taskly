// src/utils/webSocket.js
import { io } from 'socket.io-client';
import { receiveMessage, connect, disconnect } from '../redux/features/websocket/webSocketSlice';
import { createComment, updateComment, deleteComment } from '../redux/features/commentSlice';
import {
    createIssue,
    updateIssue,
    deleteIssue,
    startSprint,
    createSprint,
    updateSprint,
    deleteSprint,
} from '../redux/features/backlogSlice';
import { createEpic, updateEpic, deleteEpic } from '../redux/features/epicSlice';
import { createStatus, updateStatus, deleteStatus } from '../redux/features/statusSlice';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import toast from 'react-hot-toast';

let socket;

export const initWebSocket = (userId, dispatch) => {
    socket = io('http://localhost:5000');
    export default socket;

    socket.on('connect', () => {
        console.log('🔌 Connected to Socket.IO');
        dispatch(connect());
    });

    socket.on('connect_error', (err) => {
        console.error('Socket error:', err?.message || err);
    });

    socket.on('disconnect', () => {
        console.warn('❌ Disconnected from Socket.IO');
        dispatch(disconnect());
    });

    socket.on(SOCKET_EVENTS.RECEIVE_ACTIVITY, (data) => {
        console.log('data:', data);
    });

    // ====== SỰ KIỆN REALTIME ======

    socket.on(SOCKET_EVENTS.CREATE_ISSUE, (data) => {
        if (data.creator === userId) return; // 🔁 Bỏ qua nếu là chính mình
        dispatch(createIssue.fulfilled(data)); // Gọi action creator cho việc tạo Issue
        toast.success(`🆕 Issue "${data.title}" đã được tạo`);
    });

    socket.on(SOCKET_EVENTS.UPDATE_ISSUE, (data) => {
        dispatch(updateIssue.fulfilled(data)); // Gọi action creator cho việc cập nhật Issue
        toast(`✏️ Issue "${data.title}" đã được cập nhật`);
    });

    socket.on(SOCKET_EVENTS.DELETE_ISSUE, (data) => {
        dispatch(deleteIssue.fulfilled(data)); // Gọi action creator cho việc xóa Issue
        toast(`🗑️ Issue "${data.title}" đã bị xóa`);
    });

    socket.on(SOCKET_EVENTS.CREATE_COMMENT, (data) => {
        if (data.user === userId) return;
        dispatch(createComment.fulfilled(data)); // Gọi action creator cho việc tạo Comment
        toast(`💬 Bình luận mới trong issue "${data.issueTitle}"`);
    });

    socket.on(SOCKET_EVENTS.UPDATE_COMMENT, (data) => {
        dispatch(updateComment.fulfilled(data)); // Gọi action creator cho việc cập nhật Comment
        toast(`✏️ Bình luận "${data.content}" đã được cập nhật`);
    });

    socket.on(SOCKET_EVENTS.DELETE_COMMENT, (id) => {
        dispatch(deleteComment.fulfilled(id)); // Gọi action creator cho việc xóa Comment
        toast(`🗑️ Bình luận đã bị xóa`);
    });

    socket.on(SOCKET_EVENTS.START_SPRINT, (data) => {
        dispatch(startSprint.fulfilled(data)); // Gọi action creator cho việc tạo Sprint
        toast.success(`🆕 Sprint "${data.name}" đã được bắt đầu`);
    });
    socket.on(SOCKET_EVENTS.CREATE_SPRINT, (data) => {
        if (data.creator === userId) return;
        dispatch(createSprint.fulfilled(data)); // Gọi action creator cho việc tạo Sprint
        toast.success(`🆕 Sprint "${data.name}" đã được tạo`);
    });

    socket.on(SOCKET_EVENTS.UPDATE_SPRINT, (data) => {
        dispatch(updateSprint.fulfilled(data)); // Gọi action creator cho việc cập nhật Sprint
        toast(`✏️ Sprint "${data.name}" đã được cập nhật`);
    });

    socket.on(SOCKET_EVENTS.DELETE_SPRINT, (data) => {
        dispatch(deleteSprint.fulfilled(data)); // Gọi action creator cho việc xóa Sprint
        toast(`🗑️ Sprint "${data.name}" đã bị xóa`);
    });

    socket.on(SOCKET_EVENTS.CREATE_EPIC, (data) => {
        if (data.creator === userId) return;
        dispatch(createEpic.fulfilled(data)); // Gọi action creator cho việc tạo Epic
        toast.success(`🆕 Epic "${data.name}" đã được tạo`);
    });

    socket.on(SOCKET_EVENTS.UPDATE_EPIC, (data) => {
        dispatch(updateEpic.fulfilled(data)); // Gọi action creator cho việc cập nhật Epic
        toast(`✏️ Epic "${data.name}" đã được cập nhật`);
    });

    socket.on(SOCKET_EVENTS.DELETE_EPIC, (data) => {
        dispatch(deleteEpic.fulfilled(data)); // Gọi action creator cho việc xóa Epic
        toast(`🗑️ Epic "${data.name}" đã bị xóa`);
    });

    socket.on(SOCKET_EVENTS.CREATE_STATUS, (data) => {
        if (data.creator === userId) return;
        dispatch(createStatus.fulfilled(data)); // Gọi action creator cho việc tạo Status
        toast.success(`🆕 Status "${data.name}" đã được tạo`);
    });

    socket.on(SOCKET_EVENTS.UPDATE_STATUS, (data) => {
        dispatch(updateStatus.fulfilled(data)); // Gọi action creator cho việc cập nhật Status
        toast(`✏️ Status "${data.name}" đã được cập nhật`);
    });

    socket.on(SOCKET_EVENTS.DELETE_STATUS, (data) => {
        dispatch(deleteStatus.fulfilled(data)); // Gọi action creator cho việc xóa Status
        toast(`🗑️ Status "${data.name}" đã bị xóa`);
    });
};

// Gửi sự kiện WebSocket từ client
export const sendMessage = (event, data) => {
    if (socket) {
        socket.emit(event, data);
        console.log('📤 Sent socket event:', event, data);
    }
};
