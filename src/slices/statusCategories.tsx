import { createAsyncThunk, createEntityAdapter, createSlice, EntityState } from "@reduxjs/toolkit";

import { RootState } from "..";
import { jira } from "./auth";

export interface StatusCategory {
  id: number,
  key: string,
  name: string,
};

interface StatusCategorySchema {
  colorName: string,
  id: number,
  key: string,
  name: string,
}

export const fetchStatusCategories = createAsyncThunk(
  "statusCategories/fetch",
  async () => {
    return jira.statusCategory.getAllStatusCategories() as Promise<StatusCategorySchema[]>;
  }
);

const statusCategoriesAdapter = createEntityAdapter<StatusCategory>();

const statusCategoriesSlice = createSlice({
  name: "statusCategories",
  initialState: statusCategoriesAdapter.getInitialState(),
  reducers: {

  },
  extraReducers: builder => {
    builder.addCase(
      fetchStatusCategories.fulfilled,
      (state: EntityState<StatusCategory>, { payload }: { payload: StatusCategorySchema[] }) => {
        statusCategoriesAdapter.addMany(
          state,
          payload.map(
            statusCategorySchema => ({
              id: statusCategorySchema.id,
              key: statusCategorySchema.key,
              name: statusCategorySchema.name,
            }) as StatusCategory
          )
        )
      }
    );
  },
});

export const {
  selectEntities: selectStatusCategoryEntities,
} = statusCategoriesAdapter.getSelectors<RootState>(state => state.statusCategories);

export default statusCategoriesSlice.reducer;