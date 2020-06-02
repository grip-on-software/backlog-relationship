import { Dispatch, createSlice } from '@reduxjs/toolkit';
import JiraApi from "jira-client";

export interface Board {
  id: number,
  label: string,
};

interface Sprint {
  id: number,
  label: string,
  startDate: number,
  endDate: number,
  completeDate: number,
}

interface State {
  boards: Board[],
  sprints: Sprint[],
}

const initialState: State = {
  boards: [],
  sprints: [],
};

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

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    addBoards: (state: State, { payload }: { payload: Board[] }) => {
      state.boards = state.boards.concat(payload);
    },
    addSprints: (state: State, { payload }: { payload: Sprint[] }) => {
      state.sprints = state.sprints.concat(payload);
    },
  },
});

export const { addBoards, addSprints } = dataSlice.actions;
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
        dispatch(addBoards(boards));
        if (!response.isLast) fetchBoards(startAt+1);
      })
      .catch((error: Error) => {
        console.error(error);
      });
  };
}

export const fetchSprints = (boardId: number, startAt = 0, maxResults = 50) => {
  return async (dispatch: Dispatch) => {
    jira.getAllSprints(boardId.toString(), startAt*maxResults, (startAt+1)*maxResults)
      .then((response: any) => {
        const sprints = response.values.map((sprint: any) => ({
          id: sprint.id,
          label: sprint.name,
          startDate: Date.parse(sprint.startDate),
          endDate: Date.parse(sprint.endDate),
          completeDate: Date.parse(sprint.completeDate),
        }));
        dispatch(addSprints(sprints));
        if (!response.isLast) fetchSprints(startAt+1);
      })
      .catch((error: Error) => {
        console.error(error);
      });
  };
}
