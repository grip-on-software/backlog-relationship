import { createAsyncThunk, createEntityAdapter, createSlice, EntityState } from "@reduxjs/toolkit";

import { jira } from "./auth";
import { RootState } from "..";

interface GetIssuesForBoardSchema {
  expand: string,
  startAt: number,
  maxResults: number,
  total: number,
  issues: IssueSchema[]
};

export interface Issue {
  created: number,
  id: number,
  issueTypeId: number,
  key: string,
  parentId?: number,
  priorityId: number,
  statusId: number,
  storyPoints?: number
  summary: string,
};

interface IssueSchema {
  expand: string,
  id: string,
  self: string,
  key: string,
  fields: {
    created: string,
    issuetype: {
      id: string,
    },
    parent?: {
      id: string,
    },
    priority: {
      id: string,
    },
    status: {
      id: string,
    },
    summary: string,
  }
}

export const fetchIssues = createAsyncThunk(
  "issues/fetch",
  async (args: {boardId: number}) => {
    let results: GetIssuesForBoardSchema[] = [];
    let startAt = 0, maxResults = 256, total;
    while (!total || startAt + maxResults < total) {
      try {
        const response: GetIssuesForBoardSchema = await jira.board.getIssuesForBoard({
          boardId: args.boardId,
          fields: ["created", "issuetype", "parent", "priority", "status", "summary"],
          maxResults: maxResults,
          startAt: startAt,
        });
        if (response.maxResults < maxResults) {
          maxResults = response.maxResults;
        }
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
            response.issues.map(
              issueSchema => ({
                created: Date.parse(issueSchema.fields.created),
                id: parseInt(issueSchema.id),
                issueTypeId: parseInt(issueSchema.fields.issuetype.id),
                key: issueSchema.key,
                parentId: issueSchema.fields.parent ? parseInt(issueSchema.fields.parent.id) : undefined,
                priorityId: parseInt(issueSchema.fields.priority.id),
                statusId: parseInt(issueSchema.fields.status.id),
                summary: issueSchema.fields.summary,
              }) as Issue
            )
          )
        )
      }
    );
  },
});

export const {
  selectAll: selectAllIssues,
  selectById: selectIssueById,
  selectEntities: selectIssueEntities,
} = issuesAdapter.getSelectors<RootState>(state => state.issues);

export default issuesSlice.reducer;