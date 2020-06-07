import { Dispatch, createSlice } from '@reduxjs/toolkit';
import { jira } from './auth';

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
  issues: Issue[],
  sprints: Sprint[],
};

const initialState: State = {
  issues: [],
  sprints: [],
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    addIssues: (state: State, { payload }: { payload: Issue[] }) => {
      state.issues = state.issues.concat(payload);
    },
    addSprints: (state: State, { payload }: { payload: Sprint[] }) => {
      state.sprints = state.sprints.concat(payload);
    },
  },
});

export const { addIssues, addSprints } = dataSlice.actions;
export const dataSelector = (state: any) => state.data as State;
export default dataSlice.reducer;

export const fetchIssues = (boardId: number) => {
  return async (dispatch: Dispatch) => {
    const getIssuesForBoard = async (boardId: number, startAt?: number, maxResults?: number) =>
      await jira.board.getIssuesForBoard({
        boardId: boardId,
        fields: ["created","issuetype", "summary"],
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
            // getIssuesForBoard(boardId, response.startAt + response.maxResults, response.maxResults)
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
