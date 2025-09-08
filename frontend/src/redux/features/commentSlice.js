// ========== ASYNC ACTIONS ==========

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/comments';

// 📥 Lấy comments theo issue
export const getCommentsByIssue = createAsyncThunk(
    'comments/getByIssue',
    async (issueId, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };
            const res = await axios.get(`${API_URL}/${issueId}`, config);
            return res.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi tải bình luận' });
        }
    },
);

// 🆕 Thêm comment
export const createComment = createAsyncThunk(
    'comments/createComment',
    async ({ issueId, content }, { rejectWithValue, getState }) => {
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
        console.log(commentId, content);

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
            // GET
            .addCase(getCommentsByIssue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCommentsByIssue.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload;
            })
            .addCase(getCommentsByIssue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Lỗi tải bình luận';
            })

            // CREATE
            .addCase(createComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createComment.fulfilled, (state, action) => {
                state.loading = false;
                state.comments.push(action.payload);
            })
            .addCase(createComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Lỗi thêm bình luận';
            })

            // UPDATE
            .addCase(updateComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.comments.findIndex((c) => c._id === action.payload._id);
                if (index !== -1) {
                    state.comments[index] = action.payload;
                }
            })
            .addCase(updateComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Lỗi sửa bình luận';
            })

            // DELETE
            .addCase(deleteComment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = state.comments.filter((c) => c._id !== action.payload.commentId);
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Lỗi xoá bình luận';
            });
    },
});

export default commentSlice.reducer;
