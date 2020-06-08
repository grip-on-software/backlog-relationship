import { createAsyncThunk, createEntityAdapter, createSlice, EntityState } from "@reduxjs/toolkit";

import { RootState } from "..";
import { jira } from "./auth";

interface Sprint {
  id: number,
  label: string,
  startDate: number,
  endDate: number,
  completeDate: number,
};

export const fetchSprints = createAsyncThunk(
  "sprints/fetch",
  async () => {
    
  }
);

const sprintsAdapter = createEntityAdapter<Sprint>();

const sprintsSlice = createSlice({
  name: "sprints",
  initialState: sprintsAdapter.getInitialState(),
  reducers: {

  },
  extraReducers: builder => {
  },
});

export const sprintsSelectors = sprintsAdapter.getSelectors<RootState>(
  state => state.sprints
);

export default sprintsSlice.reducer;