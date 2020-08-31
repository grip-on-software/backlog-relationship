import { createAsyncThunk, createEntityAdapter, createSlice, EntityState } from "@reduxjs/toolkit";

import { RootState } from "..";
import { jira } from "./auth";

interface GetAllSprintsSchema {
  isLast: boolean,
  maxResults: number,
  startAt: number,
  values: SprintSchema[]
};

export enum SprintState {
  Active = "active",
  Closed = "closed",
  Future = "future",
}

interface Sprint {
  id: number,
  label: string,
  startDate?: number,
  endDate?: number,
  completeDate?: number,
  state: SprintState,
};

export interface SprintSchema {
  id: number,
  self: string,
  state: SprintState,
  name: string,
  startDate?: string,
  endDate?: string,
  completeDate?: string,
  originBoardId?: number,
}

export const fetchSprints = createAsyncThunk(
  "sprints/fetch",
  async (args: {boardId: number}) => {
    let results: GetAllSprintsSchema[] = [];
    let startAt = 0, maxResults = 50;
    let isLast = false;
    while (!isLast) {
      try {
        const response: GetAllSprintsSchema = await jira.board.getAllSprints({
          boardId: args.boardId,
          maxResults: maxResults,
          startAt: startAt,
        });
        maxResults = response.maxResults;
        isLast = response.isLast;
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

const sprintsAdapter = createEntityAdapter<Sprint>({
  sortComparer: (a, b) => {
    if (a.completeDate) {
      if (b.completeDate) {
        return b.completeDate - a.completeDate;
      } else {
        return 1;
      }
    } else {
      if (b.completeDate) {
        return -1;
      } else {
        if (a.startDate) {
          if (b.startDate) {
            return b.startDate - a.startDate;
          } else {
            return 1;
          }
        } else {
          if (b.startDate) {
            return -1;
          } else {
            return b.id - a.id;
          }
        }
      }
    }
  }
});

const sprintsSlice = createSlice({
  name: "sprints",
  initialState: sprintsAdapter.getInitialState(),
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      fetchSprints.fulfilled,
      (state: EntityState<Sprint>, { payload }: { payload: GetAllSprintsSchema[] }) => {
        payload.forEach(response => 
          sprintsAdapter.addMany(
            state,
            response.values.map(sprintSchema => ({
                id: sprintSchema.id,
                label: sprintSchema.name,
                startDate: sprintSchema.startDate ? Date.parse(sprintSchema.startDate) : undefined,
                endDate: sprintSchema.endDate ? Date.parse(sprintSchema.endDate) : undefined,
                completeDate: sprintSchema.completeDate ? Date.parse(sprintSchema.completeDate) : undefined,
                state: sprintSchema.state,
              }) as Sprint
            )
          )
        )
      }
    );
  },
});

export const {
  selectAll: selectAllSprints,
  selectEntities: selectSprintEntities,
  selectIds: selectSprintIds,
} = sprintsAdapter.getSelectors<RootState>(state => state.sprints);

export default sprintsSlice.reducer;