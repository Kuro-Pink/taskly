import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base API endpoint
const API_URL = '/api/timeline/epics';

// 📥 Lấy danh sách Epic theo projectId
export const fetchAllEpics = createAsyncThunk('epics/fetchByProject', async (thunkAPI) => {
    try {
        const res = await axios.get(`${API_URL}`);
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

// ➕ Tạo Epic mới
export const createEpic = createAsyncThunk('epics/create', async (epicData, thunkAPI) => {
    try {
        const res = await axios.post(`${API_URL}/create`, epicData);
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

// ✏️ Cập nhật Epic
export const updateEpic = createAsyncThunk('epics/update', async ({ id, updates }, thunkAPI) => {
    try {
        const res = await axios.put(`${API_URL}/${id}`, updates);
        return res.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
    }
});

// ❌ Xoá Epic
export const deleteEpic = createAsyncThunk('epics/delete', async (id, thunkAPI) => {
    try {
        await axios.delete(`${API_URL}/${id}`);
        return id;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response.data);
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
