import { createAsyncThunk, createEntityAdapter, createSlice, EntityState } from "@reduxjs/toolkit";

import { RootState } from "..";
import { jira } from "./auth";

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
    customfield_10002: number | null,
    issuelinks: {
      id: string,
      self: string,
      type: {
        id: string,
        name: string,
        inward: string,
        outward: string,
        self: string,
      },
      inwardIssue?: {
        id: string,
        key: string,
      },
      outwardIssue?: {
        id: string,
        key: string,
      }
    },
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
    let results: Promise<GetIssuesForBoardSchema>[] = [];
    const initialFetch: GetIssuesForBoardSchema = await jira.board.getIssuesForBoard({
      boardId: args.boardId,
      fields: ["created"],
      maxResults: 0,
      startAt: 0,
    });
    let startAt = 0, maxResults = 256, { total } = initialFetch;
    while (startAt < total) {
      try {
        const response: Promise<GetIssuesForBoardSchema> = jira.board.getIssuesForBoard({
          boardId: args.boardId,
          fields: ["created", "customfield_10002", "issuelinks", "issuetype", "parent", "priority", "status", "summary"],
          maxResults: maxResults,
          startAt: startAt,
        });
        results.push(response);
      } catch (error) {
        throw error;
      } finally {
        startAt += maxResults;
      }
    }
    return Promise.all(results);
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
                storyPoints: issueSchema.fields.customfield_10002,
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