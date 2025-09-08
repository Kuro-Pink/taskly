import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

const API_URL = '/api/notifications';

// 🟢 Fetch từ DB
export const fetchActivities = createAsyncThunk(
    'notification/fetchActivities',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth?.token;
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.get(`${API_URL}/activities`, config);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: 'Lỗi khi lấy activities' });
        }
    },
);

// 🟢 Fetch từ DB
export const fetchNotifications = createAsyncThunk(
    'notification/fetchNotifications',
    async (_, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth?.token;
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.get(`${API_URL}/notifications`, config);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: 'Lỗi khi lấy activities' });
        }
    },
);

// 🟢 Add 1 notification vào DB
export const saveNotification = createAsyncThunk(
    'notification/saveNotification',
    async (notification, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.post(`${API_URL}/notifications`, notification, config);
            return response.data;
        } catch (err) {
            console.error('❌ saveNotification error:', err);
            return rejectWithValue(err.response?.data || { message: 'Lỗi khi lưu notification' });
        }
    },
);
export const markAsRead = createAsyncThunk('notification/markAsRead', async (id, { rejectWithValue, getState }) => {
    try {
        const token = getState().auth.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.put(`${API_URL}/notifications/${id}/read`, {}, config);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data || { message: 'Error marking as read' });
    }
});

// 🟢 Add 1 activity vào DB
export const saveActivity = createAsyncThunk(
    'activity/saveActivity',
    async (activity, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.post(`${API_URL}/activities`, activity, config);
            return response.data;
        } catch (err) {
            console.error('❌ saveActivity error:', err);
            return rejectWithValue(err.response?.data || { message: 'Lỗi khi lưu activity' });
        }
    },
);

const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        notifications: [],
        activities: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            // Notify - Fetch notifications
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload?.message || 'Lỗi khi tải notifications');
            })
            // Activity - Fetch activities
            .addCase(fetchActivities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActivities.fulfilled, (state, action) => {
                state.loading = false;
                state.activities = action.payload.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            })
            .addCase(fetchActivities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload?.message || 'Lỗi khi tải activities');
            })
            // Save Notification - Check for duplicates within 10 minutes
            .addCase(saveNotification.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(saveNotification.fulfilled, (state, action) => {
                state.loading = false;

                const newNotification = action.payload;

                // Kiểm tra trùng lặp trong vòng 10 phút
                const isDuplicateRecent = state.notifications.some((a) => {
                    const sameUser = a.username === newNotification.username;
                    const sameAction = a.action === newNotification.action;
                    const sameTarget = a.target === newNotification.target;
                    const sameType = a.type === newNotification.type;

                    const aTime = dayjs(a.createdAt || a.updatedAt);
                    const newTime = dayjs(newNotification.createdAt || newNotification.updatedAt);
                    const diffMinutes = Math.abs(aTime.diff(newTime, 'minute'));

                    return sameUser && sameAction && sameTarget && sameType && diffMinutes < 10;
                });

                if (isDuplicateRecent) {
                    console.log('🔁 Notification trùng trong 10 phút, không thêm.');
                    return;
                }

                // Thêm notification mới vào state nếu không trùng
                state.notifications.push(newNotification);
                console.log('✅ Added Notification:', newNotification);
            })
            .addCase(saveNotification.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Lỗi không xác định khi lưu notification';
                console.error('⚠️ Notification rejected:', state.error);
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const index = state.notifications.findIndex((n) => n._id === action.payload._id);
                if (index !== -1) {
                    state.notifications[index].isRead = true;
                }
            })
            // Save Activity - Check for duplicates within 10 minutes
            .addCase(saveActivity.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(saveActivity.fulfilled, (state, action) => {
                const newActivity = action.payload;

                // Kiểm tra trùng lặp trong vòng 10 phút
                const isDuplicateRecent = state.activities.some((a) => {
                    const sameUser = a.username === newActivity.username;
                    const sameAction = a.action === newActivity.action;
                    const sameTarget = a.target === newActivity.target;

                    const aTime = dayjs(a.createdAt || a.updatedAt);
                    const newTime = dayjs(newActivity.createdAt || newActivity.updatedAt);
                    const diffMinutes = Math.abs(aTime.diff(newTime, 'minute'));

                    return sameUser && sameAction && sameTarget && diffMinutes < 10;
                });

                if (isDuplicateRecent) {
                    console.log('Activity trùng trong vòng 10 phút, không thêm.');
                    return;
                }

                // Thêm mới activity vào đầu mảng nếu không trùng
                state.activities.push(newActivity);
            })
            .addCase(saveActivity.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload?.message || 'Lỗi khi lưu activity');
            });
    },
});

export const { addNotification, addActivityLocal, clearNotifications } = notificationSlice.actions;

export default notificationSlice.reducer;
