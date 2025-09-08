import { createSlice } from '@reduxjs/toolkit';

const inviteSlice = createSlice({
    name: 'invite',
    initialState: {
        token: null,
    },
    reducers: {
        setInviteToken: (state, action) => {
            state.token = action.payload;
        },
        clearInviteToken: (state) => {
            state.token = null;
        },
    },
});

export const { setInviteToken, clearInviteToken } = inviteSlice.actions;
export default inviteSlice.reducer;
