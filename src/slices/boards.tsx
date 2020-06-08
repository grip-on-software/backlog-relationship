import { createAsyncThunk, createEntityAdapter, createSlice, EntityState } from "@reduxjs/toolkit";

import { RootState } from "..";
import { jira } from "./auth";

export interface Board {
  id: number,
  label: string,
};

interface BoardSchema {
  id: number,
  name: string,
  self: string,
  type: "kanban" | "scrum"
}

interface GetAllBoardsSchema {
  isLast: boolean,
  maxResults: number,
  startAt: number,
  values: BoardSchema[]
}

export const fetchBoards = createAsyncThunk(
  "boards/fetch",
  async () => {
    let results: GetAllBoardsSchema[] = [];
    let startAt = 0, maxResults = 50;
    let isLast = false;
    while (!isLast) {
      try {
        const response: GetAllBoardsSchema = await jira.board.getAllBoards({
          startAt: startAt,
          type: "scrum",
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

const boardsAdapter = createEntityAdapter<Board>();

const boardsSlice = createSlice({
  name: "boards",
  initialState: boardsAdapter.getInitialState(),
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      fetchBoards.fulfilled,
      (state: EntityState<Board>, { payload }: { payload: GetAllBoardsSchema[] }) => {
        payload.forEach(response => 
          boardsAdapter.addMany(
            state,
            response.values.map(boardSchema => ({
                id: boardSchema.id,
                label: boardSchema.name
              }) as Board
            )
          )
        )
      }
    );
  },
});

export const {
  selectAll: selectAllBoards,
} = boardsAdapter.getSelectors<RootState>(state => state.boards);

export default boardsSlice.reducer;