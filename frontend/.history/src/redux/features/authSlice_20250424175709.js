import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Lấy thông tin người dùng
export const getUserInfo = createAsyncThunk('auth/getUserInfo', async (token) => {
    try {
        const response = await axios.post(`${API_URL}/user`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data; // Trả về dữ liệu người dùng
    } catch (error) {
        throw new Error('Không thể lấy thông tin người dùng');
    }
});

// 📝 Đăng ký người dùng mới
export const registerUser = createAsyncThunk('auth/registerUser', async (userData, thunkAPI) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
    }
});

// 📝 Đăng nhập người dùng
export const loginUser = createAsyncThunk('auth/loginUser', async (userData, thunkAPI) => {
    try {
        const response = await axios.post(`${API_URL}/login`, userData);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data);
    }
});

// 🔹 Redux slice để quản lý Auth
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null, // ❌ Không lấy user từ localStorage nữa
        token: null, // ❌ Không lấy token từ localStorage nữa
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
