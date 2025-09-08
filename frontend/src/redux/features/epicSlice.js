import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/timeline/epics';

// 📥 Lấy danh sách Epic theo projectId
export const fetchAllEpics = createAsyncThunk('epics/fetchAllProject', async (_, { rejectWithValue, getState }) => {
    try {
        const token = getState().auth.token;

        if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        const res = await axios.get(`${API_URL}`, config);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data || { message: 'Lỗi khi lấy danh sách Epic' });
    }
});

// ➕ Tạo Epic mới
export const createEpic = createAsyncThunk('epics/create', async (epicData, { rejectWithValue, getState }) => {
    try {
        const token = getState().auth.token;

        if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        };

        const res = await axios.post(`${API_URL}/create`, epicData, config);
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data || { message: 'Lỗi khi tạo Epic' });
    }
});

// ✏️ Cập nhật Epic
export const updateEpic = createAsyncThunk(
    'epics/update',
    async ({ epicId, updates }, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;

            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const res = await axios.put(`${API_URL}/${epicId}`, updates, config);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || { message: 'Lỗi khi cập nhật Epic' });
        }
    },
);

// ❌ Xoá Epic
export const deleteEpic = createAsyncThunk('epics/delete', async (epicId, { rejectWithValue, getState }) => {
    try {
        const token = getState().auth.token;

        if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        await axios.delete(`${API_URL}/${epicId}`, config);
        return epicId;
    } catch (err) {
        return rejectWithValue(err.response?.data || { message: 'Lỗi khi xoá Epic' });
    }
});

const epicSlice = createSlice({
    name: 'epics',
    initialState: {
        epics: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // FETCH
            .addCase(fetchAllEpics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllEpics.fulfilled, (state, action) => {
                state.loading = false;
                state.epics = action.payload;
            })
            .addCase(fetchAllEpics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // CREATE
            .addCase(createEpic.fulfilled, (state, action) => {
                state.epics.push(action.payload);
            })

            // UPDATE
            .addCase(updateEpic.fulfilled, (state, action) => {
                const index = state.epics.findIndex((e) => e._id === action.payload._id);
                if (index !== -1) state.epics[index] = action.payload;
            })

            // DELETE
            .addCase(deleteEpic.fulfilled, (state, action) => {
                state.epics = state.epics.filter((e) => e._id !== action.payload);
            });
    },
});

export default epicSlice.reducer;
