import { createAsyncThunk, createEntityAdapter, createSlice, EntityState } from "@reduxjs/toolkit";

import { RootState } from "..";
import { jira } from "./auth";

export enum Statuses {
  Open = 1,
  InProgress = 3,
  Reopened,
  Resolved,
  Closed,
  Done = 10008,
  Backlog = 10107,
  SelectedForDevelopment,
  Waiting = 10310,
  WontDo = 10707
}

export interface Status {
  description: string,
  iconURL: string,
  id: number,
  name: string,
  statusCategoryId: number,
};

interface StatusSchema {
  description: string,
  iconUrl: string,
  id: string,
  name: string,
  statusCategory: {
    id: number,
  }
}

export const fetchStatuses = createAsyncThunk(
  "statuses/fetch",
  async () => {
    return jira.status.getAllStatuses() as Promise<StatusSchema[]>;
  }
);

const statusesAdapter = createEntityAdapter<Status>();

const statusesSlice = createSlice({
  name: "statuses",
  initialState: statusesAdapter.getInitialState(),
  reducers: {

  },
  extraReducers: builder => {
    builder.addCase(
      fetchStatuses.fulfilled,
      (state: EntityState<Status>, { payload }: { payload: StatusSchema[] }) => {
        statusesAdapter.addMany(
          state,
          payload.map(
            statusSchema => ({
              description: statusSchema.description,
              iconURL: statusSchema.iconUrl,
              id: parseInt(statusSchema.id),
              name: statusSchema.name,
              statusCategoryId: statusSchema.statusCategory.id,
            }) as Status
          )
        )
      }
    );
  },
});

export const {
  selectById: selectStatusById,
  selectEntities: selectStatusEntities,
} = statusesAdapter.getSelectors<RootState>(state => state.statuses);

export default statusesSlice.reducer;