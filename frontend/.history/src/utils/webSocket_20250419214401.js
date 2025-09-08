import { receiveMessage } from '../redux/features/webSocketSlice';
import toast from 'react-hot-toast';

import {
    createIssue,
    updateIssue,
    deleteIssue,
    createSprint,
    updateSprint,
    deleteSprint,
} from '../redux/features/backlogSlice';
import { createEpic, updateEpic, deleteEpic } from '../redux/features/epicSlice';
import { createComment, updateComment, deleteComment } from '../redux/features/commentSlice';

let socket = null;

export const initWebSocket = (dispatch) => {
    socket = new WebSocket('ws://localhost:5000');

    socket.onopen = () => {
        console.log('%c🔌 WebSocket connected', 'color: green; font-weight: bold');
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('%c📩 Message received:', 'color: blue;', data);

            const { type, payload } = data;

            const actionMap = {
                CREATE_ISSUE: () => dispatch(createIssue(payload)),
                UPDATE_ISSUE: () => dispatch(updateIssue(payload)),
                DELETE_ISSUE: () => dispatch(deleteIssue(payload)),

                CREATE_SPRINT: () => dispatch(createSprint(payload)),
                UPDATE_SPRINT: () => dispatch(updateSprint(payload)),
                DELETE_SPRINT: () => dispatch(deleteSprint(payload)),

                CREATE_EPIC: () => dispatch(createEpic(payload)),
                UPDATE_EPIC: () => dispatch(updateEpic(payload)),
                DELETE_EPIC: () => dispatch(deleteEpic(payload)),

                CREATE_COMMENT: () => dispatch(createComment(payload)),
                UPDATE_COMMENT: () => dispatch(updateComment(payload)),
                DELETE_COMMENT: () => dispatch(deleteComment(payload)),
            };

            if (actionMap[type]) {
                actionMap[type]();
            } else {
                dispatch(receiveMessage(data));
            }
        } catch (error) {
            console.error('❗ Error parsing WebSocket message:', error);
        }
    };

    socket.onclose = () => {
        console.warn('%c❌ WebSocket disconnected', 'color: red; font-weight: bold');
    };
};

export const sendMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
        console.log('%c📤 Message sent:', 'color: teal;', message);
    } else {
        console.warn('⚠️ WebSocket is not open. Cannot send message.');
    }
};
