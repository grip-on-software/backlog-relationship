import { Dispatch, createSlice } from '@reduxjs/toolkit';
import JiraApi from "jira-client";

import { addAlert } from './alerts';
import { type } from 'os';

export interface Board {
  id: number,
  label: string,
};

interface State {
  boards: Board[],
}

const jira = new JiraApi({
  protocol: "http",
  host: "192.168.178.186",
  port: "3001",
  username: process.env.REACT_APP_JIRA_USERNAME,
  password: process.env.REACT_APP_JIRA_PASSWORD,
  apiVersion: "1",
  base: "jira",
  strictSSL: true,
});

const initialState: State = {
  boards: [],
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    addBoards: (state: State, { payload }: { payload: Board[] }) => {
      state.boards = state.boards.concat(payload);
    },
  },
});

export const { addBoards } = dataSlice.actions;
export const dataSelector = (state: any) => state.data as State;
export default dataSlice.reducer;

export const fetchBoards = (startAt = 0, maxResults = 50) => {
  return async (dispatch: Dispatch) => {
    jira.getAllBoards(startAt*maxResults, (startAt+1)*maxResults, "scrum")
      .then((response: any) => {
        const boards = response.values.map((board: any) => ({
          id: board.id,
          label: board.name,
        }));
        console.log(boards);
        dispatch(addBoards(boards));
        if (!response.isLast) fetchBoards(startAt+1);
      })
      .catch((error: Error) => {
        console.error(error);
      });
  };
}
