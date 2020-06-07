import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import JiraClient from "jira-connector";

interface State {
  avatarURL?: string,
  displayName?: string,
  email?: string,
  isLoggedIn: boolean,
  loginFailed: boolean,
  loginPending: boolean,
  username?: string,
}

const initialState: State = {
  isLoggedIn: false,
  loginFailed: false,
  loginPending: false,
};

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async () => {
    const jira = new JiraClient({
      host: "192.168.178.186",
      protocol: "http",
      port: 3000,
      path_prefix: "jira/",
    });
    return await jira.auth.currentUser();
  }
);

export const getMyself = createAsyncThunk(
  "auth/getMyself",
  async () => {
    const jira = new JiraClient({
      host: "192.168.178.186",
      protocol: "http",
      port: 3000,
      path_prefix: "jira/",
    });
    return await jira.myself.getMyself();
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: {username: string, password: string}) => {
    const jira = new JiraClient({
      host: "192.168.178.186",
      protocol: "http",
      port: 3000,
      path_prefix: "jira/",
      basic_auth: {
        username: credentials.username,
        password: credentials.password,
      },
    });
    return await jira.myself.getMyself();
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
  },
  extraReducers: builder => {
    builder.addCase(
      getCurrentUser.fulfilled,
      (state: State, { payload }: any) => {
        state.isLoggedIn = true;
      }
    );
    builder.addCase(
      login.pending,
      (state: State) => {
        state.loginPending = true;
      }
    );
    builder.addCase(
      login.rejected,
      (state: State) => {
        state.loginFailed = true;
        state.loginPending = false;
      }
    );
    builder.addCase(
      login.fulfilled,
      (state: State, { payload }: any) => {
        state.isLoggedIn = true;
        state.loginFailed = false;
        state.loginPending = false;
        state.username = payload.name;
      }
    );
    builder.addCase(
      getMyself.fulfilled,
      (state: State, { payload }: any) => {
        state.avatarURL = payload.avatarUrls["48x48"];
        state.displayName = payload.displayName;
        state.email = payload.emailAddress;
      }
    );
  }
});

export const {} = authSlice.actions;
export const authSelector = (state: any) => state.auth as State;
export default authSlice.reducer;