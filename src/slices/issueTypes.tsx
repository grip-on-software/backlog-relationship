import { createAsyncThunk, createEntityAdapter, createSlice, EntityState } from "@reduxjs/toolkit";

import { RootState } from "..";
import { jira } from "./auth";

export interface IssueType {
  description: string,
  iconURL: string,
  id: number,
  name: string,
};

interface IssueTypeSchema {
  avatarId: number,
  description: string,
  iconUrl: string,
  id: string,
  name: string,
  self: string,
  subtask: boolean,
}

export const fetchIssueTypes = createAsyncThunk(
  "issueTypes/fetch",
  async () => {
    return jira.issueType.getAllIssueTypes() as Promise<IssueTypeSchema[]>;
  }
);

const issueTypesAdapter = createEntityAdapter<IssueType>();

const issueTypesSlice = createSlice({
  name: "issueTypes",
  initialState: issueTypesAdapter.getInitialState(),
  reducers: {

  },
  extraReducers: builder => {
    builder.addCase(
      fetchIssueTypes.fulfilled,
      (state: EntityState<IssueType>, { payload }: { payload: IssueTypeSchema[] }) => {
        issueTypesAdapter.addMany(
          state,
          payload.map(
            issueTypeSchema => ({
              description: issueTypeSchema.description,
              iconURL: issueTypeSchema.iconUrl,
              id: parseInt(issueTypeSchema.id),
              name: issueTypeSchema.name,
            }) as IssueType
          )
        )
      }
    );
  },
});

export const {
  selectEntities: selectIssueTypeEntities,
} = issueTypesAdapter.getSelectors<RootState>(state => state.issueTypes);

export default issueTypesSlice.reducer;