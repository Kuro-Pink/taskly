// modalDetailSlice.js
import { createSlice } from '@reduxjs/toolkit';

const detailModalSlice = createSlice({
    name: 'detailModal',
    initialState: {
        open: false,
        task: null,
    },
    reducers: {
        openDetailModal: (state, action) => {
            state.open = true;
            state.task = action.payload;
        },
        closeDetailModal: (state) => {
            state.open = false;
            state.task = null;
        },
    },
});

export const { openDetailModal, closeDetailModal } = detailModalSlice.actions;
export default detailModalSlice.reducer;
