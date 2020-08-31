import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { jira } from './auth';

interface State {
  avatarURL?: string,
  displayName?: string,
  emailAddress?: string,
  username?: string,
}

export const getCurrentUser = createAsyncThunk(
  "data/getCurrentUser",
  async () => {
    return jira.myself.getMyself();
  }
);

const initialState: State = {};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {

  },
  extraReducers: builder => {
    builder.addCase(
      getCurrentUser.fulfilled,
      (state: State, { payload }: any) => {
        state.avatarURL = payload.avatarUrls["48x48"];
        state.displayName = payload.displayName;
        state.emailAddress = payload.emailAddress;
        state.username = payload.name
      }
    );
  },
});

// export const {  } = userSlice.actions;
export const userSelector = (state: any) => state.user as State;
export default userSlice.reducer;
