import { Dispatch, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { jira } from './auth';

export interface Board {
  id: number,
  label: string,
};

interface Issue {
  id: number,
  key: string,
  created: number,
  issueTypeId: number,
  summary: string,
};

interface Sprint {
  id: number,
  label: string,
  startDate: number,
  endDate: number,
  completeDate: number,
};

interface State {
  boards: Board[],
  issues: Issue[],
  sprints: Sprint[],
  user?: User,
};

interface User {
  avatarURL: string,
  displayName: string,
  emailAddress: string,
  username: string,
};

export const getCurrentUser = createAsyncThunk(
  "data/getCurrentUser",
  async () => {
    return await jira.myself.getMyself();
  }
);

const initialState: State = {
  boards: [],
  issues: [],
  sprints: [],
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    addBoards: (state: State, { payload }: { payload: Board[] }) => {
      state.boards = state.boards.concat(payload);
    },
    addIssues: (state: State, { payload }: { payload: Issue[] }) => {
      state.issues = state.issues.concat(payload);
    },
    addSprints: (state: State, { payload }: { payload: Sprint[] }) => {
      state.sprints = state.sprints.concat(payload);
    },
  },
  extraReducers: builder => {
    builder.addCase(
      getCurrentUser.fulfilled,
      (state: State, { payload }: any) => {
        state.user = {
          avatarURL: payload.avatarUrls["48x48"],
          displayName: payload.displayName,
          emailAddress: payload.emailAddress,
          username: payload.name,
        } as User;
      }
    );
  },
});

export const { addBoards, addIssues, addSprints } = dataSlice.actions;
export const dataSelector = (state: any) => state.data as State;
export default dataSlice.reducer;

export const fetchBoards = () => {
  return async (dispatch: Dispatch) => {
    const getAllBoards = async (startAt?: number, maxResults?: number) =>
      await jira.board.getAllBoards({
        maxResults: maxResults,
        startAt: startAt,
        type: "scrum",
      })
      .then(
        (response: any) => {
          dispatch(addBoards(response.values.map(
            (board: any) => ({
                id: board.id,
                label: board.name,
              })
          )));
          if (!response.isLast) {
            getAllBoards(response.startAt + response.maxResults, response.maxResults)
          }
        }
      )
      .catch(
        (error: Error) => {
          console.error(error);
        }
      );
    getAllBoards();
  }
}

export const fetchIssues = (boardId: number) => {
  return async (dispatch: Dispatch) => {
    const getIssuesForBoard = async (boardId: number, startAt?: number, maxResults?: number) =>
      await jira.board.getIssuesForBoard({
        boardId: boardId,
        fields: ["issuetype", "summary"],
        maxResults: maxResults,
        startAt: startAt,
      })
      .then(
        (response: any) => {
          dispatch(addIssues(response.issues.map(
            (issue: any) => ({
                id: parseInt(issue.id),
                key: issue.key,
                created: Date.parse(issue.fields.created),
                issueTypeId: parseInt(issue.fields.issuetype.id),
                summary: issue.summary
              })
          )));
          if (response.total > response.startAt + response.maxResults) {
            getIssuesForBoard(boardId, response.startAt + response.maxResults, response.maxResults)
          }
        }
      )
      .catch(
        (error: Error) => {
          console.error(error);
        }
      );
    getIssuesForBoard(boardId);
  }
}

export const fetchSprints = (boardId: number) => {
  return async (dispatch: Dispatch) => {
    const getAllSprints = async (boardId: number, startAt?: number, maxResults?: number) =>
      await jira.board.getAllSprints({
        boardId: boardId,
        maxResults: maxResults,
        startAt: startAt,
      })
      .then(
        (response: any) => {
          dispatch(addSprints(response.values.map(
            (sprint: any) => ({
                id: sprint.id,
                label: sprint.name,
                startDate: Date.parse(sprint.startDate),
                endDate: Date.parse(sprint.endDate),
                completeDate: Date.parse(sprint.completeDate),
              })
          )));
          if (!response.isLast) {
            getAllSprints(boardId, response.startAt + response.maxResults, response.maxResults)
          }
        }
      )
      .catch(
        (error: Error) => {
          console.error(error);
        }
      );
      getAllSprints(boardId);
  }
}
