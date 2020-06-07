import { createAsyncThunk, createEntityAdapter, createSlice, EntityState } from "@reduxjs/toolkit";

import { RootState } from "..";
import { jira } from "./auth";

export interface Board {
  id: number,
  label: string,
};

export const fetchBoards = createAsyncThunk(
  "boards/fetch",
  async () => {
    let isLast = false;
    let results: Promise<any>[] = [];
    let startAt = 0;
    while (!isLast) {
      const response = await jira.board.getAllBoards({
        startAt: startAt,
        type: "scrum",
      });
      isLast = response.isLast;
      startAt += response.maxResults;
      results.push(response)
    }
    return Promise.all(results);
  }
);

const boardsAdapter = createEntityAdapter<Board>();

const boardsSlice = createSlice({
  name: "boards",
  initialState: boardsAdapter.getInitialState(),
  reducers: {

  },
  extraReducers: builder => {
    builder.addCase(
      fetchBoards.fulfilled,
      (state: EntityState<Board>, action: { payload: Board[] }) => {
        console.log(action.payload);
      }
    );
  },
});

export const boardsSelectors = boardsAdapter.getSelectors<RootState>(
  state => state.boards
);

export default boardsSlice.reducer;