import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/projects';

// 🟢 **Lấy toàn bộ dự án**
export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue, getState }) => {
    try {
        const token = getState().auth.token; // ✅ Lấy token từ Redux store

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
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi lấy danh sách dự án' });
    }
});

// 🟢 **Lấy dự án theo ID**
export const fetchProjectById = createAsyncThunk(
    'projects/fetchById',
    async (projectId, { rejectWithValue, getState }) => {
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

            const response = await axios.get(`${API_URL}/${projectId}`, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi lấy thông tin dự án' });
        }
    },
);

// 🟢 **Tạo dự án mới**
export const createProject = createAsyncThunk('projects/create', async (projectData, { rejectWithValue, getState }) => {
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

        const response = await axios.post(`${API_URL}/create`, projectData, config);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi tạo dự án' });
    }
});

// 🟢 **Cập nhật dự án**
export const updateProject = createAsyncThunk(
    'projects/update',
    async ({ projectId, updatedData }, { rejectWithValue, getState }) => {
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

            const response = await axios.put(`${API_URL}/${projectId}`, updatedData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: 'Lỗi khi cập nhật dự án' });
        }
    },
);

// 🟢 **Xóa dự án**
export const deleteProject = createAsyncThunk('projects/delete', async (projectId, { rejectWithValue, getState }) => {
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

        await axios.delete(`${API_URL}/${projectId}`, config);
        return projectId;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi xóa dự án' });
    }
});

export const requestJoinProject = createAsyncThunk(
    'projects/requestJoin',
    async ({ inviteCode }, { rejectWithValue, getState }) => {
      try {
        const token = getState().auth.token;
        if (!token) return rejectWithValue({ message: 'Không có token xác thực' });
  
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
  
        const response = await axios.post(`${API_URL}/join/${inviteCode}`, {}, config);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi gửi yêu cầu tham gia' });
      }
    }
  );

  export const respondJoinRequest = createAsyncThunk(
    'projects/respondJoinRequest',
    async ({ projectId, userId, action }, { rejectWithValue, getState }) => {
      try {
        const token = getState().auth.token;
        if (!token) return rejectWithValue({ message: 'Không có token xác thực' });
  
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
  
        const response = await axios.post(`${API_URL}/respond-invite`, { projectId, userId, action }, config);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi duyệt yêu cầu tham gia' });
      }
    }
  );

  export const getProjectMembers = createAsyncThunk(
    'projects/getMembers',
    async (projectId, { rejectWithValue, getState }) => {
      try {
        const token = getState().auth.token;
        if (!token) return rejectWithValue({ message: 'Không có token xác thực' });
  
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
  
        const response = await axios.get(`${API_URL}/${projectId}/members`, config);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi lấy danh sách thành viên' });
      }
    }
  );

  export const updateMemberRole = createAsyncThunk(
    'projects/updateMemberRole',
    async ({ projectId, userId, newRole }, { rejectWithValue, getState }) => {
      try {
        const token = getState().auth.token;
        if (!token) return rejectWithValue({ message: 'Không có token xác thực' });
  
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
  
        const response = await axios.put(`${API_URL}/${projectId}/update-role`, { userId, newRole }, config);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi cập nhật vai trò thành viên' });
      }
    }
  );

  export const removeMember = createAsyncThunk(
    'projects/removeMember',
    async ({ projectId, userId }, { rejectWithValue, getState }) => {
      try {
        const token = getState().auth.token;
        if (!token) return rejectWithValue({ message: 'Không có token xác thực' });
  
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
  
        const response = await axios.post(`${API_URL}/${projectId}/remove-member`, { userId }, config);
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || { message: 'Lỗi khi xóa thành viên' });
      }
    }
  );
  

// 🟢 **Redux Slice**
const projectSlice = createSlice({
    name: 'projects',
    initialState: {
        projects: [],
        currentProject: null,
        selectedProjectId: null, // ✅ Lưu ID dự án được chọn
        loading: false,
        error: null,
    },
    reducers: {
        setSelectedProjectId: (state, action) => {
            state.selectedProjectId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // 🔵 Fetch all projects
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload.projects;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // 🔵 Fetch project by ID
            .addCase(fetchProjectById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProjectById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProject = action.payload.project;
            })
            .addCase(fetchProjectById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // 🔵 Create project
            .addCase(createProject.pending, (state) => {
                state.loading = true;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.loading = false;
                state.projects.push(action.payload.project);
            })
            .addCase(createProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // 🔵 Delete project
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.projects = state.projects.filter((project) => project._id !== action.payload);
            })
            // 🔵 Update project
            .addCase(updateProject.fulfilled, (state, action) => {
                state.projects = state.projects.map((project) =>
                    project._id === action.payload._id ? action.payload : project,
                );
            });

            // 🔵 Request join project
  .addCase(requestJoinProject.pending, (state) => {
    state.loading = true;
  })
  .addCase(requestJoinProject.fulfilled, (state, action) => {
    state.loading = false;
    // Có thể show notification: "Yêu cầu tham gia đã được gửi"
  })
  .addCase(requestJoinProject.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })

  // 🔵 Respond join request
  .addCase(respondJoinRequest.pending, (state) => {
    state.loading = true;
  })
  .addCase(respondJoinRequest.fulfilled, (state, action) => {
    state.loading = false;
  })
  .addCase(respondJoinRequest.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })

  // 🔵 Get project members
  .addCase(getProjectMembers.pending, (state) => {
    state.loading = true;
  })
  .addCase(getProjectMembers.fulfilled, (state, action) => {
    state.loading = false;
    if (state.currentProject) {
      state.currentProject.members = action.payload.members;
      state.currentProject.pendingInvites = action.payload.pendingInvites;
    }
  })
  .addCase(getProjectMembers.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })

  // 🔵 Update member role
  .addCase(updateMemberRole.pending, (state) => {
    state.loading = true;
  })
  .addCase(updateMemberRole.fulfilled, (state, action) => {
    state.loading = false;
  })
  .addCase(updateMemberRole.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })

  // 🔵 Remove member
  .addCase(removeMember.pending, (state) => {
    state.loading = true;
  })
  .addCase(removeMember.fulfilled, (state, action) => {
    state.loading = false;
  })
  .addCase(removeMember.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  });
    },
});

export const { setSelectedProjectId } = projectSlice.actions;
export default projectSlice.reducer;
