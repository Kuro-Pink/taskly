import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API URL
const API_URL = 'http://localhost:5000/api/sprints';

// 🟢 Fetch tất cả Sprint
export const fetchSprints = createAsyncThunk('sprints/fetchSprints', async () => {
    const response = await axios.get(API_URL);
    return response.data;
});

// 🟢 Thêm Sprint mới
export const addSprint = createAsyncThunk('sprints/addSprint', async (sprintData) => {
    const response = await axios.post(API_URL, sprintData);
    return response.data;
});

// 🟢 Cập nhật Sprint
export const updateSprint = createAsyncThunk('sprints/updateSprint', async ({ id, sprintData }) => {
    const response = await axios.put(`${API_URL}/${id}`, sprintData);
    return response.data;
});

// 🟢 Xóa Sprint
export const deleteSprint = createAsyncThunk('sprints/deleteSprint', async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
});

const sprintSlice = createSlice({
    name: 'sprints',
    initialState: { sprints: [], loading: false, error: null },
    reducers: {
        // 🟢 Nhận dữ liệu real-time từ WebSocket
        sprintUpdatedFromSocket: (state, action) => {
            const sprintIndex = state.sprints.findIndex((sprint) => sprint._id === action.payload._id);
            if (sprintIndex !== -1) {
                state.sprints[sprintIndex] = action.payload;
            }
        },
        sprintDeletedFromSocket: (state, action) => {
            state.sprints = state.sprints.filter((sprint) => sprint._id !== action.payload);
        },
        sprintAddedFromSocket: (state, action) => {
            state.sprints.push(action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSprints.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSprints.fulfilled, (state, action) => {
                state.loading = false;
                state.sprints = action.payload;
            })
            .addCase(fetchSprints.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(addSprint.fulfilled, (state, action) => {
                state.sprints.push(action.payload);
            })
            .addCase(updateSprint.fulfilled, (state, action) => {
                const index = state.sprints.findIndex((sprint) => sprint._id === action.payload._id);
                if (index !== -1) {
                    state.sprints[index] = action.payload;
                }
            })
            .addCase(deleteSprint.fulfilled, (state, action) => {
                state.sprints = state.sprints.filter((sprint) => sprint._id !== action.payload);
            });
    },
});

export const { sprintUpdatedFromSocket, sprintDeletedFromSocket, sprintAddedFromSocket } = sprintSlice.actions;
export default sprintSlice.reducer;
