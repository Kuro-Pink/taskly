import { createSlice } from '@reduxjs/toolkit';

const modalSlice = createSlice({
    name: 'modal',
    initialState: {
        open: false,
        mode: null, // 'create' | 'edit'
        type: null, // 'epic' | 'issue' | 'subIssue'
        data: null, // Dữ liệu liên quan (parentId, existing task...)
    },
    reducers: {
        openModal: (state, action) => {
            const payload = action.payload || {};
            const { mode, type, data } = payload;
            state.open = true;
            state.mode = mode;
            state.type = type;
            state.data = data;
        },

        closeModal: (state) => {
            state.open = false;
            state.mode = null;
            state.type = null;
            state.data = null;
        },
    },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
