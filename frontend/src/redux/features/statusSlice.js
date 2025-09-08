import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/backlog/status'; // Thay bằng URL API của bạn

// 🟢 **Lấy tất cả các trạng thái**
export const fetchStatuses = createAsyncThunk('statuses/fetchAll', async (_, { rejectWithValue, getState }) => {
    try {
        const token = getState().auth.token; // Lấy token từ Redux store

        if (!token) {
            return rejectWithValue({ message: 'Không có token xác thực' });
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        const response = await axios.get(API_URL, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi lấy danh sách trạng thái' });
    }
});

// 🟢 **Lấy trạng thái theo ID**
export const fetchStatusById = createAsyncThunk(
    'statuses/fetchById',
    async (statusId, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_URL}/${statusId}`, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi lấy trạng thái' });
        }
    },
);

// 🟢 **Thêm trạng thái mới**
export const createStatus = createAsyncThunk('statuses/create', async (statusData, { rejectWithValue, getState }) => {
    try {
        const token = getState().auth.token;

        if (!token) {
            return rejectWithValue({ message: 'Không có token xác thực' });
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        };

        const response = await axios.post(`${API_URL}/create`, statusData, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi tạo trạng thái' });
    }
});

// 🟢 **Cập nhật trạng thái**
export const updateStatus = createAsyncThunk(
    'statuses/update',
    async ({ statusId, updatedData }, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;

            if (!token) {
                return rejectWithValue({ message: 'Không có token xác thực' });
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.put(`${API_URL}/${statusId}`, updatedData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi cập nhật trạng thái' });
        }
    },
);

// 🟢 **Xóa trạng thái**
export const deleteStatus = createAsyncThunk('statuses/delete', async (statusId, { rejectWithValue, getState }) => {
    try {
        const token = getState().auth.token;

        if (!token) {
            return rejectWithValue({ message: 'Không có token xác thực' });
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        await axios.delete(`${API_URL}/${statusId}`, config);
        return statusId;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi xóa trạng thái' });
    }
});

// 🟢 **Redux Slice**
const statusSlice = createSlice({
    name: 'statuses',
    initialState: {
        statuses: [], // Lưu danh sách trạng thái
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // 🔵 Fetch all statuses
            .addCase(fetchStatuses.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStatuses.fulfilled, (state, action) => {
                state.loading = false;
                state.statuses = action.payload;
            })
            .addCase(fetchStatuses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // 🟢 Lấy trạng thái theo ID
            .addCase(fetchStatusById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStatusById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedStatus = action.payload; // Lưu thông tin trạng thái được chọn vào state
            })
            .addCase(fetchStatusById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // 🔵 Create status
            .addCase(createStatus.fulfilled, (state, action) => {
                state.statuses.push(action.payload);
            })
            // 🔵 Update status
            .addCase(updateStatus.fulfilled, (state, action) => {
                state.statuses = state.statuses.map((status) =>
                    status._id === action.payload ? action.payload : status,
                );
            })
            // 🔵 Delete status
            .addCase(deleteStatus.fulfilled, (state, action) => {
                state.statuses = state.statuses.filter((status) => status._id !== action.payload);
            });
    },
});

export default statusSlice.reducer;
