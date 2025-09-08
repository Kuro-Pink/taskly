import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/comments'; // Điều chỉnh nếu khác

// ========== ASYNC ACTIONS ==========

// Thêm comment
export const createComment = createAsyncThunk('comment/createComment', async (data) => {
    const res = await axios.post(API_URL, data);
    return res.data;
});

// Sửa comment
export const updateComment = createAsyncThunk('comment/updateComment', async ({ id, data }) => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
});

// Xóa comment
export const deleteComment = createAsyncThunk('comment/deleteComment', async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
});

// ========== SLICE ==========

const commentSlice = createSlice({
    name: 'comment',
    initialState: {
        comments: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // CREATE
            .addCase(createComment.fulfilled, (state, action) => {
                state.comments.push(action.payload);
            })

            // UPDATE
            .addCase(updateComment.fulfilled, (state, action) => {
                const index = state.comments.findIndex((c) => c._id === action.payload._id);
                if (index !== -1) {
                    state.comments[index] = action.payload;
                }
            })

            // DELETE
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.comments = state.comments.filter((c) => c._id !== action.payload);
            });
    },
});

export default commentSlice.reducer;
