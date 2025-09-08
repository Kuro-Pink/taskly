import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        toasts: [],
        unreadCount: 0,
    },
    reducers: {
        addNotification: (state, action) => {
            state.toasts.push(action.payload);
            state.unreadCount += 1;
        },
        clearNotifications: (state) => {
            state.toasts = [];
            state.unreadCount = 0;
        },
    },
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
