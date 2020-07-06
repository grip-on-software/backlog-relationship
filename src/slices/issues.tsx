import { createAsyncThunk, createEntityAdapter, createSlice, EntityState } from "@reduxjs/toolkit";

import { RootState } from "..";
import { jira } from "./auth";
import { SprintSchema } from "./sprints";

interface GetIssuesForBoardSchema {
  expand: string,
  startAt: number,
  maxResults: number,
  total: number,
  issues: IssueSchema[]
};

interface IssueLink {
  direction: "inward" | "outward",
  id: number,
  issueId: number,
  typeId: number,
}

export interface Issue {
  closedSprints: number[],
  created: number,
  id: number,
  issueTypeId: number,
  key: string,
  links: IssueLink[],
  parentId?: number,
  priorityId: number,
  sprintId?: number,
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
    closedSprints?: SprintSchema[],
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
    }[],
    issuetype: {
      id: string,
    },
    parent?: {
      id: string,
    },
    priority: {
      id: string,
    },
    sprint?: SprintSchema,
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
          fields: [
            "closedSprints",
            "created",
            "customfield_10002",
            "issuelinks",
            "issuetype",
            "parent",
            "priority",
            "sprint",
            "status",
            "summary"
          ],
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
                closedSprints: issueSchema.fields.closedSprints
                  ? issueSchema.fields.closedSprints.map(sprint => sprint.id)
                  : [],
                created: Date.parse(issueSchema.fields.created),
                id: parseInt(issueSchema.id),
                issueTypeId: parseInt(issueSchema.fields.issuetype.id),
                key: issueSchema.key,
                links: issueSchema.fields.issuelinks
                  .map(issueLink => ({
                    direction: issueLink.inwardIssue
                      ? "inward"
                      : "outward",
                    id: parseInt(issueLink.id),
                    issueId: parseInt(issueLink.inwardIssue
                      ? issueLink.inwardIssue.id
                      : issueLink.outwardIssue!.id),
                    typeId: parseInt(issueLink.type.id),
                  })),
                parentId: issueSchema.fields.parent
                  ? parseInt(issueSchema.fields.parent.id)
                  : undefined,
                priorityId: parseInt(issueSchema.fields.priority.id),
                sprintId: issueSchema.fields.sprint
                  ? issueSchema.fields.sprint.id
                  : undefined,
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