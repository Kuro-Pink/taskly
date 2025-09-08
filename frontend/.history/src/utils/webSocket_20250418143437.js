// import { receiveMessage } from '../redux/features/webSocketSlice';
// import { addTask, updateTask, deleteTask } from '../redux/features/taskSlice';
// import { addSprint, updateSprint, deleteSprint } from '../redux/features/sprintSlice';
// import { addBoard, updateBoard, deleteBoard } from '../redux/features/boardSlice';

// let socket;

// export const initWebSocket = (dispatch) => {
//     socket = new WebSocket('ws://localhost:5000');

//     socket.onopen = () => {
//         console.log('🔌 Connected to WebSocket');
//     };

//     socket.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         console.log('📩 Received:', data);

//         // Xử lý dữ liệu nhận từ server
//         switch (data.type) {
//             case 'NEW_TASK':
//                 dispatch(addTask(data.payload));
//                 break;
//             case 'UPDATE_TASK':
//                 dispatch(updateTask(data.payload));
//                 break;
//             case 'DELETE_TASK':
//                 dispatch(deleteTask(data.payload));
//                 break;
//             case 'NEW_SPRINT':
//                 dispatch(addSprint(data.payload));
//                 break;
//             case 'UPDATE_SPRINT':
//                 dispatch(updateSprint(data.payload));
//                 break;
//             case 'DELETE_SPRINT':
//                 dispatch(deleteSprint(data.payload));
//                 break;
//             case 'NEW_BOARD':
//                 dispatch(addBoard(data.payload));
//                 break;
//             case 'UPDATE_BOARD':
//                 dispatch(updateBoard(data.payload));
//                 break;
//             case 'DELETE_BOARD':
//                 dispatch(deleteBoard(data.payload));
//                 break;
//             default:
//                 dispatch(receiveMessage(data));
//                 break;
//         }
//     };

//     socket.onclose = () => {
//         console.log('❌ Disconnected from WebSocket');
//     };
// };

// export const sendMessage = (message) => {
//     if (socket) {
//         socket.send(JSON.stringify(message));
//     }
// };
