import io from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { SOCKET_EVENTS } from '../../../constants/socketEvents';

import { createComment, updateComment, deleteComment } from '../commentSlice';
import { addNotification } from '../notification/notificationSlice';
import { receiveMessage } from './webSocketSlice';

let socket;

export const initSocket = (userId, dispatch) => {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

    socket.on('connect', () => {
        console.log('🟢 Connected to user-specific socket');
        socket.emit('join', userId); // 🔗 Join phòng theo userId
    });

    socket.on('disconnect', () => {
        console.warn('🔴 Disconnected from user-specific socket');
    });

    // 🔔 Nhận thông báo riêng (notification)
    socket.on(SOCKET_EVENTS.CREATE_COMMENT, (data) => {
        dispatch(createComment.fulfilled(data));
        dispatch(addNotification({ type: 'comment', data }));
        toast(`💬 Bình luận mới trong issue "${data.issueTitle}"`);
    });

    socket.on(SOCKET_EVENTS.UPDATE_COMMENT, (data) => {
        dispatch(updateComment.fulfilled(data));
        toast(`✏️ Bình luận đã được cập nhật`);
    });

    socket.on(SOCKET_EVENTS.DELETE_COMMENT, (data) => {
        dispatch(deleteComment.fulfilled(data));
        toast(`🗑️ Một bình luận đã bị xóa`);
    });

    // 💬 Tin nhắn riêng (nếu có chat 1-1)
    socket.on(SOCKET_EVENTS.DIRECT_MESSAGE, (data) => {
        dispatch(receiveMessage(data)); // Giả sử bạn có slice xử lý tin nhắn cá nhân
        toast(`📨 Tin nhắn mới từ ${data.senderName}`);
    });
};
