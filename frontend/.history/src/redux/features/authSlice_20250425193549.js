import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// 🟢 Lấy thông tin người dùng
export const getUserInfo = createAsyncThunk('auth/getUserInfo', async (_, { getState, rejectWithValue }) => {
    try {
        const token = getState().auth.token;

        if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${API_URL}/user`, config); // Gọi API lấy thông tin người dùng
        return response.data; // Trả về dữ liệu người dùng
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi lấy thông tin người dùng' });
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
        user: null, // Thông tin người dùng
        token: null, // Token xác thực
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
                state.user = action.payload;
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
                state.user = action.payload;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            })
            // Lấy thông tin người dùng sau khi login thành công
            .addCase(getUserInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload; // Lưu thông tin người dùng
            })
            .addCase(getUserInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
