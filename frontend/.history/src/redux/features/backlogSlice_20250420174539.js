import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/backlog';

// 🟢 **Lấy toàn bộ Issue**
export const fetchAllIssue = createAsyncThunk('backlog/fetchAllIssue', async (_, { rejectWithValue, getState }) => {
    try {
        const token = getState().auth.token;

        if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${API_URL}/issues`, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi lấy danh sách issue' });
    }
});

// 🟢 **Lấy Issue theo ID**
export const fetchIssueById = createAsyncThunk(
    'backlog/fetchIssueById',
    async (issueId, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_URL}/issues/${issueId}`, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi lấy issue' });
        }
    },
);

// 🟢 **Lấy toàn bộ Sprint**
export const fetchAllSprint = createAsyncThunk('backlog/fetchAllSprint', async (_, { rejectWithValue, getState }) => {
    try {
        const token = getState().auth.token;

        if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${API_URL}/sprints`, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi lấy danh sách sprint' });
    }
});

// 🟢 **Lấy Sprint theo ID**
export const fetchSprintById = createAsyncThunk(
    'backlog/fetchSprintById',
    async (sprintId, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get(`${API_URL}/sprints/${sprintId}`, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi lấy sprint' });
        }
    },
);

// 🟢 **Thêm Issue**
export const createIssue = createAsyncThunk(
    'backlog/createIssue',
    async ({ title, type, project, status, epic }, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
            const response = await axios.post(`${API_URL}/issues`, { title, type, project, status, epic }, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi tạo issue' });
        }
    },
);

// 🟢 **Sửa Issue**
export const updateIssue = createAsyncThunk(
    'backlog/updateIssue',
    async ({ issueId, updates }, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
            const response = await axios.put(`${API_URL}/issues/${issueId}`, updates, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi cập nhật issue' });
        }
    },
);

// 🟢 **Xóa Issue**
export const deleteIssue = createAsyncThunk('backlog/deleteIssue', async (issueId, { rejectWithValue, getState }) => {
    try {
        const token = getState().auth.token;
        if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${API_URL}/issues/${issueId}`, config);
        return issueId;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi xóa issue' });
    }
});

// 🟢 **Thêm Sprint**
export const createSprint = createAsyncThunk(
    'backlog/createSprint',
    async (sprintData, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } };
            const response = await axios.post(`${API_URL}/sprints`, sprintData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi tạo sprint' });
        }
    },
);

/// 🟢 Cập nhật Sprint
export const updateSprint = createAsyncThunk(
    'backlog/updateSprint',
    async ({ sprintId, updates }, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) throw new Error('Không có token xác thực');

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.put(`${API_URL}/sprints/${sprintId}`, updates, config);

            if (!response.data || !response.data._id) {
                return rejectWithValue({ message: 'Dữ liệu trả về không hợp lệ' });
            }

            return response.data; // ✅ Trả về sprint đã cập nhật
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message || 'Lỗi khi cập nhật sprint' });
        }
    },
);

// 🟢 **Xóa Sprint**
export const deleteSprint = createAsyncThunk(
    'backlog/deleteSprint',
    async (sprintId, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API_URL}/sprints/${sprintId}`, config);
            return sprintId;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi xóa sprint' });
        }
    },
);

export const startSprint = createAsyncThunk('backlog/startSprint', async (sprintId, { rejectWithValue, getState }) => {
    try {
        const token = getState().auth.token;
        if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.put(`${API_URL}/sprints/${sprintId}/start`, {}, config);

        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi bắt đầu sprint' });
    }
});

// 🟢 **Di chuyển Issue sang Sprint**
export const moveIssueToSprint = createAsyncThunk(
    'backlog/moveToSprint',
    async ({ issueId, sprintId }, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.put(`${API_URL}/moveIssue/${issueId}/toSprint/${sprintId}`, {}, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi di chuyển issue vào sprint' });
        }
    },
);

// 🟢 **Di chuyển Issue về Backlog**
export const moveIssueToBacklog = createAsyncThunk(
    'backlog/moveToBacklog',
    async ({ issueId }, { rejectWithValue, getState }) => {
        try {
            const token = getState().auth.token;
            if (!token) return rejectWithValue({ message: 'Không có token xác thực' });

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.put(`${API_URL}/moveIssue/${issueId}/toBacklog`, { sprint: null }, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi di chuyển issue về backlog' });
        }
    },
);

// 🟢 **Redux Slice**
const backlogSlice = createSlice({
    name: 'backlog',
    initialState: {
        issues: [],
        sprints: [],
        selectedIssue: null,
        selectedSprint: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // 🟢 Lấy danh sách Issue
            .addCase(fetchAllIssue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllIssue.fulfilled, (state, action) => {
                state.loading = false;
                state.issues = action.payload;
            })
            .addCase(fetchAllIssue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🟢 Lấy Issue theo ID
            .addCase(fetchIssueById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchIssueById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedIssue = action.payload; // Lưu thông tin Issue vào state
            })
            .addCase(fetchIssueById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🟢 Lấy danh sách Sprint
            .addCase(fetchAllSprint.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllSprint.fulfilled, (state, action) => {
                state.loading = false;
                state.sprints = action.payload;
            })
            .addCase(fetchAllSprint.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🟢 Lấy Sprint theo ID
            .addCase(fetchSprintById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSprintById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedSprint = action.payload; // Lưu thông tin Sprint vào state
            })
            .addCase(fetchSprintById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🟢 Thêm Issue
            .addCase(createIssue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createIssue.fulfilled, (state, action) => {
                state.loading = false;
                state.issues.push(action.payload);
            })
            .addCase(createIssue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🟢 Sửa Issue
            .addCase(updateIssue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateIssue.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.issues.findIndex((issue) => issue.id === action.payload._id);
                if (index !== -1) {
                    state.issues[index] = action.payload;
                }
            })
            .addCase(updateIssue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🟢 Xóa Issue
            .addCase(deleteIssue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteIssue.fulfilled, (state, action) => {
                state.loading = false;
                state.issues = state.issues.filter((issue) => issue.id !== action.payload);
            })
            .addCase(deleteIssue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🟢 Thêm Sprint
            .addCase(createSprint.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createSprint.fulfilled, (state, action) => {
                state.loading = false;
                state.sprints.push(action.payload);
            })
            .addCase(createSprint.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🟢 Sửa Sprint
            .addCase(updateSprint.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSprint.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.sprints.findIndex((sprint) => sprint.id === action.payload._id);
                if (index !== -1) {
                    state.sprints[index] = action.payload;
                }
            })
            .addCase(updateSprint.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🟢 Xóa Sprint
            .addCase(deleteSprint.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSprint.fulfilled, (state, action) => {
                state.loading = false;
                state.sprints = state.sprints.filter((sprint) => sprint.id !== action.payload);
            })
            .addCase(deleteSprint.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🟢 Bắt đầu Sprint
            .addCase(startSprint.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(startSprint.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // Optionally: cập nhật lại danh sách sprint nếu cần fetch lại
            })
            .addCase(startSprint.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Đã xảy ra lỗi khi bắt đầu sprint';
            })

            // 🟢 Di chuyển Issue vào Sprint
            .addCase(moveIssueToSprint.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(moveIssueToSprint.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.issues.findIndex((issue) => issue.id === action.payload.id);
                if (index !== -1) {
                    state.issues[index] = action.payload;
                }
            })
            .addCase(moveIssueToSprint.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // 🟢 Di chuyển Issue về Backlog
            .addCase(moveIssueToBacklog.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(moveIssueToBacklog.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.issues.findIndex((issue) => issue.id === action.payload.id);
                if (index !== -1) {
                    state.issues[index] = action.payload;
                }
            })
            .addCase(moveIssueToBacklog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default backlogSlice.reducer;
