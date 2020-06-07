import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import JiraClient from "jira-connector";

export enum LoginStatus {
  LoggedIn,
  LoggedOut,
  Pending,
}

interface State {
  autoLoginFailed: boolean,
  loginFailed: boolean,
  loginStatus: LoginStatus,
}

const initialState: State = {
  autoLoginFailed: false,
  loginFailed: false,
  loginStatus: LoginStatus.LoggedOut,
};

export const autoLogin = createAsyncThunk(
  "auth/autoLogin",
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
      autoLogin.pending,
      (state: State) => {
        state.loginStatus = LoginStatus.Pending;
      }
    );
    builder.addCase(
      autoLogin.rejected,
      (state: State) => {
        state.autoLoginFailed = true;
        state.loginStatus = LoginStatus.LoggedOut;
      }
    );
    builder.addCase(
      autoLogin.fulfilled,
      (state: State) => {
        state.autoLoginFailed = false;
        state.loginStatus = LoginStatus.LoggedIn;
      }
    );
    builder.addCase(
      login.pending,
      (state: State) => {
        state.loginStatus = LoginStatus.Pending;
      }
    );
    builder.addCase(
      login.rejected,
      (state: State) => {
        state.loginFailed = true;
        state.loginStatus = LoginStatus.LoggedOut;
      }
    );
    builder.addCase(
      login.fulfilled,
      (state: State) => {
        state.loginFailed = false;
        state.loginStatus = LoginStatus.LoggedIn;
      }
    );
  }
});

export const {} = authSlice.actions;
export const authSelector = (state: any) => state.auth as State;
export default authSlice.reducer;