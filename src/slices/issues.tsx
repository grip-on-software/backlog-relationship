import { createAsyncThunk, createEntityAdapter, createSlice, EntityState } from "@reduxjs/toolkit";

import { jira } from "./auth";

interface GetIssuesForBoardSchema {
  expand: string,
  startAt: number,
  maxResults: number,
  total: number,
  issues: IssueSchema[]
};

interface Issue {
  id: number,
  key: string,
  created: number,
};

interface IssueSchema {
  expand: string,
  id: string,
  self: string,
  key: string,
  fields: {
    created: string,
  }
}

export const fetchIssues = createAsyncThunk(
  "issues/fetch",
  async (args: {boardId: number}) => {
    let results: GetIssuesForBoardSchema[] = [];
    let startAt = 0, maxResults = 50, total = 51;
    while (startAt + maxResults < total) {
      try {
        const response: GetIssuesForBoardSchema = await jira.board.getIssuesForBoard({
          boardId: args.boardId,
          fields: ["created"],
          maxResults: maxResults,
          startAt: startAt,
        });
        maxResults = response.maxResults;
        total = response.total;
        results.push(response);
      } catch (error) {
        throw error;
      } finally {
        startAt += maxResults;
      }
    }
    return results;
  }
);

const issuesAdapter = createEntityAdapter<Issue>();

const issuesSlice = createSlice({
  name: "issues",
  initialState: issuesAdapter.getInitialState(),
  reducers: {

  },
  extraReducers: builder => {
    builder.addCase(
      fetchIssues.fulfilled,
      (state: EntityState<Issue>, { payload }: { payload: GetIssuesForBoardSchema[] }) => {
        payload.forEach(response => 
          issuesAdapter.addMany(
            state,
            response.issues.map(issueSchema => ({
                id: parseInt(issueSchema.id),
                key: issueSchema.key,
                created: Date.parse(issueSchema.fields.created),
              }) as Issue
            )
          )
        )
      }
    );
  },
});

export default issuesSlice.reducer;