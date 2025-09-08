// ========== ASYNC ACTIONS ==========

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/comments';

// 🆕 Thêm comment
export const createComment = createAsyncThunk(
    'comments/createComment',
    async ({ issueId, content, user }, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const res = await axios.post(API_URL, { issueId, content }, config);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi thêm bình luận' });
        }
    },
);

// ✏️ Sửa comment
export const updateComment = createAsyncThunk(
    'comments/updateComment',
    async ({ commentId, content }, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const res = await axios.put(`${API_URL}/${commentId}`, { content }, config);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi sửa bình luận' });
        }
    },
);

// 🗑️ Xoá comment
export const deleteComment = createAsyncThunk(
    'comments/deleteComment',
    async (commentId, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.delete(`${API_URL}/${commentId}`, config);
            return { commentId };
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi xoá bình luận' });
        }
    },
);

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
